package com.suaempresa.gestao.domain.dto;

import jakarta.validation.constraints.NotNull;

public record BazarResponsavelFormDTO(
    @NotNull(message = "O ID do bazar é obrigatório")
    Long bazarId,
    @NotNull(message = "O ID do membro é obrigatório")
    Long membroId
) {}
