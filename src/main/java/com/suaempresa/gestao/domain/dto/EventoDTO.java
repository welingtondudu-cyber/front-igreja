package com.suaempresa.gestao.domain.dto;

import com.suaempresa.gestao.domain.entity.Evento;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record EventoDTO(
        Long id,
        String titulo,
        LocalDate data,
        LocalTime hora,
        String observacoes,
        String imagemUrl,
        List<CargoResumoDTO> cargosExigidos,
        List<GrupoResumoDTO> gruposExigidos
) {
    public static EventoDTO fromEntity(Evento e) {
        List<CargoResumoDTO> cargos = e.getCargosNecessarios() != null
                ? e.getCargosNecessarios().stream().map(CargoResumoDTO::fromEntity).toList()
                : List.of();
        List<GrupoResumoDTO> grupos = e.getGruposNecessarios() != null
                ? e.getGruposNecessarios().stream().map(GrupoResumoDTO::fromEntity).toList()
                : List.of();
        return new EventoDTO(
                e.getId(),
                e.getTitulo(),
                e.getData(),
                e.getHora(),
                e.getObservacoes(),
                e.getImagemUrl(),
                cargos,
                grupos
        );
    }
}
