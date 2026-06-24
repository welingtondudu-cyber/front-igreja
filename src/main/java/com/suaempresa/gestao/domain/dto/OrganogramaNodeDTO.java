package com.suaempresa.gestao.domain.dto;

import java.util.List;

public record OrganogramaNodeDTO(
        String matricula,
        String nomeCompleto,
        String fotoPerfilUrl,
        String tituloCargo,
        Integer pesoHierarquico,
        List<OrganogramaNodeDTO> liderados
) {
    public OrganogramaNodeDTO(Long id, String nomeCompleto, String fotoPerfilUrl, String tituloCargo, Integer pesoHierarquico, List<OrganogramaNodeDTO> liderados) {
        this(id != null ? String.format("%04d", id) : null, nomeCompleto, fotoPerfilUrl, tituloCargo, pesoHierarquico, liderados);
    }
}
