package com.suaempresa.gestao.domain.dto;

import jakarta.validation.constraints.NotNull;

public record EscalaFormDTO(
        @NotNull(message = "O membro é obrigatório")
        Long membroId,

        Long grupoId,
        String funcaoEspecifica,
        String statusConfirmacao,
        String motivoRecusa
) {}
