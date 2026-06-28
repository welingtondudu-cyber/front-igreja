package com.suaempresa.gestao.domain.dto;

import java.math.BigDecimal;
import java.util.List;

public record FinanceiroDashboardDTO(
    BigDecimal receitaOperacional,
    double receitaTendenciaPercentual,
    BigDecimal despesasConsolidadas,
    double despesasTendenciaPercentual,
    BigDecimal saldoDoMes,
    double dizimistasAtivosPercentual,
    double dizimistasAtivosTendenciaPercentual,
    List<CategoriaDistribuicaoDTO> distribuicaoEntradas,
    List<CategoriaDistribuicaoDTO> distribuicaoSaidas,
    List<FechamentoMensalResumoDTO> historicoSaldos
) {}
