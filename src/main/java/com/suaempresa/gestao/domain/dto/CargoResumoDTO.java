package com.suaempresa.gestao.domain.dto;

import com.suaempresa.gestao.domain.entity.Cargo;

public record CargoResumoDTO(
        Long id,
        String titulo
) {
    public static CargoResumoDTO fromEntity(Cargo c) {
        if (c == null) return null;
        return new CargoResumoDTO(c.getId(), c.getTitulo());
    }
}
