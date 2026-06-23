package com.suaempresa.gestao.domain.dto;

public record MembroSimplificadoDTO(
        Long id,
        String nomeCompleto,
        String fotoPerfilUrl,
        String tituloCargo,
        String statusCadastro
) {
}
