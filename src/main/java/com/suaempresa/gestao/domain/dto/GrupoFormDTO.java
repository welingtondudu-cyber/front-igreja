package com.suaempresa.gestao.domain.dto;

import com.suaempresa.gestao.domain.entity.TipoGrupo;

public record GrupoFormDTO(
        String nomeGrupo,
        Long liderId,
        TipoGrupo tipoGrupo
) {}
