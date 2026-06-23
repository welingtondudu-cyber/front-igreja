package com.suaempresa.gestao.domain.dto;

import java.util.List;

public record ApuracaoResponse(
        Long totalAptos,
        Long totalVotaram,
        Double percentualParticipacao,
        List<ApuracaoResultadoDTO> resultados
) {}
