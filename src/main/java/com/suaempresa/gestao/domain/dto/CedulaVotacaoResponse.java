package com.suaempresa.gestao.domain.dto;

import java.util.List;

public record CedulaVotacaoResponse(
        Long votacaoId,
        String titulo,
        String descricao,
        Integer limiteVotos,
        List<OpcaoCedulaDTO> opcoes
) {
    public record OpcaoCedulaDTO(
            Long opcaoId,
            String tituloOpcao,
            Long membroId,
            String fotoUrl
    ) {}
}
