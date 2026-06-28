package com.suaempresa.gestao.domain.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record ExclusaoLoteDTO(
    @NotEmpty(message = "A lista de IDs não pode ser vazia")
    List<Long> ids
) {}
