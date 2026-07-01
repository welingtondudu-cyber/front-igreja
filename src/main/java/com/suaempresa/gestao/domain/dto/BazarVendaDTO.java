package com.suaempresa.gestao.domain.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record BazarVendaDTO(
    Long id,
    Long bazarId,
    BigDecimal valorTotal,
    String formaPagamento,
    LocalDateTime dataVenda,
    List<String> seriais
) {}
