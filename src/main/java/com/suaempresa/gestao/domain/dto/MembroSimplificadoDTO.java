package com.suaempresa.gestao.domain.dto;

public record MembroSimplificadoDTO(
        String matricula,
        String nomeCompleto,
        String fotoPerfilUrl,
        String tituloCargo,
        String statusCadastro) {
    public MembroSimplificadoDTO(Long id, String nomeCompleto, String fotoPerfilUrl, String tituloCargo, String statusCadastro) {
        this(id != null ? String.format("%04d", id) : null, nomeCompleto, fotoPerfilUrl, tituloCargo, statusCadastro);
    }
}
