package com.suaempresa.gestao.domain.dto;

import com.suaempresa.gestao.domain.entity.TipoFluxo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;

public record CadastroLancamentoDTO(
    @NotBlank(message = "Descrição é obrigatória")
    String descricao,

    @NotNull(message = "Valor é obrigatório")
    @Positive(message = "Valor deve ser positivo")
    BigDecimal valor,

    @NotNull(message = "Data é obrigatória")
    @PastOrPresent(message = "Data não pode ser futura")
    LocalDate data,

    @NotNull(message = "Tipo de fluxo é obrigatório")
    TipoFluxo tipoFluxo,

    @NotNull(message = "Categoria é obrigatória")
    Long categoriaId,

    Long membroDizimistaId
) {}
