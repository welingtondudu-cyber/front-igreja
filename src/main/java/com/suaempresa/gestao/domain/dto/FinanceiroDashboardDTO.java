package com.suaempresa.gestao.domain.dto;

import java.math.BigDecimal;
import java.util.List;

public record FinanceiroDashboardDTO(
    BigDecimal receitaOperacional,
    Double receitaTendenciaPercentual,       // null = sem dados para comparar
    BigDecimal despesasConsolidadas,
    Double despesasTendenciaPercentual,      // null = sem dados para comparar
    BigDecimal saldoDoMes,
    double dizimistasAtivosPercentual,
    Double dizimistasAtivosTendenciaPercentual, // null = sem dados para comparar
    List<CategoriaDistribuicaoDTO> distribuicaoEntradas,
    List<CategoriaDistribuicaoDTO> distribuicaoSaidas,
    List<FechamentoMensalResumoDTO> historicoSaldos
) {}
