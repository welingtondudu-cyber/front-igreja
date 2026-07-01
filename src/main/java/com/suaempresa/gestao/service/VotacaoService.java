package com.suaempresa.gestao.service;

import com.suaempresa.gestao.domain.dto.*;
import com.suaempresa.gestao.domain.entity.*;
import com.suaempresa.gestao.exception.*;
import com.suaempresa.gestao.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.security.SecureRandom;

@Service
@RequiredArgsConstructor
public class VotacaoService {

    private final VotacaoRepository votacaoRepository;
    private final VotacaoOpcaoRepository votacaoOpcaoRepository;
    private final VotacaoRestricaoRepository votacaoRestricaoRepository;
    private final VotacaoRegistroRepository votacaoRegistroRepository;
    private final VotoComputadoRepository votoComputadoRepository;
    private final MembroRepository membroRepository;

    private static final String CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    @Transactional(readOnly = true)
    public ElegibilidadeResponse verificarElegibilidade(ElegibilidadeRequest request) {
        // Limpar CPF
        String cpfLimpo = request.cpf() != null ? request.cpf().replaceAll("\\D", "") : "";

        // Buscar Votação
        Votacao votacao = votacaoRepository.findById(request.votacaoId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Votação não encontrada"));

        // Buscar Membro
        Membro membro = membroRepository.findByCpf(cpfLimpo)
                .orElseThrow(() -> new MembroNaoElegivelException("Membro não encontrado com o CPF informado."));

        if (!"ATIVO".equalsIgnoreCase(membro.getStatusCadastro())) {
            throw new MembroNaoElegivelException("Cadastro do membro não está ativo.");
        }

        if (membro.getCargo() != null && (Integer.valueOf(4).equals(membro.getCargo().getPesoHierarquico()) || "Visitante".equalsIgnoreCase(membro.getCargo().getTitulo()))) {
            throw new MembroNaoElegivelException("Visitantes não possuem direito a voto nesta assembleia.");
        }

        // Validação de correspondência de ano de nascimento como fator de autenticação
        if (membro.getDataNascimento() == null || membro.getDataNascimento().getYear() != request.anoNascimento()) {
            throw new MembroNaoElegivelException("Ano de nascimento informado diverge do cadastro.");
        }

        // Validação de Idade Limite
        int idadeMinima = votacao.getIdadeLimite() != null ? votacao.getIdadeLimite() : 18;
        java.time.LocalDate dataLimiteIdade = java.time.LocalDate.now().minusYears(idadeMinima);
        if (membro.getDataNascimento() == null || membro.getDataNascimento().isAfter(dataLimiteIdade)) {
            throw new MembroMenorDeIdadeException("Membros com idade inferior a " + idadeMinima + " anos não possuem direito a voto nesta assembleia");
        }

        // Verificar Restrição
        VotacaoRestricaoId restricaoId = new VotacaoRestricaoId(request.votacaoId(), membro.getId());
        Optional<VotacaoRestricao> restricao = votacaoRestricaoRepository.findById(restricaoId);
        if (restricao.isPresent()) {
            throw new MembroRestritoException(restricao.get().getMotivo());
        }

        // Verificar se já votou
        VotacaoRegistroId registroId = new VotacaoRegistroId(request.votacaoId(), membro.getId());
        if (votacaoRegistroRepository.existsById(registroId)) {
            throw new VotoJaComputadoException("Voto já computado para este membro nesta votação.");
        }

        return new ElegibilidadeResponse(
                membro.getId(),
                membro.getNomeCompleto(),
                votacao.getTitulo(),
                votacao.getLimiteVotos()
        );
    }

    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public String votar(VotoRequest request) {
        // Dupla checagem: verificar se já votou
        VotacaoRegistroId registroId = new VotacaoRegistroId(request.votacaoId(), request.membroId());
        if (votacaoRegistroRepository.existsById(registroId)) {
            throw new VotoJaComputadoException("Voto já computado para este membro nesta votação.");
        }

        // Buscar Votação
        Votacao votacao = votacaoRepository.findById(request.votacaoId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Votação não encontrada"));

        // Validar limites
        int totalOpcoes = request.opcoesIds() != null ? request.opcoesIds().size() : 0;
        if (totalOpcoes > votacao.getLimiteVotos()) {
            throw new LimiteVotosExcedidoException("A quantidade de opções selecionadas deve ser no máximo " + votacao.getLimiteVotos() + ".");
        }

        // Buscar Membro
        Membro membro = membroRepository.findById(request.membroId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Membro não encontrado"));

        // Salvar participação
        VotacaoRegistro registro = VotacaoRegistro.builder()
                .id(registroId)
                .votacao(votacao)
                .membro(membro)
                .dataVoto(LocalDateTime.now())
                .build();
        votacaoRegistroRepository.save(registro);

        // Geração do código curto de auditoria
        String codigo = gerarCodigoAuditoria();

        // Salvar votos computados
        if (request.opcoesIds() == null || request.opcoesIds().isEmpty()) {
            VotoComputado voto = VotoComputado.builder()
                    .opcao(null) // Voto em Branco / Nulo
                    .codigoAuditoria(codigo)
                    .dataHora(LocalDateTime.now())
                    .build();
            votoComputadoRepository.save(voto);
        } else {
            for (Long opcaoId : request.opcoesIds()) {
                VotacaoOpcao opcao = votacaoOpcaoRepository.findById(opcaoId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Opção de votação não encontrada: " + opcaoId));

                if (!opcao.getVotacao().getId().equals(votacao.getId())) {
                    throw new RegraNegocioException("A opção selecionada não pertence a esta votação.");
                }

                VotoComputado voto = VotoComputado.builder()
                        .opcao(opcao)
                        .codigoAuditoria(codigo)
                        .dataHora(LocalDateTime.now())
                        .build();
                votoComputadoRepository.save(voto);
            }
        }

        return codigo;
    }

    @Transactional(readOnly = true)
    public ApuracaoResponse obterApuracao(Long votacaoId) {
        Votacao votacao = votacaoRepository.findById(votacaoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Votação não encontrada"));

        // 1. Calcular/Buscar totalAptos
        long totalAptos;
        if (Boolean.FALSE.equals(votacao.getAtiva()) && votacao.getTotalAptosHistorico() != null) {
            totalAptos = votacao.getTotalAptosHistorico();
        } else {
            int idadeMinima = votacao.getIdadeLimite() != null ? votacao.getIdadeLimite() : 18;
            totalAptos = membroRepository.countMembrosAptosParaVotar(votacaoId, java.time.LocalDate.now().minusYears(idadeMinima));
        }

        // 2. Calcular totalVotaram
        long totalVotaram = votacaoRegistroRepository.countByIdVotacaoId(votacaoId);

        // 3. Percentual de participação
        double percentualParticipacao = 0.0;
        if (totalAptos > 0) {
            percentualParticipacao = ((double) totalVotaram / totalAptos) * 100.0;
        }

        // 4. Resultados das opções
        List<Object[]> rawResults = votoComputadoRepository.findResultadosApuracao(votacaoId);
        long totalVotosValidos = 0;
        for (Object[] row : rawResults) {
            totalVotosValidos += ((Number) row[4]).longValue();
        }

        List<ApuracaoResultadoDTO> resultados = new ArrayList<>();
        for (Object[] row : rawResults) {
            Long opcaoId = (Long) row[0];
            String tituloOpcao = (String) row[1];
            Long membroId = (Long) row[2];
            String fotoUrl = (String) row[3];
            long votos = ((Number) row[4]).longValue();
            String nomeMembro = row.length > 5 ? (String) row[5] : null;
            double percentual = 0.0;
            if (totalVotosValidos > 0) {
                percentual = ((double) votos / totalVotosValidos) * 100.0;
            }
            resultados.add(new ApuracaoResultadoDTO(opcaoId, tituloOpcao, membroId, fotoUrl, votos, percentual, nomeMembro));
        }

        return new ApuracaoResponse(totalAptos, totalVotaram, percentualParticipacao, resultados);
    }

    @Transactional
    public void encerrarVotacao(Long votacaoId) {
        Votacao votacao = votacaoRepository.findById(votacaoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Votação não encontrada"));

        int idadeMinima = votacao.getIdadeLimite() != null ? votacao.getIdadeLimite() : 18;
        long quorum = membroRepository.countMembrosAptosParaVotar(votacaoId, java.time.LocalDate.now().minusYears(idadeMinima));

        votacao.setTotalAptosHistorico(quorum);
        votacao.setAtiva(false);
        votacao.setDataEncerramento(LocalDateTime.now());

        votacaoRepository.save(votacao);
    }

    @Transactional
    public Long criarVotacao(CriarVotacaoRequest request) {
        Votacao votacao = Votacao.builder()
                .titulo(request.titulo())
                .descricao(request.descricao())
                .limiteVotos(request.limiteVotos())
                .idadeLimite(request.idadeLimite() != null ? request.idadeLimite() : 18)
                .ativa(true)
                .dataCriacao(LocalDateTime.now())
                .build();

        votacao = votacaoRepository.save(votacao);

        if (request.opcoes() != null) {
            for (CriarVotacaoRequest.CriarOpcaoRequest opcaoReq : request.opcoes()) {
                Membro membro = null;
                if (opcaoReq.membroId() != null) {
                    membro = membroRepository.findById(opcaoReq.membroId())
                            .orElseThrow(() -> new MembroNaoEncontradoException(
                                    "Membro com ID " + opcaoReq.membroId() + " não encontrado."));
                }

                VotacaoOpcao opcao = VotacaoOpcao.builder()
                        .votacao(votacao)
                        .tituloOpcao(membro != null ? membro.getNomeCompleto() : opcaoReq.tituloOpcao())
                        .membro(membro)
                        .build();

                votacaoOpcaoRepository.save(opcao);
            }
        }

        return votacao.getId();
    }

    @Transactional(readOnly = true)
    public CedulaVotacaoResponse obterCedulaVotacao(Long id) {
        Votacao votacao = votacaoRepository.findById(id)
                .orElseThrow(() -> new VotacaoInativaException("Esta votação não está aberta ou já foi encerrada"));

        if (votacao.getAtiva() == null || !votacao.getAtiva()) {
            throw new VotacaoInativaException("Esta votação não está aberta ou já foi encerrada");
        }

        List<VotacaoOpcao> opcoes = votacaoOpcaoRepository.findByVotacaoIdWithMembro(id);

        List<CedulaVotacaoResponse.OpcaoCedulaDTO> opcoesDTO = opcoes.stream()
                .map(opcao -> new CedulaVotacaoResponse.OpcaoCedulaDTO(
                        opcao.getId(),
                        opcao.getTituloOpcao(),
                        opcao.getMembro() != null ? opcao.getMembro().getId() : null,
                        opcao.getMembro() != null ? opcao.getMembro().getFotoPerfilUrl() : null
                ))
                .toList();

        return new CedulaVotacaoResponse(
                votacao.getId(),
                votacao.getTitulo(),
                votacao.getDescricao(),
                votacao.getLimiteVotos(),
                opcoesDTO
        );
    }

    @Transactional(readOnly = true)
    public List<VotacaoSimplificadaDTO> listarAtivas() {
        return votacaoRepository.findByAtivaTrue().stream()
                .map(v -> new VotacaoSimplificadaDTO(v.getId(), v.getTitulo()))
                .toList();
    }

    private String gerarCodigoAuditoria() {
        StringBuilder sb = new StringBuilder(6);
        for (int i = 0; i < 6; i++) {
            sb.append(CHARS.charAt(RANDOM.nextInt(CHARS.length())));
        }
        return sb.toString();
    }

    @Transactional(readOnly = true)
    public List<VotacaoRestricaoDTO> listarRestricoes(Long votacaoId) {
        if (!votacaoRepository.existsById(votacaoId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Votação não encontrada");
        }
        return votacaoRestricaoRepository.findByIdVotacaoId(votacaoId).stream()
                .map(r -> new VotacaoRestricaoDTO(
                        String.format("%04d", r.getMembro().getId()),
                        r.getMembro().getNomeCompleto(),
                        r.getMotivo()
                ))
                .toList();
    }

    @Transactional
    public void cadastrarRestricao(Long votacaoId, String matricula, String motivo) {
        Votacao votacao = votacaoRepository.findById(votacaoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Votação não encontrada"));

        if (votacao.getAtiva() == null || !votacao.getAtiva()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não é possível cadastrar restrições para uma votação encerrada");
        }

        Long membroId;
        try {
            membroId = Long.parseLong(matricula);
        } catch (NumberFormatException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Matrícula inválida");
        }

        Membro membro = membroRepository.findById(membroId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Membro não encontrado"));

        VotacaoRestricaoId restricaoId = new VotacaoRestricaoId(votacaoId, membroId);
        if (votacaoRestricaoRepository.existsById(restricaoId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Membro já possui restrição para esta votação");
        }

        VotacaoRestricao restricao = VotacaoRestricao.builder()
                .id(restricaoId)
                .votacao(votacao)
                .membro(membro)
                .motivo(motivo)
                .build();

        votacaoRestricaoRepository.save(restricao);
    }

    @Transactional
    public void removerRestricao(Long votacaoId, String matricula) {
        Votacao votacao = votacaoRepository.findById(votacaoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Votação não encontrada"));

        if (votacao.getAtiva() == null || !votacao.getAtiva()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não é possível alterar restrições para uma votação encerrada");
        }

        Long membroId;
        try {
            membroId = Long.parseLong(matricula);
        } catch (NumberFormatException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Matrícula inválida");
        }

        VotacaoRestricaoId restricaoId = new VotacaoRestricaoId(votacaoId, membroId);
        VotacaoRestricao restricao = votacaoRestricaoRepository.findById(restricaoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restrição não encontrada"));

        votacaoRestricaoRepository.delete(restricao);
    }

    @Transactional(readOnly = true)
    public List<VotacaoAdminDTO> listarTodasParaAdmin() {
        return votacaoRepository.findAll().stream()
                .map(v -> new VotacaoAdminDTO(v.getId(), v.getTitulo(), v.getAtiva() != null && v.getAtiva(), v.getDataCriacao(), v.getIdadeLimite() != null ? v.getIdadeLimite() : 18, v.getDataEncerramento()))
                .toList();
    }

    @Transactional
    public void atualizarVotacao(Long id, CriarVotacaoRequest request) {
        Votacao votacao = votacaoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Votação não encontrada"));

        votacao.setTitulo(request.titulo());
        votacao.setDescricao(request.descricao());
        votacao.setLimiteVotos(request.limiteVotos());
        votacao.setIdadeLimite(request.idadeLimite() != null ? request.idadeLimite() : 18);

        votacaoRepository.save(votacao);

        // Remove old options and add new ones
        votacaoOpcaoRepository.deleteByVotacaoId(id);

        if (request.opcoes() != null) {
            for (CriarVotacaoRequest.CriarOpcaoRequest opcaoReq : request.opcoes()) {
                Membro membro = null;
                if (opcaoReq.membroId() != null) {
                    membro = membroRepository.findById(opcaoReq.membroId())
                            .orElseThrow(() -> new MembroNaoEncontradoException(
                                    "Membro com ID " + opcaoReq.membroId() + " não encontrado."));
                }

                VotacaoOpcao opcao = VotacaoOpcao.builder()
                        .votacao(votacao)
                        .tituloOpcao(membro != null ? membro.getNomeCompleto() : opcaoReq.tituloOpcao())
                        .membro(membro)
                        .build();

                votacaoOpcaoRepository.save(opcao);
            }
        }
    }
}
