package com.suaempresa.gestao.service;

import com.suaempresa.gestao.domain.dto.MembroDetalhadoDTO;
import com.suaempresa.gestao.domain.dto.MembroFormDTO;
import com.suaempresa.gestao.domain.dto.MembroSimplificadoDTO;
import com.suaempresa.gestao.domain.entity.Cargo;
import com.suaempresa.gestao.domain.entity.Membro;
import com.suaempresa.gestao.repository.CargoRepository;
import com.suaempresa.gestao.repository.MembroRepository;
import com.suaempresa.gestao.exception.RegraNegocioException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MembroService {

    private final MembroRepository membroRepository;
    private final CargoRepository cargoRepository;

    @Transactional(readOnly = true)
    public List<MembroSimplificadoDTO> listarMembrosAtivos() {
        return membroRepository.findAllAtivosSimplificado();
    }

    @Transactional(readOnly = true)
    public MembroDetalhadoDTO buscarPorId(Long id) {
        Membro membro = membroRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Membro não encontrado"));
        return MembroDetalhadoDTO.fromEntity(membro);
    }

    @Transactional
    public MembroDetalhadoDTO criar(MembroFormDTO dto) {
        if (dto.nomeCompleto() == null || dto.nomeCompleto().isBlank()) {
            throw new RegraNegocioException("O nome completo é obrigatório para o cadastro.");
        }
        Membro membro = new Membro();
        atualizarDadosEntidade(membro, dto);
        membro = membroRepository.save(membro);
        return MembroDetalhadoDTO.fromEntity(membro);
    }

    @Transactional
    public MembroDetalhadoDTO atualizar(Long id, MembroFormDTO dto) {
        Membro membro = membroRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Membro não encontrado"));
        atualizarDadosEntidade(membro, dto);
        return MembroDetalhadoDTO.fromEntity(membro);
    }

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
            String sexoPadronizado = dto.sexo().trim().toLowerCase().equals("masculino") ? "Masculino" : "Feminino";
            membro.setSexo(sexoPadronizado);
        }

        if (dto.cpf() != null) {
            membro.setCpf(dto.cpf().replaceAll("\\D", ""));
        }

        if (dto.cargoId() != null) {
            Cargo cargo = cargoRepository.findById(dto.cargoId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cargo não encontrado"));
            membro.setCargo(cargo);
        }

        if (dto.liderDiretoId() != null) {
            Membro lider = membroRepository.findById(dto.liderDiretoId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Líder não encontrado"));
            
            if (lider.getCargo() == null) {
                throw new RegraNegocioException("Não é possível associar este líder: o líder selecionado não possui um cargo cadastrado.");
            }
            
            Integer peso = lider.getCargo().getPesoHierarquico();
            if (peso == null || (peso != 1 && peso != 2)) {
                throw new RegraNegocioException("Não é possível associar este líder: o líder selecionado deve possuir um cargo com peso hierárquico 1 ou 2.");
            }
            
            membro.setLiderDireto(lider);
        }
    }

    private void validarSexo(String sexo) {
        if (sexo != null && !sexo.isBlank()) {
            String valor = sexo.trim().toLowerCase();
            if (!valor.equals("masculino") && !valor.equals("feminino")) {
                throw new RegraNegocioException("O campo 'sexo' deve ser 'Masculino' ou 'Feminino'.");
            }
        }
    }

    @Transactional(readOnly = true)
    public byte[] exportarCsv() {
        List<Membro> membros = membroRepository.findAllWithCargo();
        StringBuilder csvBuilder = new StringBuilder();
        
        // Cabeçalho completo com todos os campos (incluindo sexo)
        csvBuilder.append("id,nome_completo,whatsapp,email,foto_perfil_url,status_cadastro,data_adesao,data_nascimento,sexo,titulo_cargo\n");

        for (Membro m : membros) {
            String cargoTitulo = m.getCargo() != null ? m.getCargo().getTitulo() : "";
            String dataAdesaoStr = m.getDataAdesao() != null ? m.getDataAdesao().toString() : "";
            String dataNascStr = m.getDataNascimento() != null ? m.getDataNascimento().toString() : "";
            String sexoStr = m.getSexo() != null ? m.getSexo() : "";
            
            csvBuilder.append(String.format("%d,\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"\n",
                    m.getId(),
                    escapeCsv(m.getNomeCompleto()),
                    escapeCsv(m.getWhatsapp()),
                    escapeCsv(m.getEmail()),
                    escapeCsv(m.getFotoPerfilUrl()),
                    escapeCsv(m.getStatusCadastro()),
                    dataAdesaoStr,
                    dataNascStr,
                    escapeCsv(sexoStr),
                    escapeCsv(cargoTitulo)
            ));
        }

        return csvBuilder.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String escapeCsv(String data) {
        if (data == null) return "";
        return data.replace("\"", "\"\"");
    }

    @Transactional
    public void importarCsv(MultipartFile file) {
        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            boolean firstLine = true;
            List<Membro> membrosToSave = new ArrayList<>();

            while ((line = br.readLine()) != null) {
                if (firstLine) {
                    firstLine = false;
                    continue;
                }

                String[] columns = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)", -1);
                if (columns.length < 10) continue;

                String nome = unescapeCsv(columns[1]);
                String whatsapp = unescapeCsv(columns[2]);
                String email = unescapeCsv(columns[3]);
                String fotoPerfil = unescapeCsv(columns[4]);
                String status = unescapeCsv(columns[5]);
                String dataAdesaoStr = unescapeCsv(columns[6]);
                String dataNascStr = unescapeCsv(columns[7]);
                String sexo = unescapeCsv(columns[8]);
                String tituloCargo = unescapeCsv(columns[9]);

                Membro membro = new Membro();
                membro.setNomeCompleto(nome);
                membro.setWhatsapp(whatsapp);
                membro.setEmail(email);
                membro.setFotoPerfilUrl(fotoPerfil);
                membro.setStatusCadastro(status);
                if (sexo != null && !sexo.isBlank()) {
                    validarSexo(sexo);
                    String sexoPadronizado = sexo.trim().toLowerCase().equals("masculino") ? "Masculino" : "Feminino";
                    membro.setSexo(sexoPadronizado);
                }

                if (dataAdesaoStr != null && !dataAdesaoStr.isBlank()) {
                    try {
                        membro.setDataAdesao(LocalDate.parse(dataAdesaoStr.trim()));
                    } catch (DateTimeParseException e) {
                        // Resiliente: ignora erro de parse na data e segue adiante
                    }
                }
                if (dataNascStr != null && !dataNascStr.isBlank()) {
                    try {
                        membro.setDataNascimento(LocalDate.parse(dataNascStr.trim()));
                    } catch (DateTimeParseException e) {
                        // Resiliente: ignora erro de parse na data
                    }
                }

                if (tituloCargo != null && !tituloCargo.isBlank()) {
                    Cargo cargo = cargoRepository.findByTituloIgnoreCase(tituloCargo.trim())
                            .orElseGet(() -> {
                                Cargo novoCargo = Cargo.builder()
                                        .titulo(tituloCargo.trim())
                                        .pesoHierarquico(0)
                                        .build();
                                return cargoRepository.save(novoCargo);
                            });
                    membro.setCargo(cargo);
                }

                membrosToSave.add(membro);
            }

            membroRepository.saveAll(membrosToSave);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Erro ao processar o arquivo CSV.", e);
        }
    }

    private String unescapeCsv(String data) {
        if (data == null) return "";
        String trimmed = data.trim();
        if (trimmed.startsWith("\"") && trimmed.endsWith("\"") && trimmed.length() >= 2) {
            trimmed = trimmed.substring(1, trimmed.length() - 1);
        }
        return trimmed.replace("\"\"", "\"");
    }
}
