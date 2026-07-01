package com.suaempresa.gestao.domain.dto;

public record AtividadeMinisterioDTO(
    Long grupoId,
    String nomeGrupo,
    int totalMembros,
    int membrosAtivos,
    double indiceAtividade
) {}
