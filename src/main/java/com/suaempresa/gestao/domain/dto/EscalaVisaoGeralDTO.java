package com.suaempresa.gestao.domain.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

public record EscalaVisaoGeralDTO(
        Long id,
        String titulo,
        LocalDate data,
        LocalTime hora,
        String observacoes,
        String imagemUrl,
        Map<String, String> statusEquipes,
        List<Long> gruposNecessariosIds,
        List<EscalaMembroResumoDTO> membrosEscalados
) {}
