package com.suaempresa.gestao.domain.dto;

public record ElegibilidadeRequest(
        Long votacaoId,
        String cpf,
        Integer anoNascimento
) {}
