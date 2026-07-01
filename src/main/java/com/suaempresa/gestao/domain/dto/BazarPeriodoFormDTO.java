package com.suaempresa.gestao.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BazarPeriodoFormDTO(
    @NotBlank(message = "O nome do bazar não pode ser vazio")
    @Size(max = 100, message = "O nome do bazar deve ter no máximo 100 caracteres")
    String nomeBazar
) {}
