package com.suaempresa.gestao.domain.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.List;

public record ProdutoImportFormDTO(
    @NotNull(message = "O ID do bazar é obrigatório")
    Long bazarId,

    @NotNull(message = "A lista de produtos não pode ser nula")
    List<@Valid ItemImport> produtos
) {
    public record ItemImport(
        @NotBlank(message = "O título é obrigatório")
        String titulo,
        String descricao,
        @NotNull(message = "O preço é obrigatório")
        @Positive(message = "O preço deve ser positivo")
        BigDecimal preco,
        String fotoUrl,
        @NotNull(message = "A quantidade de estoque é obrigatória")
        @Positive(message = "A quantidade deve ser positiva")
        Integer quantidade
    ) {}
}
