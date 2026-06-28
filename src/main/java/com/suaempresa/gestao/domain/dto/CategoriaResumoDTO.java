package com.suaempresa.gestao.domain.dto;

import com.suaempresa.gestao.domain.entity.TipoFluxo;

public record CategoriaResumoDTO(
    Long id,
    String nome,
    TipoFluxo tipoFluxo
) {}
