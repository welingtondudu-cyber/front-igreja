package com.suaempresa.gestao.domain.dto;

import java.util.List;

public record OrganogramaNodeDTO(
        Long id,
        String nomeCompleto,
        String fotoPerfilUrl,
        String tituloCargo,
        Integer pesoHierarquico,
        List<OrganogramaNodeDTO> liderados
) {}
