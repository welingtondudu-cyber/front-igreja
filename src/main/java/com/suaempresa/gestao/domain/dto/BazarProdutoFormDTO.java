package com.suaempresa.gestao.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record BazarProdutoFormDTO(
    @NotBlank(message = "O título é obrigatório")
    String titulo,
    String descricao,
    @NotNull(message = "O preço é obrigatório")
    @Positive(message = "O preço deve ser positivo")
    BigDecimal preco,
    String fotoUrl,
    Integer quantidade
) {}
