package com.suaempresa.gestao.domain.dto;

public record MembroRelacionamentoDTO(
    Long id,
    Long parenteId,
    String nomeCompleto,
    String fotoPerfilUrl,
    String tipoVinculo,
    String dataCasamento
) {}
