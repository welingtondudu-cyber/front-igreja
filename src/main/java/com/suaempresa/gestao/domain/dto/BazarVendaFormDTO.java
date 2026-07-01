package com.suaempresa.gestao.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record BazarVendaFormDTO(
    @NotNull(message = "O ID do bazar é obrigatório")
    Long bazarId,

    @NotEmpty(message = "A venda deve conter ao menos um item de estoque")
    List<String> seriais,

    @NotBlank(message = "A forma de pagamento é obrigatória")
    String formaPagamento // "PIX", "DINHEIRO", "CARTAO"
) {}
