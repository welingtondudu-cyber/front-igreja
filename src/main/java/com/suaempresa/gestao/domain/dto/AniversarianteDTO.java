package com.suaempresa.gestao.domain.dto;

public record AniversarianteDTO(
    Long id,
    String nomeCompleto,
    String fotoPerfilUrl,
    int dia,
    boolean isAniversarianteDoDia
) {}
