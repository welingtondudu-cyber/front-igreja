package com.suaempresa.gestao.domain.dto;

import com.suaempresa.gestao.domain.entity.Grupo;
import com.suaempresa.gestao.domain.entity.TipoGrupo;

public record MembroGrupoDTO(
        String nomeGrupo,
        TipoGrupo tipoGrupo
) {
    public static MembroGrupoDTO fromEntity(Grupo g) {
        return new MembroGrupoDTO(g.getNomeGrupo(), g.getTipoGrupo());
    }
}
