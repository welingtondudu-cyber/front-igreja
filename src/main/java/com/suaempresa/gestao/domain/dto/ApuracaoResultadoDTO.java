package com.suaempresa.gestao.domain.dto;

public record ApuracaoResultadoDTO(
        Long opcaoId,
        String tituloOpcao,
        Long membroId,
        String fotoUrl,
        Long totalVotos,
        Double percentual,
        String nomeMembro
) {}
