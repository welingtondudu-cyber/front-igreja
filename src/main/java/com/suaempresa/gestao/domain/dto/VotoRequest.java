package com.suaempresa.gestao.domain.dto;

import java.util.List;

public record VotoRequest(
        Long votacaoId,
        Long membroId,
        List<Long> opcoesIds
) {}
