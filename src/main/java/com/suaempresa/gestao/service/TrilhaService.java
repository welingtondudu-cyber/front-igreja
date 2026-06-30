package com.suaempresa.gestao.service;

import com.suaempresa.gestao.domain.dto.TrilhaDTO;
import com.suaempresa.gestao.domain.dto.TrilhaConteudoDTO;
import com.suaempresa.gestao.domain.entity.*;
import com.suaempresa.gestao.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrilhaService {

    private final TrilhaRepository trilhaRepository;
    private final TrilhaConteudoRepository trilhaConteudoRepository;
    private final TrilhaProgressoRepository trilhaProgressoRepository;
    private final MembroRepository membroRepository;
    private final TrilhaStatusRepository trilhaStatusRepository;

    @Transactional(readOnly = true)
    public List<TrilhaDTO> listarTrilhas(String tipo, Long membroId) {
        List<Trilha> list;
        if (tipo == null || tipo.isBlank() || tipo.equalsIgnoreCase("TODOS")) {
            list = trilhaRepository.findAll();
        } else {
            list = trilhaRepository.findByTipo(tipo.trim().toUpperCase());
        }

        return list.stream().map(t -> {
            String status = null;
            Integer percentual = null;
            if (membroId != null) {
                // Calcular percentual de progresso
                List<TrilhaConteudo> totalAulas = trilhaConteudoRepository.findByTrilhaIdOrderByOrdemAsc(t.getId());
                if (!totalAulas.isEmpty()) {
                    long concluidas = trilhaProgressoRepository.findByMembroId(membroId)
                            .stream()
                            .filter(p -> p.isConcluido() && p.getConteudo().getTrilha() != null && p.getConteudo().getTrilha().getId().equals(t.getId()))
                            .count();
                    percentual = (int) Math.round(((double) concluidas / totalAulas.size()) * 100);
                } else {
                    percentual = 0;
                }

                // Obter status salvo ou derivar
                Optional<TrilhaStatus> stOpt = trilhaStatusRepository.findByMembroIdAndTrilhaId(membroId, t.getId());
                if (stOpt.isPresent()) {
                    status = stOpt.get().getStatus();
                } else if (percentual > 0) {
                    status = percentual >= 100 ? "CONCLUIDO" : "EM_ANDAMENTO";
                }
            }
            return TrilhaDTO.fromEntity(t, status, percentual);
        }).toList();
    }

    @Transactional(readOnly = true)
    public TrilhaDTO obterTrilhaPorId(Long id, Long membroId) {
        Trilha t = trilhaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trilha não encontrada"));
        
        String status = null;
        Integer percentual = null;
        if (membroId != null) {
            List<TrilhaConteudo> totalAulas = trilhaConteudoRepository.findByTrilhaIdOrderByOrdemAsc(t.getId());
            if (!totalAulas.isEmpty()) {
                long concluidas = trilhaProgressoRepository.findByMembroId(membroId)
                        .stream()
                        .filter(p -> p.isConcluido() && p.getConteudo().getTrilha() != null && p.getConteudo().getTrilha().getId().equals(t.getId()))
                        .count();
                percentual = (int) Math.round(((double) concluidas / totalAulas.size()) * 100);
            } else {
                percentual = 0;
            }

            Optional<TrilhaStatus> stOpt = trilhaStatusRepository.findByMembroIdAndTrilhaId(membroId, t.getId());
            if (stOpt.isPresent()) {
                status = stOpt.get().getStatus();
            } else if (percentual > 0) {
                status = percentual >= 100 ? "CONCLUIDO" : "EM_ANDAMENTO";
            }
        }
        return TrilhaDTO.fromEntity(t, status, percentual);
    }

    @Transactional(readOnly = true)
    public List<TrilhaConteudoDTO> obterConteudos(Long trilhaId, Long membroId) {
        List<TrilhaConteudo> conteudos = (trilhaId == null)
                ? trilhaConteudoRepository.findByTrilhaIsNullOrderByDataCadastroDesc()
                : trilhaConteudoRepository.findByTrilhaIdOrderByOrdemAsc(trilhaId);

        // Obter ids concluidos
        Set<Long> concluidosIds = Set.of();
        if (membroId != null) {
            concluidosIds = trilhaProgressoRepository.findByMembroId(membroId)
                    .stream()
                    .filter(TrilhaProgresso::isConcluido)
                    .map(p -> p.getConteudo().getId())
                    .collect(Collectors.toSet());
        }

        final Set<Long> finalConcluidosIds = concluidosIds;
        return conteudos.stream()
                .map(tc -> TrilhaConteudoDTO.fromEntity(tc, finalConcluidosIds.contains(tc.getId())))
                .toList();
    }

    @Transactional
    public void marcarConcluido(Long membroId, Long conteudoId, boolean concluido) {
        TrilhaProgresso progresso = trilhaProgressoRepository.findByMembroIdAndConteudoId(membroId, conteudoId)
                .orElseGet(() -> {
                    Membro m = membroRepository.findById(membroId)
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Membro não encontrado"));
                    TrilhaConteudo tc = trilhaConteudoRepository.findById(conteudoId)
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conteúdo não encontrado"));
                    return TrilhaProgresso.builder().membro(m).conteudo(tc).build();
                });

        progresso.setConcluido(concluido);
        progresso.setDataConclusao(concluido ? LocalDateTime.now() : null);
        trilhaProgressoRepository.save(progresso);

        // Após concluir um conteúdo, atualizar o status geral automaticamente se necessário
        TrilhaConteudo tc = progresso.getConteudo();
        if (tc.getTrilha() != null) {
            atualizarStatusAutomaticoTrilha(membroId, tc.getTrilha().getId());
        } else {
            atualizarStatusAutomaticoConteudoAvulso(membroId, tc.getId(), concluido);
        }
    }

    private void atualizarStatusAutomaticoTrilha(Long membroId, Long trilhaId) {
        List<TrilhaConteudo> totalAulas = trilhaConteudoRepository.findByTrilhaIdOrderByOrdemAsc(trilhaId);
        long concluidas = trilhaProgressoRepository.findByMembroId(membroId)
                .stream()
                .filter(p -> p.isConcluido() && p.getConteudo().getTrilha() != null && p.getConteudo().getTrilha().getId().equals(trilhaId))
                .count();

        String novoStatus = "EM_ANDAMENTO";
        if (concluidas >= totalAulas.size() && !totalAulas.isEmpty()) {
            novoStatus = "CONCLUIDO";
        } else if (concluidas == 0) {
            // Se zerar de volta, podemos remover ou manter em andamento se iniciado
            novoStatus = "EM_ANDAMENTO";
        }

        final String statusToSet = novoStatus;
        TrilhaStatus ts = trilhaStatusRepository.findByMembroIdAndTrilhaId(membroId, trilhaId)
                .orElseGet(() -> {
                    Membro m = membroRepository.findById(membroId).orElseThrow();
                    Trilha t = trilhaRepository.findById(trilhaId).orElseThrow();
                    return TrilhaStatus.builder().membro(m).trilha(t).status(statusToSet).build();
                });

        // Só atualiza automaticamente para concluído ou em andamento se não estiver paralisado pelo usuário
        if (!"PARALISADO".equals(ts.getStatus()) || "CONCLUIDO".equals(statusToSet)) {
            ts.setStatus(statusToSet);
            trilhaStatusRepository.save(ts);
        }
    }

    private void atualizarStatusAutomaticoConteudoAvulso(Long membroId, Long conteudoId, boolean concluido) {
        String statusToSet = concluido ? "CONCLUIDO" : "EM_ANDAMENTO";
        TrilhaStatus ts = trilhaStatusRepository.findByMembroIdAndConteudoId(membroId, conteudoId)
                .orElseGet(() -> {
                    Membro m = membroRepository.findById(membroId).orElseThrow();
                    TrilhaConteudo tc = trilhaConteudoRepository.findById(conteudoId).orElseThrow();
                    return TrilhaStatus.builder().membro(m).conteudo(tc).status(statusToSet).build();
                });

        if (!"PARALISADO".equals(ts.getStatus()) || concluido) {
            ts.setStatus(statusToSet);
            trilhaStatusRepository.save(ts);
        }
    }

    @Transactional
    public void salvarStatusManualmente(Long membroId, Long trilhaId, Long conteudoId, String status) {
        Membro m = membroRepository.findById(membroId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Membro não encontrado"));

        if (trilhaId != null) {
            TrilhaStatus ts = trilhaStatusRepository.findByMembroIdAndTrilhaId(membroId, trilhaId)
                    .orElseGet(() -> {
                        Trilha t = trilhaRepository.findById(trilhaId).orElseThrow();
                        return TrilhaStatus.builder().membro(m).trilha(t).build();
                    });
            ts.setStatus(status.toUpperCase());
            trilhaStatusRepository.save(ts);
        } else if (conteudoId != null) {
            TrilhaStatus ts = trilhaStatusRepository.findByMembroIdAndConteudoId(membroId, conteudoId)
                    .orElseGet(() -> {
                        TrilhaConteudo tc = trilhaConteudoRepository.findById(conteudoId).orElseThrow();
                        return TrilhaStatus.builder().membro(m).conteudo(tc).build();
                    });
            ts.setStatus(status.toUpperCase());
            trilhaStatusRepository.save(ts);
        }
    }

    @Transactional
    public TrilhaDTO criarTrilha(TrilhaDTO dto) {
        Membro ator = dto.atorId() != null ? membroRepository.findById(dto.atorId()).orElse(null) : null;
        Trilha t = Trilha.builder()
                .titulo(dto.titulo())
                .descricao(dto.descricao())
                .tipo(dto.tipo().toUpperCase())
                .imagemUrl(dto.imagemUrl())
                .ator(ator)
                .build();
        return TrilhaDTO.fromEntity(trilhaRepository.save(t));
    }

    @Transactional
    public TrilhaDTO atualizarTrilha(Long id, TrilhaDTO dto) {
        Trilha t = trilhaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trilha não encontrada"));
        
        Membro ator = dto.atorId() != null ? membroRepository.findById(dto.atorId()).orElse(null) : null;
        t.setTitulo(dto.titulo());
        t.setDescricao(dto.descricao());
        t.setTipo(dto.tipo().toUpperCase());
        t.setImagemUrl(dto.imagemUrl());
        t.setAtor(ator);
        
        return TrilhaDTO.fromEntity(trilhaRepository.save(t));
    }

    @Transactional
    public TrilhaConteudoDTO adicionarConteudo(Long trilhaId, TrilhaConteudoDTO dto) {
        Trilha t = (trilhaId == null) ? null : trilhaRepository.findById(trilhaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trilha não encontrada"));

        // Ordem Incremental Automática se vier zerada ou nula
        int ordemDefinida = dto.ordem();
        if (ordemDefinida <= 0) {
            if (t != null) {
                ordemDefinida = trilhaConteudoRepository.obterOrdemMaximaPorTrilhaId(t.getId()) + 1;
            } else {
                ordemDefinida = trilhaConteudoRepository.obterOrdemMaximaPorTrilhaIsNull() + 1;
            }
        }

        Membro ator = dto.atorId() != null ? membroRepository.findById(dto.atorId()).orElse(null) : null;
        TrilhaConteudo tc = TrilhaConteudo.builder()
                .trilha(t)
                .titulo(dto.titulo())
                .resumo(dto.resumo())
                .textoCompleto(dto.textoCompleto())
                .videoUrl(dto.videoUrl())
                .pdfUrl(dto.pdfUrl())
                .ordem(ordemDefinida)
                .dataCadastro(LocalDateTime.now())
                .ator(ator)
                .build();

        return TrilhaConteudoDTO.fromEntity(trilhaConteudoRepository.save(tc), false);
    }

    @Transactional
    public TrilhaConteudoDTO atualizarConteudo(Long conteudoId, TrilhaConteudoDTO dto) {
        TrilhaConteudo tc = trilhaConteudoRepository.findById(conteudoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conteúdo não encontrado"));

        Membro ator = dto.atorId() != null ? membroRepository.findById(dto.atorId()).orElse(null) : null;
        tc.setTitulo(dto.titulo());
        tc.setResumo(dto.resumo());
        tc.setTextoCompleto(dto.textoCompleto());
        tc.setVideoUrl(dto.videoUrl());
        tc.setPdfUrl(dto.pdfUrl());
        tc.setOrdem(dto.ordem());
        tc.setAtor(ator);

        return TrilhaConteudoDTO.fromEntity(trilhaConteudoRepository.save(tc), dto.concluido());
    }

    @Transactional(readOnly = true)
    public List<TrilhaDTO> obterEstudosIniciados(Long membroId, String statusFiltro, String buscaNome) {
        List<TrilhaStatus> listStatus = trilhaStatusRepository.findByMembroId(membroId);
        List<TrilhaDTO> result = new ArrayList<>();

        for (TrilhaStatus ts : listStatus) {
            // Filtro pelo status
            if (statusFiltro != null && !statusFiltro.isBlank() && !statusFiltro.equalsIgnoreCase("ALL")) {
                if (!ts.getStatus().equalsIgnoreCase(statusFiltro)) {
                    continue;
                }
            }

            if (ts.getTrilha() != null) {
                Trilha t = ts.getTrilha();
                // Filtro pelo nome da trilha
                if (buscaNome != null && !buscaNome.isBlank() && !t.getTitulo().toLowerCase().contains(buscaNome.toLowerCase())) {
                    continue;
                }

                // Calcular progresso
                List<TrilhaConteudo> totalAulas = trilhaConteudoRepository.findByTrilhaIdOrderByOrdemAsc(t.getId());
                int percentual = 0;
                if (!totalAulas.isEmpty()) {
                    long concluidas = trilhaProgressoRepository.findByMembroId(membroId)
                            .stream()
                            .filter(p -> p.isConcluido() && p.getConteudo().getTrilha() != null && p.getConteudo().getTrilha().getId().equals(t.getId()))
                            .count();
                    percentual = (int) Math.round(((double) concluidas / totalAulas.size()) * 100);
                }
                result.add(TrilhaDTO.fromEntity(t, ts.getStatus(), percentual));

            } else if (ts.getConteudo() != null) {
                TrilhaConteudo tc = ts.getConteudo();
                // Filtro pelo nome do conteúdo avulso
                if (buscaNome != null && !buscaNome.isBlank() && !tc.getTitulo().toLowerCase().contains(buscaNome.toLowerCase())) {
                    continue;
                }

                // Conteúdo avulso concluído ou em andamento
                boolean concluida = trilhaProgressoRepository.findByMembroIdAndConteudoId(membroId, tc.getId())
                        .map(TrilhaProgresso::isConcluido)
                        .orElse(false);

                // Criamos um TrilhaDTO falso do tipo "AVULSO" para homogeneizar o layout
                result.add(new TrilhaDTO(
                        tc.getId(),
                        tc.getTitulo(),
                        tc.getResumo(),
                        "AVULSO",
                        null,
                        ts.getStatus(),
                        concluida ? 100 : 0,
                        tc.getAtor() != null ? tc.getAtor().getId() : null,
                        tc.getAtor() != null ? tc.getAtor().getNomeCompleto() : null
                ));
            }
        }
        return result;
    }
}
