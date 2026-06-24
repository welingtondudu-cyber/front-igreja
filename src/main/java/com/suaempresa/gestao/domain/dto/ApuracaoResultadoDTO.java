package com.suaempresa.gestao.domain.dto;

public record ApuracaoResultadoDTO(
        Long opcaoId,
        String tituloOpcao,
        String membroMatricula,
        String fotoUrl,
        Long totalVotos,
        Double percentual,
        String nomeMembro
) {
    public ApuracaoResultadoDTO(Long opcaoId, String tituloOpcao, Long membroId, String fotoUrl, Long totalVotos, Double percentual, String nomeMembro) {
        this(opcaoId, tituloOpcao, membroId != null ? String.format("%04d", membroId) : null, fotoUrl, totalVotos, percentual, nomeMembro);
    }
}
