package com.suaempresa.gestao.domain.dto;

public record BazarResponsavelDTO(
    Long id,
    Long bazarId,
    Long membroId,
    String nomeMembro,
    String fotoPerfilUrl
) {}
