package com.suaempresa.gestao.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record MembroRelacionamentoFormDTO(
    @NotNull(message = "O ID do membro é obrigatório")
    Long membroId,
    @NotNull(message = "O ID do parente é obrigatório")
    Long parenteId,
    @NotBlank(message = "O tipo de vínculo é obrigatório")
    String tipoVinculo, // 'CONJUGE' ou 'PAI_MAE'
    LocalDate dataCasamento
) {}
