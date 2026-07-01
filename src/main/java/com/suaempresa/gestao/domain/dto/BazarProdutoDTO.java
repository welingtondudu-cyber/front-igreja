package com.suaempresa.gestao.domain.dto;

import java.math.BigDecimal;

public record BazarProdutoDTO(
    Long id,
    Long bazarId,
    String titulo,
    String descricao,
    BigDecimal preco,
    String fotoUrl,
    Long totalEstoque,
    Long totalVendido
) {}
