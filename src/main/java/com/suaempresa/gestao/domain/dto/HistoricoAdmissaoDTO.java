package com.suaempresa.gestao.domain.dto;

public record HistoricoAdmissaoDTO(
    int ano,
    int mes,
    String labelMes,
    long quantidade
) {}
