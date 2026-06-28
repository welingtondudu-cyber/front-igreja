package com.suaempresa.gestao.domain.dto;

import java.math.BigDecimal;

public record CategoriaDistribuicaoDTO(
    String nome,
    BigDecimal valorTotal,
    double percentualQueRepresenta
) {}
