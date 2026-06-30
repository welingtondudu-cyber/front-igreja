package com.suaempresa.gestao.domain.dto;

import com.suaempresa.gestao.domain.entity.MembroHistorico;
import java.time.LocalDateTime;

public record MembroHistoricoDTO(
        Long id,
        String campoAlterado,
        String valorAntigo,
        String valorNovo,
        LocalDateTime dataAlteracao,
        Long usuarioId
) {
    public static MembroHistoricoDTO fromEntity(MembroHistorico h) {
        return new MembroHistoricoDTO(
                h.getId(),
                h.getCampoAlterado(),
                h.getValorAntigo(),
                h.getValorNovo(),
                h.getDataAlteracao(),
                h.getUsuarioId()
        );
    }
}
