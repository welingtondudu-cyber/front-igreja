package com.suaempresa.gestao.service;

import com.suaempresa.gestao.domain.dto.MembroDetalhadoDTO;
import com.suaempresa.gestao.domain.dto.MembroFormDTO;
import com.suaempresa.gestao.domain.dto.MembroSimplificadoDTO;
import com.suaempresa.gestao.domain.entity.Cargo;
import com.suaempresa.gestao.domain.entity.Membro;
import com.suaempresa.gestao.exception.RegraNegocioException;
import com.suaempresa.gestao.repository.CargoRepository;
import com.suaempresa.gestao.repository.MembroRepository;
import com.suaempresa.gestao.repository.MembroSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MembroService {

    private final MembroRepository membroRepository;
    private final CargoRepository cargoRepository;

    // ─── LISTAR COM FILTROS + PAGINAÇÃO ────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<MembroDetalhadoDTO> listarComFiltros(
            String nome,
            String cpf,
            Long cargoId,
            String tituloCargo,
            String statusCadastro,
            Long liderDiretoId,
            LocalDate nascimentoDe,
            LocalDate nascimentoAte,
            Pageable pageable
    ) {
        Specification<Membro> spec = MembroSpecification.comFiltros(
                nome, cpf, cargoId, tituloCargo, statusCadastro, liderDiretoId,
                nascimentoDe, nascimentoAte
        );
        return membroRepository.findAll(spec, pageable)
                .map(MembroDetalhadoDTO::fromEntity);
    }

    // ─── BUSCAR POR ID ─────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public MembroDetalhadoDTO buscarPorId(Long id) {
        Membro membro = membroRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Membro não encontrado"));
        return MembroDetalhadoDTO.fromEntity(membro);
    }

    // ─── CRIAR ─────────────────────────────────────────────────────────────────

    @Transactional
    public MembroDetalhadoDTO criar(MembroFormDTO dto) {
        if (dto.nomeCompleto() == null || dto.nomeCompleto().isBlank()) {
            throw new RegraNegocioException("O nome completo é obrigatório para o cadastro.");
        }
        // Validar CPF único antes de salvar
        if (dto.cpf() != null && !dto.cpf().isBlank()) {
            String cpfLimpo = dto.cpf().replaceAll("\\D", "");
            if (membroRepository.findByCpf(cpfLimpo).isPresent()) {
                throw new RegraNegocioException("Já existe um membro cadastrado com este CPF.");
            }
        }
        Membro membro = new Membro();
        atualizarDadosEntidade(membro, dto);
        try {
            membro = membroRepository.save(membro);
        } catch (DataIntegrityViolationException e) {
            throw new RegraNegocioException("CPF já cadastrado para outro membro.");
        }
        return MembroDetalhadoDTO.fromEntity(membro);
    }

    // ─── ATUALIZAR ─────────────────────────────────────────────────────────────

    @Transactional
    public MembroDetalhadoDTO atualizar(Long id, MembroFormDTO dto) {
        Membro membro = membroRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Membro não encontrado"));

        // Validar CPF único para outro membro
        if (dto.cpf() != null && !dto.cpf().isBlank()) {
            String cpfLimpo = dto.cpf().replaceAll("\\D", "");
            Optional<Membro> existente = membroRepository.findByCpf(cpfLimpo);
            if (existente.isPresent() && !existente.get().getId().equals(id)) {
                throw new RegraNegocioException("Já existe outro membro cadastrado com este CPF.");
            }
        }
        atualizarDadosEntidade(membro, dto);
        try {
            membroRepository.flush();
        } catch (DataIntegrityViolationException e) {
            throw new RegraNegocioException("CPF já cadastrado para outro membro.");
        }
        return MembroDetalhadoDTO.fromEntity(membro);
    }

    // ─── EXPORTAR CSV (UTF-8 com BOM para Excel) ───────────────────────────────

    @Transactional(readOnly = true)
    public byte[] exportarCsv() {
        List<Membro> membros = membroRepository.findAllWithCargo();
        StringBuilder csv = new StringBuilder();

        // Cabeçalho
        csv.append("id,nome_completo,cpf,whatsapp,email,foto_perfil_url,status_cadastro,data_adesao,data_nascimento,sexo,titulo_cargo\n");

        for (Membro m : membros) {
            String cargoTitulo = m.getCargo() != null ? m.getCargo().getTitulo() : "";
            csv.append(String.format("%d,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s\n",
                    m.getId(),
                    csvField(m.getNomeCompleto()),
                    csvField(m.getCpf()),
                    csvField(m.getWhatsapp()),
                    csvField(m.getEmail()),
                    csvField(m.getFotoPerfilUrl()),
                    csvField(m.getStatusCadastro()),
                    m.getDataAdesao() != null ? m.getDataAdesao().toString() : "",
                    m.getDataNascimento() != null ? m.getDataNascimento().toString() : "",
                    csvField(m.getSexo()),
                    csvField(cargoTitulo)
            ));
        }

        // BOM UTF-8 (EF BB BF) garante que o Excel abre corretamente sem desconfigurar caracteres
        byte[] bom = new byte[]{(byte) 0xEF, (byte) 0xBB, (byte) 0xBF};
        byte[] content = csv.toString().getBytes(StandardCharsets.UTF_8);
        byte[] result = new byte[bom.length + content.length];
        System.arraycopy(bom, 0, result, 0, bom.length);
        System.arraycopy(content, 0, result, bom.length, content.length);
        return result;
    }

    // ─── IMPORTAR CSV ─────────────────────────────────────────────────────────

    @Transactional
    public void importarCsv(MultipartFile file) {
        try {
            // Detecta e remove BOM UTF-8 se presente
            InputStream inputStream = file.getInputStream();
            byte[] primeiros = inputStream.readNBytes(3);
            if (primeiros[0] != (byte) 0xEF || primeiros[1] != (byte) 0xBB || primeiros[2] != (byte) 0xBF) {
                // Não tem BOM: reabrir do início
                inputStream = file.getInputStream();
            }

            try (BufferedReader br = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
                String line;
                boolean firstLine = true;
                List<Membro> membrosToSave = new ArrayList<>();

                while ((line = br.readLine()) != null) {
                    if (firstLine) { firstLine = false; continue; }
                    if (line.isBlank()) continue;

                    String[] cols = splitCsvLine(line);
                    if (cols.length < 11) continue;

                    String nome       = unescapeCsv(cols[1]);
                    String cpf        = unescapeCsv(cols[2]).replaceAll("\\D", "");
                    String whatsapp   = unescapeCsv(cols[3]);
                    String email      = unescapeCsv(cols[4]);
                    String fotoPerfil = unescapeCsv(cols[5]);
                    String status     = unescapeCsv(cols[6]);
                    String dataAdesao = unescapeCsv(cols[7]);
                    String dataNasc   = unescapeCsv(cols[8]);
                    String sexo       = unescapeCsv(cols[9]);
                    String tituloCargo= unescapeCsv(cols[10]);

                    // Upsert por CPF: atualiza se já existir, cria se não existir
                    Membro membro;
                    if (!cpf.isBlank()) {
                        membro = membroRepository.findByCpf(cpf).orElse(new Membro());
                    } else {
                        membro = new Membro();
                    }

                    if (nome != null && !nome.isBlank()) membro.setNomeCompleto(nome);
                    if (!cpf.isBlank()) membro.setCpf(cpf);
                    if (whatsapp != null && !whatsapp.isBlank()) membro.setWhatsapp(whatsapp);
                    if (email != null && !email.isBlank()) membro.setEmail(email);
                    if (fotoPerfil != null && !fotoPerfil.isBlank()) membro.setFotoPerfilUrl(fotoPerfil);
                    if (status != null && !status.isBlank()) membro.setStatusCadastro(status);

                    if (sexo != null && !sexo.isBlank()) {
                        validarSexo(sexo);
                        membro.setSexo(sexo.trim().equalsIgnoreCase("masculino") ? "Masculino" : "Feminino");
                    }
                    parseDateSafe(dataAdesao).ifPresent(membro::setDataAdesao);
                    parseDateSafe(dataNasc).ifPresent(membro::setDataNascimento);

                    if (tituloCargo != null && !tituloCargo.isBlank()) {
                        Cargo cargo = cargoRepository.findByTituloIgnoreCase(tituloCargo.trim())
                                .orElseGet(() -> cargoRepository.save(
                                        Cargo.builder().titulo(tituloCargo.trim()).pesoHierarquico(0).build()
                                ));
                        membro.setCargo(cargo);
                    }

                    membrosToSave.add(membro);
                }

                membroRepository.saveAll(membrosToSave);
            }
        } catch (RegraNegocioException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Erro ao processar o arquivo CSV: " + e.getMessage(), e);
        }
    }

    // ─── HELPERS ───────────────────────────────────────────────────────────────

    private void atualizarDadosEntidade(Membro membro, MembroFormDTO dto) {
        if (dto.nomeCompleto() != null) membro.setNomeCompleto(dto.nomeCompleto());
        if (dto.whatsapp() != null) membro.setWhatsapp(dto.whatsapp());
        if (dto.email() != null) membro.setEmail(dto.email());
        if (dto.fotoPerfilUrl() != null) membro.setFotoPerfilUrl(dto.fotoPerfilUrl());
        if (dto.statusCadastro() != null) membro.setStatusCadastro(dto.statusCadastro());
        if (dto.dataAdesao() != null) membro.setDataAdesao(dto.dataAdesao());
        if (dto.dataNascimento() != null) membro.setDataNascimento(dto.dataNascimento());
        if (dto.sexo() != null) {
            validarSexo(dto.sexo());
            membro.setSexo(dto.sexo().trim().equalsIgnoreCase("masculino") ? "Masculino" : "Feminino");
        }
        if (dto.cpf() != null) membro.setCpf(dto.cpf().replaceAll("\\D", ""));
        if (dto.cargoId() != null) {
            Cargo cargo = cargoRepository.findById(dto.cargoId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cargo não encontrado"));
            membro.setCargo(cargo);
        }
        if (dto.liderDiretoId() != null) {
            Membro lider = membroRepository.findById(dto.liderDiretoId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Líder não encontrado"));
            if (lider.getCargo() == null) {
                throw new RegraNegocioException("O líder selecionado não possui cargo cadastrado.");
            }
            Integer peso = lider.getCargo().getPesoHierarquico();
            if (peso == null || (peso != 1 && peso != 2)) {
                throw new RegraNegocioException("O líder deve possuir cargo com peso hierárquico 1 ou 2.");
            }
            membro.setLiderDireto(lider);
        }
    }

    private void validarSexo(String sexo) {
        if (sexo != null && !sexo.isBlank()) {
            String v = sexo.trim().toLowerCase();
            if (!v.equals("masculino") && !v.equals("feminino")) {
                throw new RegraNegocioException("O campo 'sexo' deve ser 'Masculino' ou 'Feminino'.");
            }
        }
    }

    /** Formata um campo CSV: envolve em aspas e escapa aspas internas. */
    private String csvField(String value) {
        if (value == null || value.isBlank()) return "";
        return "\"" + value.replace("\"", "\"\"") + "\"";
    }

    /** Remove aspas e unescapa aspas duplicadas de um campo CSV. */
    private String unescapeCsv(String data) {
        if (data == null) return "";
        String t = data.trim();
        if (t.startsWith("\"") && t.endsWith("\"") && t.length() >= 2) {
            t = t.substring(1, t.length() - 1);
        }
        return t.replace("\"\"", "\"");
    }

    /** Divide uma linha CSV respeitando campos entre aspas. */
    private String[] splitCsvLine(String line) {
        return line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)", -1);
    }

    private Optional<LocalDate> parseDateSafe(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) return Optional.empty();
        try {
            return Optional.of(LocalDate.parse(dateStr.trim()));
        } catch (DateTimeParseException e) {
            return Optional.empty();
        }
    }

    // Mantido para compatibilidade com VotacaoService
    @Transactional(readOnly = true)
    public List<MembroSimplificadoDTO> listarMembrosAtivos() {
        return membroRepository.findAllAtivosSimplificado();
    }
}
