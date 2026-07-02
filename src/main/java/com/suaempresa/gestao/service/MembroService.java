package com.suaempresa.gestao.service;

import com.suaempresa.gestao.domain.dto.MembroDetalhadoDTO;
import com.suaempresa.gestao.domain.dto.MembroFormDTO;
import com.suaempresa.gestao.domain.dto.MembroSimplificadoDTO;
import com.suaempresa.gestao.domain.entity.Cargo;
import com.suaempresa.gestao.domain.entity.Membro;
import com.suaempresa.gestao.domain.entity.MembroGrupo;
import com.suaempresa.gestao.domain.entity.TipoGrupo;
import com.suaempresa.gestao.domain.entity.Grupo;
import com.suaempresa.gestao.exception.RegraNegocioException;
import com.suaempresa.gestao.repository.CargoRepository;
import com.suaempresa.gestao.repository.MembroRepository;
import com.suaempresa.gestao.repository.MembroSpecification;
import com.suaempresa.gestao.repository.GrupoRepository;
import com.suaempresa.gestao.repository.MembroGrupoRepository;
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

import com.suaempresa.gestao.domain.entity.MembroRelacionamento;
import com.suaempresa.gestao.repository.MembroRelacionamentoRepository;
import com.suaempresa.gestao.domain.dto.MembroRelacionamentoDTO;
import com.suaempresa.gestao.domain.dto.MembroRelacionamentoFormDTO;

import com.suaempresa.gestao.domain.entity.MembroHistorico;
import com.suaempresa.gestao.repository.MembroHistoricoRepository;

@Service
@RequiredArgsConstructor
public class MembroService {

