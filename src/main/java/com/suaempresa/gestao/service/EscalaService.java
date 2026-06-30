package com.suaempresa.gestao.service;

import com.suaempresa.gestao.domain.dto.EventoDTO;
import com.suaempresa.gestao.domain.dto.EventoFormDTO;
import com.suaempresa.gestao.domain.dto.EscalaDetalheDTO;
import com.suaempresa.gestao.domain.dto.EscalaFormDTO;
import com.suaempresa.gestao.domain.dto.EscalaMembroResumoDTO;
import com.suaempresa.gestao.domain.dto.EscalaVisaoGeralDTO;
import com.suaempresa.gestao.domain.entity.Cargo;
import com.suaempresa.gestao.domain.entity.Evento;
import com.suaempresa.gestao.domain.entity.Escala;
import com.suaempresa.gestao.domain.entity.Membro;
import com.suaempresa.gestao.domain.entity.Grupo;
import com.suaempresa.gestao.repository.CargoRepository;
import com.suaempresa.gestao.repository.EventoRepository;
import com.suaempresa.gestao.repository.EscalaRepository;
import com.suaempresa.gestao.repository.MembroRepository;
import com.suaempresa.gestao.repository.GrupoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EscalaService {

    private final EventoRepository eventoRepository;
    private final EscalaRepository escalaRepository;
    private final CargoRepository cargoRepository;
    private final MembroRepository membroRepository;
    private final GrupoRepository grupoRepository;

    @Transactional
    public EventoDTO criarEvento(EventoFormDTO dto) {
        List<Grupo> grupos = List.of();
        if (dto.gruposIds() != null && !dto.gruposIds().isEmpty()) {
            grupos = grupoRepository.findAllById(dto.gruposIds());
        }
        Evento e = Evento.builder()
                .titulo(dto.titulo())
                .data(dto.data())
                .hora(dto.hora())
                .observacoes(dto.observacoes())
                .imagemUrl(dto.imagemUrl())
                .gruposNecessarios(grupos)
                .build();
        return EventoDTO.fromEntity(eventoRepository.save(e));
    }

    @Transactional
    public EventoDTO atualizarEvento(Long id, EventoFormDTO dto) {
        Evento e = eventoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento não encontrado"));
        e.setTitulo(dto.titulo());
        e.setData(dto.data());
        e.setHora(dto.hora());
        e.setObservacoes(dto.observacoes());
        if (dto.imagemUrl() != null) {
            e.setImagemUrl(dto.imagemUrl());
        }
        if (dto.gruposIds() != null) {
            e.setGruposNecessarios(grupoRepository.findAllById(dto.gruposIds()));
        }
        return EventoDTO.fromEntity(eventoRepository.save(e));
    }

    @Transactional(readOnly = true)
    public List<EscalaVisaoGeralDTO> obterVisaoGeral(LocalDate dataInicio, LocalDate dataFim) {
        LocalDate inicio = dataInicio != null ? dataInicio : LocalDate.now().withDayOfMonth(1);
        LocalDate fim = dataFim != null ? dataFim : LocalDate.now().plusMonths(3);

        List<Evento> eventos = eventoRepository.findByDataBetweenWithCargos(inicio, fim);
        List<EscalaVisaoGeralDTO> dtos = new ArrayList<>();

        for (Evento e : eventos) {
            List<Escala> escalasEvento = escalaRepository.findByEventoId(e.getId());
            Map<String, String> statusEquipes = new LinkedHashMap<>();

            for (Grupo g : e.getGruposNecessarios()) {
                List<Escala> escalasDoGrupo = escalasEvento.stream()
                        .filter(esc -> esc.getGrupo() != null && esc.getGrupo().getId().equals(g.getId()))
                        .toList();

                if (escalasDoGrupo.isEmpty()) {
                    statusEquipes.put(g.getNomeGrupo(), "PENDENTE");
                } else {
                    boolean temRecusado = escalasDoGrupo.stream().anyMatch(esc -> "RECUSADO".equalsIgnoreCase(esc.getStatusConfirmacao()));
                    boolean temPendente = escalasDoGrupo.stream().anyMatch(esc -> "PENDENTE".equalsIgnoreCase(esc.getStatusConfirmacao()));

                    if (temRecusado) {
                        statusEquipes.put(g.getNomeGrupo(), "RECUSADO");
                    } else if (temPendente) {
                        statusEquipes.put(g.getNomeGrupo(), "PENDENTE");
                    } else {
                        statusEquipes.put(g.getNomeGrupo(), "OK");
                    }
                }
            }

            List<Long> gruposNecessariosIds = e.getGruposNecessarios() != null
                    ? e.getGruposNecessarios().stream().map(Grupo::getId).toList()
                    : List.of();

            List<EscalaMembroResumoDTO> membrosEscalados = escalasEvento.stream()
                    .map(esc -> new EscalaMembroResumoDTO(
                            esc.getGrupo() != null ? esc.getGrupo().getNomeGrupo() : "N/A",
                            esc.getMembro() != null ? esc.getMembro().getNomeCompleto() : "N/A",
                            esc.getFuncaoEspecifica() != null ? esc.getFuncaoEspecifica() : "",
                            esc.getStatusConfirmacao() != null ? esc.getStatusConfirmacao() : "PENDENTE"
                    ))
                    .toList();

            dtos.add(new EscalaVisaoGeralDTO(
                    e.getId(),
                    e.getTitulo(),
                    e.getData(),
                    e.getHora(),
                    e.getObservacoes(),
                    e.getImagemUrl(),
                    statusEquipes,
                    gruposNecessariosIds,
                    membrosEscalados
            ));
        }

        return dtos;
    }

    @Transactional(readOnly = true)
    public List<EscalaDetalheDTO> obterEscalasDoEvento(Long eventoId) {
        return escalaRepository.findByEventoId(eventoId)
                .stream()
                .map(EscalaDetalheDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<EscalaDetalheDTO> obterEscalasDoMembro(Long membroId) {
        return escalaRepository.findByMembroId(membroId)
                .stream()
                .map(EscalaDetalheDTO::fromEntity)
                .toList();
    }

    @Transactional
    public List<EscalaDetalheDTO> salvarEscalasDoEvento(Long eventoId, List<EscalaFormDTO> dtos) {
        Evento evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento não encontrado"));

        // Limpar escalas antigas e recriar
        escalaRepository.deleteByEventoId(eventoId);
        escalaRepository.flush();

        List<Escala> novas = new ArrayList<>();
        Set<Long> membrosEscalados = new HashSet<>();

        for (EscalaFormDTO d : dtos) {
            if (!membrosEscalados.add(d.membroId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O voluntário já está escalado para este culto/evento.");
            }

            Membro m = membroRepository.findById(d.membroId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Membro não encontrado: " + d.membroId()));

            Grupo g = null;
            if (d.grupoId() != null) {
                g = grupoRepository.findById(d.grupoId()).orElse(null);
            }

            Escala esc = Escala.builder()
                    .evento(evento)
                    .membro(m)
                    .grupo(g)
                    .funcaoEspecifica(d.funcaoEspecifica())
                    .statusConfirmacao(d.statusConfirmacao() != null ? d.statusConfirmacao() : "PENDENTE")
                    .motivoRecusa(d.motivoRecusa())
                    .build();

            novas.add(escalaRepository.save(esc));
        }

        return novas.stream().map(EscalaDetalheDTO::fromEntity).toList();
    }

    @Transactional
    public void responderEscala(Long escalaId, String status, String motivo) {
        Escala esc = escalaRepository.findById(escalaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Escala não encontrada"));
        esc.setStatusConfirmacao(status.toUpperCase());
        esc.setMotivoRecusa(motivo);
        escalaRepository.save(esc);
    }
}
