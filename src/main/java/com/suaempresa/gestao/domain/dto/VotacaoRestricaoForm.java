package com.suaempresa.gestao.domain.dto;

import jakarta.validation.constraints.NotBlank;

public record VotacaoRestricaoForm(
        @NotBlank(message = "Matrícula do membro é obrigatória")
        String matricula,
        
        @NotBlank(message = "Motivo da restrição é obrigatório")
        String motivo
) {}
