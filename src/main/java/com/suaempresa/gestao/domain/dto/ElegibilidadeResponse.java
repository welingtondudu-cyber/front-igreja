package com.suaempresa.gestao.domain.dto;

public record ElegibilidadeResponse(
        Long membroId,
        String nomeMembro,
        String tituloVotacao,
        Integer limiteVotos
) {}
