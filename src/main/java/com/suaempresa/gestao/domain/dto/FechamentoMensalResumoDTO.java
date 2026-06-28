package com.suaempresa.gestao.domain.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record FechamentoMensalResumoDTO(
    Long id,
    int ano,
    int mes,
    BigDecimal saldoInicial,
    BigDecimal entradasDoMes,
    BigDecimal saidasDoMes,
    BigDecimal saldoFinal,
    LocalDateTime dataFechamento,
    Long usuarioId,
    boolean trancado
) {}