    private final MembroRepository membroRepository;
    private final CargoRepository cargoRepository;
    private final GrupoRepository grupoRepository;
    private final MembroGrupoRepository membroGrupoRepository;
    private final MembroHistoricoRepository membroHistoricoRepository;
    private final MembroRelacionamentoRepository membroRelacionamentoRepository;

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
            Long grupoId,
            Pageable pageable) {
        Specification<Membro> spec = MembroSpecification.comFiltros(
                nome, cpf, cargoId, tituloCargo, statusCadastro, liderDiretoId,
                nascimentoDe, nascimentoAte, grupoId);
        return membroRepository.findAll(spec, pageable)
                .map(MembroDetalhadoDTO::fromEntity);
    }

    // ─── BUSCAR POR ID ─────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public MembroDetalhadoDTO buscarPorId(Long id) {
        Membro membro = membroRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Membro não encontrado"));
        List<MembroRelacionamentoDTO> parentes = obterParentesDiretos(id);
        return MembroDetalhadoDTO.fromEntity(membro, parentes);
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
        atualizarGrupos(membro, dto.ministeriosIds(), dto.pequenosGruposIds());
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
        // Comparar e auditar alterações antes de alterar na entidade
        if (dto.nomeCompleto() != null) {
            registrarHistorico(membro, "Nome Completo", membro.getNomeCompleto(), dto.nomeCompleto());
        }
        if (dto.whatsapp() != null) {
            registrarHistorico(membro, "WhatsApp", membro.getWhatsapp(), dto.whatsapp());
        }
        if (dto.email() != null) {
            registrarHistorico(membro, "E-mail", membro.getEmail(), dto.email());
        }
        if (dto.statusCadastro() != null) {
            registrarHistorico(membro, "Status", membro.getStatusCadastro(), dto.statusCadastro());
        }
        if (dto.cpf() != null) {
            String oldCpf = membro.getCpf() != null ? membro.getCpf().replaceAll("\\D", "") : "";
            String newCpf = dto.cpf().replaceAll("\\D", "");
            registrarHistorico(membro, "CPF", oldCpf, newCpf);
        }
        if (dto.rg() != null) {
            registrarHistorico(membro, "RG", membro.getRg(), dto.rg());
        }
        if (dto.dataAdesao() != null) {
            String oldAdesao = membro.getDataAdesao() != null ? membro.getDataAdesao().toString() : "";
            registrarHistorico(membro, "Data de Adesão", oldAdesao, dto.dataAdesao().toString());
        }
        if (dto.dataNascimento() != null) {
            String oldNascimento = membro.getDataNascimento() != null ? membro.getDataNascimento().toString() : "";
            registrarHistorico(membro, "Data de Nascimento", oldNascimento, dto.dataNascimento().toString());
        }
        if (dto.sexo() != null) {
            registrarHistorico(membro, "Sexo", membro.getSexo(), dto.sexo());
        }

        atualizarDadosEntidade(membro, dto);
        try {
            membroRepository.saveAndFlush(membro);
        } catch (DataIntegrityViolationException e) {
            throw new RegraNegocioException("CPF já cadastrado para outro membro.");
        }
        atualizarGrupos(membro, dto.ministeriosIds(), dto.pequenosGruposIds());
        List<MembroRelacionamentoDTO> parentes = obterParentesDiretos(id);
        return MembroDetalhadoDTO.fromEntity(membro, parentes);
    }

    // ─── EXPORTAR CSV (UTF-8 com BOM para Excel) ───────────────────────────────

    @Transactional(readOnly = true)
    public byte[] exportarCsv(
            String nome,
            String cpf,
            Long cargoId,
            String tituloCargo,
            String statusCadastro,
            Long liderDiretoId,
            LocalDate nascimentoDe,
            LocalDate nascimentoAte,
            Long grupoId) {
        Specification<Membro> spec = MembroSpecification.comFiltros(
                nome, cpf, cargoId, tituloCargo, statusCadastro, liderDiretoId,
                nascimentoDe, nascimentoAte, grupoId);
        List<Membro> membros = membroRepository.findAll(spec);
        StringBuilder csv = new StringBuilder();

        // Cabeçalho
        csv.append(
                "matricula,nome_completo,cpf,whatsapp,email,foto_perfil_url,status_cadastro,data_adesao,data_nascimento,sexo,titulo_cargo,ministerios,pequenos_grupos\n");

        for (Membro m : membros) {
            String cargoTitulo = m.getCargo() != null ? m.getCargo().getTitulo() : "";
            String matricula = m.getId() != null ? String.format("%04d", m.getId()) : "";

            List<String> ministeriosList = new ArrayList<>();
            List<String> pequenosGruposList = new ArrayList<>();
            if (m.getMembrosGrupos() != null) {
                for (MembroGrupo mg : m.getMembrosGrupos()) {
                    if (mg.getGrupo() != null) {
                        if (mg.getGrupo().getTipoGrupo() == TipoGrupo.MINISTERIO) {
                            ministeriosList.add(mg.getGrupo().getNomeGrupo());
                        } else if (mg.getGrupo().getTipoGrupo() == TipoGrupo.PEQUENO_GRUPO
                                || mg.getGrupo().getTipoGrupo() == TipoGrupo.SOCIEDADE_INTERNA
                                || mg.getGrupo().getTipoGrupo() == TipoGrupo.SOCIEDADES_INTERNAS) {
                            pequenosGruposList.add(mg.getGrupo().getNomeGrupo());
                        }
                    }
                }
            }
            String ministeriosStr = String.join("; ", ministeriosList);
            String pequenosGruposStr = String.join("; ", pequenosGruposList);

            csv.append(String.format("%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s\n",
                    matricula,
                    csvField(m.getNomeCompleto()),
                    csvField(m.getCpf()),
                    csvField(m.getWhatsapp()),
                    csvField(m.getEmail()),
                    csvField(m.getFotoPerfilUrl()),
                    csvField(m.getStatusCadastro()),
                    m.getDataAdesao() != null ? m.getDataAdesao().toString() : "",
                    m.getDataNascimento() != null ? m.getDataNascimento().toString() : "",
                    csvField(m.getSexo()),
                    csvField(cargoTitulo),
                    csvField(ministeriosStr),
                    csvField(pequenosGruposStr)
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
                    if (firstLine) {
                        firstLine = false;
                        continue;
                    }
                    if (line.isBlank())
                        continue;

                    String[] cols = splitCsvLine(line);
                    if (cols.length < 11)
                        continue;

                    String nome = unescapeCsv(cols[1]);
                    String cpf = unescapeCsv(cols[2]).replaceAll("\\D", "");
                    String whatsapp = unescapeCsv(cols[3]);
                    String email = unescapeCsv(cols[4]);
                    String fotoPerfil = unescapeCsv(cols[5]);
                    String status = unescapeCsv(cols[6]);
                    String dataAdesao = unescapeCsv(cols[7]);
                    String dataNasc = unescapeCsv(cols[8]);
                    String sexo = unescapeCsv(cols[9]);
                    String tituloCargo = unescapeCsv(cols[10]);

                    // Upsert por CPF: atualiza se já existir, cria se não existir
                    Membro membro;
                    if (!cpf.isBlank()) {
                        membro = membroRepository.findByCpf(cpf).orElse(new Membro());
                    } else {
                        membro = new Membro();
                    }

                    if (nome != null && !nome.isBlank())
                        membro.setNomeCompleto(nome);
                    if (!cpf.isBlank())
                        membro.setCpf(cpf);
                    if (whatsapp != null && !whatsapp.isBlank())
                        membro.setWhatsapp(whatsapp);
                    if (email != null && !email.isBlank())
                        membro.setEmail(email);
                    if (fotoPerfil != null && !fotoPerfil.isBlank())
                        membro.setFotoPerfilUrl(fotoPerfil);
                    if (status != null && !status.isBlank())
                        membro.setStatusCadastro(status);

                    if (sexo != null && !sexo.isBlank()) {
                        validarSexo(sexo);
                        membro.setSexo(sexo.trim().equalsIgnoreCase("masculino") ? "Masculino" : "Feminino");
                    }
                    parseDateSafe(dataAdesao).ifPresent(membro::setDataAdesao);
                    parseDateSafe(dataNasc).ifPresent(membro::setDataNascimento);

                    if (tituloCargo != null && !tituloCargo.isBlank()) {
                        Cargo cargo = cargoRepository.findByTituloIgnoreCase(tituloCargo.trim())
                                .orElseGet(() -> cargoRepository.save(
                                        Cargo.builder().titulo(tituloCargo.trim()).pesoHierarquico(0).build()));
                        membro.setCargo(cargo);
                    }

                    membrosToSave.add(membro);
                }

                membroRepository.saveAll(membrosToSave);
            }
        } catch (RegraNegocioException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Erro ao processar o arquivo CSV: " + e.getMessage(), e);
        }
    }

    // ─── HELPERS ───────────────────────────────────────────────────────────────

    private void atualizarDadosEntidade(Membro membro, MembroFormDTO dto) {
        if (dto.nomeCompleto() != null)
            membro.setNomeCompleto(dto.nomeCompleto());
        if (dto.whatsapp() != null)
            membro.setWhatsapp(dto.whatsapp());
        if (dto.email() != null)
            membro.setEmail(dto.email());
        if (dto.fotoPerfilUrl() != null)
            membro.setFotoPerfilUrl(dto.fotoPerfilUrl());
        if (dto.statusCadastro() != null)
            membro.setStatusCadastro(dto.statusCadastro());
        if (dto.dataAdesao() != null)
            membro.setDataAdesao(dto.dataAdesao());
        if (dto.dataNascimento() != null)
            membro.setDataNascimento(dto.dataNascimento());
        if (dto.sexo() != null) {
            validarSexo(dto.sexo());
            membro.setSexo(dto.sexo().trim().equalsIgnoreCase("masculino") ? "Masculino" : "Feminino");
        }
        if (dto.cpf() != null) {
            String cpfLimpo = dto.cpf().replaceAll("\\D", "");
            membro.setCpf(cpfLimpo.isBlank() ? null : cpfLimpo);
        }
        if (dto.rg() != null) {
            membro.setRg(dto.rg().trim());
        }
        if (dto.cep() != null) membro.setCep(dto.cep());
        if (dto.logradouro() != null) membro.setLogradouro(dto.logradouro());
        if (dto.numero() != null) membro.setNumero(dto.numero());
        if (dto.complemento() != null) membro.setComplemento(dto.complemento());
        if (dto.bairro() != null) membro.setBairro(dto.bairro());
        if (dto.cidade() != null) membro.setCidade(dto.cidade());
        if (dto.estado() != null) membro.setEstado(dto.estado());
        if (dto.observacao() != null) {
            membro.setObservacao(dto.observacao());
        }
        if (dto.cargoId() != null) {
            Cargo cargo = cargoRepository.findById(dto.cargoId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cargo não encontrado"));
            membro.setCargo(cargo);
        } else {
            membro.setCargo(null);
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
        } else {
            membro.setLiderDireto(null);
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
        if (value == null || value.isBlank())
            return "";
        return "\"" + value.replace("\"", "\"\"") + "\"";
    }

    /** Remove aspas e unescapa aspas duplicadas de um campo CSV. */
    private String unescapeCsv(String data) {
        if (data == null)
            return "";
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
        if (dateStr == null || dateStr.isBlank())
            return Optional.empty();
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

    private void atualizarGrupos(Membro membro, List<Long> ministeriosIds, List<Long> pequenosGruposIds) {
        membroGrupoRepository.deleteByMembroId(membro.getId());
        membroGrupoRepository.flush();
        List<Long> allGroupIds = new ArrayList<>();
        if (ministeriosIds != null) allGroupIds.addAll(ministeriosIds);
        if (pequenosGruposIds != null) allGroupIds.addAll(pequenosGruposIds);
        
        for (Long grupoId : allGroupIds) {
            Grupo grupo = grupoRepository.findById(grupoId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Grupo não encontrado: " + grupoId));
            
            MembroGrupo vinculo = MembroGrupo.builder()
                    .membro(membro)
                    .grupo(grupo)
                    .dataEntrada(LocalDate.now())
                    .build();
            membroGrupoRepository.save(vinculo);
        }
    }

    @Transactional
    public void registrarHistorico(Membro membro, String campo, String valorAntigo, String valorNovo) {
        String antigo = valorAntigo == null ? "" : valorAntigo.trim();
        String novo = valorNovo == null ? "" : valorNovo.trim();
        if (antigo.equals(novo)) return;

        MembroHistorico hist = MembroHistorico.builder()
                .membro(membro)
                .campoAlterado(campo)
                .valorAntigo(antigo.isEmpty() ? "Não informado" : antigo)
                .valorNovo(novo.isEmpty() ? "Não informado" : novo)
                .dataAlteracao(java.time.LocalDateTime.now())
                .usuarioId(1L) // Administrador Padrão
                .build();
        membroHistoricoRepository.save(hist);
    }

    @Transactional(readOnly = true)
    public List<MembroHistorico> obterHistoricoMembro(Long membroId) {
        return membroHistoricoRepository.findByMembroIdOrderByDataAlteracaoDesc(membroId);
    }

    private List<MembroRelacionamentoDTO> obterParentesDiretos(Long membroId) {
        List<MembroRelacionamento> rels = membroRelacionamentoRepository.findByMembroId(membroId);
        List<MembroRelacionamento> relsParente = membroRelacionamentoRepository.findByParenteId(membroId);
        
        List<MembroRelacionamentoDTO> list = new ArrayList<>();
        java.time.format.DateTimeFormatter dtf = java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy");
        
        for (MembroRelacionamento r : rels) {
            Membro p = r.getParente();
            String dateStr = r.getDataCasamento() != null ? r.getDataCasamento().format(dtf) : null;
            list.add(new MembroRelacionamentoDTO(
                r.getId(),
                p.getId(),
                p.getNomeCompleto(),
                p.getFotoPerfilUrl(),
                r.getTipoVinculo(),
                dateStr
            ));
        }
        
        for (MembroRelacionamento r : relsParente) {
            Membro m = r.getMembro();
            String dateStr = r.getDataCasamento() != null ? r.getDataCasamento().format(dtf) : null;
            String vinculo = r.getTipoVinculo();
            if ("PAI_MAE".equals(vinculo)) {
                vinculo = "FILHO_A";
            }
            list.add(new MembroRelacionamentoDTO(
                r.getId(),
                m.getId(),
                m.getNomeCompleto(),
                m.getFotoPerfilUrl(),
                vinculo,
                dateStr
            ));
        }
        
        return list;
    }

    @Transactional
    public MembroRelacionamentoDTO salvarRelacionamento(MembroRelacionamentoFormDTO form) {
        if (form.membroId().equals(form.parenteId())) {
            throw new RegraNegocioException("Não é possível criar um relacionamento com a própria pessoa.");
        }
        
        Membro membro = membroRepository.findById(form.membroId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Membro foco não encontrado"));
        Membro parente = membroRepository.findById(form.parenteId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Parente não encontrado"));
                
        String vinculo = form.tipoVinculo().toUpperCase().trim();
        if (!"CONJUGE".equals(vinculo) && !"PAI_MAE".equals(vinculo)) {
            throw new RegraNegocioException("Tipo de vínculo inválido. Deve ser 'CONJUGE' ou 'PAI_MAE'.");
        }
        
        LocalDate dataCasamento = null;
        if ("CONJUGE".equals(vinculo)) {
            dataCasamento = form.dataCasamento();
        } else {
            if (form.dataCasamento() != null) {
                throw new RegraNegocioException("Data de casamento não é permitida para o tipo de vínculo '" + vinculo + "'.");
            }
        }
        
        Optional<MembroRelacionamento> existente = membroRelacionamentoRepository.findAll().stream()
                .filter(r -> (r.getMembro().getId().equals(form.membroId()) && r.getParente().getId().equals(form.parenteId()) && r.getTipoVinculo().equals(vinculo))
                        || (r.getMembro().getId().equals(form.parenteId()) && r.getParente().getId().equals(form.membroId()) && r.getTipoVinculo().equals(vinculo)))
                .findFirst();
                
        if (existente.isPresent()) {
            throw new RegraNegocioException("Este relacionamento familiar já está cadastrado.");
        }
        
        MembroRelacionamento rel = MembroRelacionamento.builder()
                .membro(membro)
                .parente(parente)
                .tipoVinculo(vinculo)
                .dataCasamento(dataCasamento)
                .build();
                
        rel = membroRelacionamentoRepository.save(rel);
        
        java.time.format.DateTimeFormatter dtf = java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy");
        return new MembroRelacionamentoDTO(
                rel.getId(),
                parente.getId(),
                parente.getNomeCompleto(),
                parente.getFotoPerfilUrl(),
                rel.getTipoVinculo(),
                rel.getDataCasamento() != null ? rel.getDataCasamento().format(dtf) : null
        );
    }
    
    @Transactional
    public void removerRelacionamento(Long id) {
        if (!membroRelacionamentoRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Relacionamento não encontrado");
        }
        membroRelacionamentoRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public byte[] exportarCompletoCsv() {
        List<Membro> membros = membroRepository.findAll();
        StringBuilder csv = new StringBuilder();

        csv.append("matricula,nome_completo,cpf,whatsapp,email,foto_perfil_url,status_cadastro,data_adesao,data_nascimento,sexo,titulo_cargo,ministerios,pequenos_grupos,cep,logradouro,numero,complemento,bairro,cidade,estado\n");

        for (Membro m : membros) {
            String cargoTitulo = m.getCargo() != null ? m.getCargo().getTitulo() : "";
            String matricula = m.getId() != null ? String.format("%04d", m.getId()) : "";

            List<String> ministeriosList = new ArrayList<>();
            List<String> pequenosGruposList = new ArrayList<>();
            if (m.getMembrosGrupos() != null) {
                for (MembroGrupo mg : m.getMembrosGrupos()) {
                    if (mg.getGrupo() != null) {
                        if (mg.getGrupo().getTipoGrupo() == TipoGrupo.MINISTERIO) {
                            ministeriosList.add(mg.getGrupo().getNomeGrupo());
                        } else if (mg.getGrupo().getTipoGrupo() == TipoGrupo.PEQUENO_GRUPO
                                || mg.getGrupo().getTipoGrupo() == TipoGrupo.SOCIEDADE_INTERNA
                                || mg.getGrupo().getTipoGrupo() == TipoGrupo.SOCIEDADES_INTERNAS) {
                            pequenosGruposList.add(mg.getGrupo().getNomeGrupo());
                        }
                    }
                }
            }
            String ministeriosStr = String.join("; ", ministeriosList);
            String pequenosGruposStr = String.join("; ", pequenosGruposList);

            csv.append(String.format("%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s\n",
                    matricula,
                    csvField(m.getNomeCompleto()),
                    csvField(m.getCpf()),
                    csvField(m.getWhatsapp()),
                    csvField(m.getEmail()),
                    csvField(m.getFotoPerfilUrl()),
                    csvField(m.getStatusCadastro()),
                    m.getDataAdesao() != null ? m.getDataAdesao().toString() : "",
                    m.getDataNascimento() != null ? m.getDataNascimento().toString() : "",
                    csvField(m.getSexo()),
                    csvField(cargoTitulo),
                    csvField(ministeriosStr),
                    csvField(pequenosGruposStr),
                    csvField(m.getCep()),
                    csvField(m.getLogradouro()),
                    csvField(m.getNumero()),
                    csvField(m.getComplemento()),
                    csvField(m.getBairro()),
                    csvField(m.getCidade()),
                    csvField(m.getEstado())
            ));
        }

        byte[] bom = new byte[]{(byte) 0xEF, (byte) 0xBB, (byte) 0xBF};
        byte[] content = csv.toString().getBytes(StandardCharsets.UTF_8);
        byte[] result = new byte[bom.length + content.length];
        System.arraycopy(bom, 0, result, 0, bom.length);
        System.arraycopy(content, 0, result, bom.length, content.length);
        return result;
    }

    @Transactional
    public void importarMassa(MultipartFile file) {
        try {
            InputStream inputStream = file.getInputStream();
            byte[] primeiros = inputStream.readNBytes(3);
            if (primeiros[0] != (byte) 0xEF || primeiros[1] != (byte) 0xBB || primeiros[2] != (byte) 0xBF) {
                inputStream = file.getInputStream();
            }

            try (BufferedReader br = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
                String line;
                boolean firstLine = true;
                List<Membro> membrosToSave = new ArrayList<>();

                while ((line = br.readLine()) != null) {
                    if (firstLine) {
                        firstLine = false;
                        continue;
                    }
                    if (line.isBlank())
                        continue;

                    String[] cols = splitCsvLine(line);
                    if (cols.length < 11)
                        continue;

                    String nome = unescapeCsv(cols[1]);
                    String cpf = unescapeCsv(cols[2]).replaceAll("\\D", "");
                    String whatsapp = unescapeCsv(cols[3]);
                    String email = unescapeCsv(cols[4]);
                    String fotoPerfil = unescapeCsv(cols[5]);
                    String status = unescapeCsv(cols[6]);
                    String dataAdesao = unescapeCsv(cols[7]);
                    String dataNasc = unescapeCsv(cols[8]);
                    String sexo = unescapeCsv(cols[9]);
                    String tituloCargo = unescapeCsv(cols[10]);

                    if (!cpf.isBlank() && membroRepository.findByCpf(cpf).isPresent()) {
                        continue;
                    }
                    
                    if (email != null && !email.isBlank() && membroRepository.findByEmail(email).isPresent()) {
                        continue;
                    }

                    Membro membro = new Membro();
                    
                    if (nome != null && !nome.isBlank())
                        membro.setNomeCompleto(nome);
                    if (!cpf.isBlank())
                        membro.setCpf(cpf);
                    if (whatsapp != null && !whatsapp.isBlank())
                        membro.setWhatsapp(whatsapp);
                    if (email != null && !email.isBlank())
                        membro.setEmail(email);
                    if (fotoPerfil != null && !fotoPerfil.isBlank())
                        membro.setFotoPerfilUrl(fotoPerfil);
                    if (status != null && !status.isBlank())
                        membro.setStatusCadastro(status);

                    if (sexo != null && !sexo.isBlank()) {
                        validarSexo(sexo);
                        membro.setSexo(sexo.trim().equalsIgnoreCase("masculino") ? "Masculino" : "Feminino");
                    }
                    parseDateSafe(dataAdesao).ifPresent(membro::setDataAdesao);
                    parseDateSafe(dataNasc).ifPresent(membro::setDataNascimento);

                    if (tituloCargo != null && !tituloCargo.isBlank()) {
                        Cargo cargo = cargoRepository.findByTituloIgnoreCase(tituloCargo.trim())
                                .orElseGet(() -> cargoRepository.save(
                                        Cargo.builder().titulo(tituloCargo.trim()).pesoHierarquico(0).build()));
                        membro.setCargo(cargo);
                    }

                    if (cols.length >= 20) {
                        membro.setCep(unescapeCsv(cols[13]));
                        membro.setLogradouro(unescapeCsv(cols[14]));
                        membro.setNumero(unescapeCsv(cols[15]));
                        membro.setComplemento(unescapeCsv(cols[16]));
                        membro.setBairro(unescapeCsv(cols[17]));
                        membro.setCidade(unescapeCsv(cols[18]));
                        membro.setEstado(unescapeCsv(cols[19]));
                    }

                    membrosToSave.add(membro);
                }

                membroRepository.saveAll(membrosToSave);
            }
        } catch (IOException e) {
            throw new RegraNegocioException("Erro ao processar arquivo de importação: " + e.getMessage());
        }
    }
}
