package com.suaempresa.gestao.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record EventoFormDTO(
        @NotBlank(message = "O título do evento é obrigatório")
        String titulo,

        @NotNull(message = "A data é obrigatória")
        LocalDate data,

        @NotNull(message = "A hora é obrigatória")
        LocalTime hora,

        String observacoes,
        String imagemUrl,
        List<Long> cargosIds,
        List<Long> gruposIds
) {}
