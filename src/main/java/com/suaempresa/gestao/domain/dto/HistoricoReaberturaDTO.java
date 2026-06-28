package com.suaempresa.gestao.domain.dto;

import java.time.LocalDateTime;

public record HistoricoReaberturaDTO(
    Long id,
    int ano,
    int mes,
    String motivo,
    LocalDateTime dataReabertura,
    Long usuarioId
) {}
