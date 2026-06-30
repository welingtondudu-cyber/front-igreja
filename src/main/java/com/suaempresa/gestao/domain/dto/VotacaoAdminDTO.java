package com.suaempresa.gestao.domain.dto;

import java.time.LocalDateTime;

public record VotacaoAdminDTO(Long id, String titulo, boolean ativa, LocalDateTime dataCriacao, Integer idadeLimite, LocalDateTime dataEncerramento) {}
