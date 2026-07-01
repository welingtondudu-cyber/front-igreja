package com.suaempresa.gestao.domain.dto;

import com.suaempresa.gestao.domain.entity.Escala;

public record EscalaDetalheDTO(
        Long id,
        Long membroId,
        String matricula,
        String nomeMembro,
        Long cargoId,
        String nomeCargo,
        Long grupoId,
        String nomeGrupo,
        String funcaoEspecifica,
        String statusConfirmacao,
        String motivoRecusa,
        String tituloEvento,
        java.time.LocalDate dataEvento,
        java.time.LocalTime horaEvento,
        String statusEvento
) {
    public static EscalaDetalheDTO fromEntity(Escala esc) {
        return new EscalaDetalheDTO(
                esc.getId(),
                esc.getMembro() != null ? esc.getMembro().getId() : null,
                esc.getMembro() != null ? String.format("%04d", esc.getMembro().getId()) : null,
                esc.getMembro() != null ? esc.getMembro().getNomeCompleto() : null,
                (esc.getMembro() != null && esc.getMembro().getCargo() != null) ? esc.getMembro().getCargo().getId() : null,
                (esc.getMembro() != null && esc.getMembro().getCargo() != null) ? esc.getMembro().getCargo().getTitulo() : null,
                esc.getGrupo() != null ? esc.getGrupo().getId() : null,
                esc.getGrupo() != null ? esc.getGrupo().getNomeGrupo() : null,
                esc.getFuncaoEspecifica(),
                esc.getStatusConfirmacao(),
                esc.getMotivoRecusa(),
                esc.getEvento() != null ? esc.getEvento().getTitulo() : null,
                esc.getEvento() != null ? esc.getEvento().getData() : null,
                esc.getEvento() != null ? esc.getEvento().getHora() : null,
                esc.getEvento() != null ? esc.getEvento().getStatus() : "AGENDADO"
        );
    }
}
