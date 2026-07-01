package com.suaempresa.gestao.domain.dto;

import java.time.LocalDateTime;

public record BazarPeriodoDTO(
    Long id,
    String nomeBazar,
    String status,
    LocalDateTime dataInicio,
    LocalDateTime dataFechamento
) {}
