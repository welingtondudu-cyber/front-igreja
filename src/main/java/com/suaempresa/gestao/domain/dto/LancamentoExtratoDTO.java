package com.suaempresa.gestao.domain.dto;

import com.suaempresa.gestao.domain.entity.TipoFluxo;
import java.math.BigDecimal;
import java.time.LocalDate;

public record LancamentoExtratoDTO(
    Long id,
    LocalDate data,
    String descricao,
    String nomeCategoria,
    TipoFluxo tipoFluxo,
    BigDecimal valor,
    boolean statusConciliado,
    Long membroDizimistaId,
    String nomeMembroDizimista
) {}
