package com.suaempresa.gestao.domain.dto;

import com.suaempresa.gestao.domain.entity.Grupo;
import com.suaempresa.gestao.domain.entity.TipoGrupo;

public record GrupoDTO(
        Long id,
        String nomeGrupo,
        TipoGrupo tipoGrupo,
        Long idLider,
        String nomeLider,
        String fotoPerfilLider
) {
    public static GrupoDTO fromEntity(Grupo g) {
        return new GrupoDTO(
                g.getId(),
                g.getNomeGrupo(),
                g.getTipoGrupo(),
                g.getLider() != null ? g.getLider().getId() : null,
                g.getLider() != null ? g.getLider().getNomeCompleto() : null,
                g.getLider() != null ? g.getLider().getFotoPerfilUrl() : null
        );
    }
}
