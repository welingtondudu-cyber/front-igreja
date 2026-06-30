package com.suaempresa.gestao.domain.dto;

import com.suaempresa.gestao.domain.entity.Grupo;
import com.suaempresa.gestao.domain.entity.TipoGrupo;

public record GrupoResumoDTO(
        Long id,
        String nomeGrupo,
        TipoGrupo tipoGrupo
) {
    public static GrupoResumoDTO fromEntity(Grupo g) {
        if (g == null) return null;
        return new GrupoResumoDTO(
                g.getId(),
                g.getNomeGrupo(),
                g.getTipoGrupo()
        );
    }
}
