package com.suaempresa.gestao.domain.dto;

import com.suaempresa.gestao.domain.entity.Trilha;

public record TrilhaDTO(
        Long id,
        String titulo,
        String descricao,
        String tipo,
        String imagemUrl,
        String status,
        Integer percentual,
        Long atorId,
        String atorNome
) {
    public static TrilhaDTO fromEntity(Trilha t) {
        return new TrilhaDTO(
                t.getId(),
                t.getTitulo(),
                t.getDescricao(),
                t.getTipo(),
                t.getImagemUrl(),
                null,
                null,
                t.getAtor() != null ? t.getAtor().getId() : null,
                t.getAtor() != null ? t.getAtor().getNomeCompleto() : null
        );
    }

    public static TrilhaDTO fromEntity(Trilha t, String status, Integer percentual) {
        return new TrilhaDTO(
                t.getId(),
                t.getTitulo(),
                t.getDescricao(),
                t.getTipo(),
                t.getImagemUrl(),
                status,
                percentual,
                t.getAtor() != null ? t.getAtor().getId() : null,
                t.getAtor() != null ? t.getAtor().getNomeCompleto() : null
        );
    }
}
