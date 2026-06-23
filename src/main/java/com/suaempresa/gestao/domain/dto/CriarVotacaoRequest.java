package com.suaempresa.gestao.domain.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

public record CriarVotacaoRequest(
        @NotBlank(message = "Título é obrigatório")
        @Size(max = 150, message = "Título deve ter no máximo 150 caracteres")
        String titulo,

        String descricao,

        Integer limiteVotos,

        @NotEmpty(message = "A lista de opções não pode ser vazia")
        @Valid
        List<CriarOpcaoRequest> opcoes
) {
    public CriarVotacaoRequest {
        if (limiteVotos == null) {
            limiteVotos = 1;
        }
    }

    public record CriarOpcaoRequest(
            @NotBlank(message = "Título da opção é obrigatório")
            @Size(max = 150, message = "Título da opção deve ter no máximo 150 caracteres")
            String tituloOpcao,

            Long membroId
    ) {}
}
