package com.suaempresa.gestao.domain.dto;

import com.suaempresa.gestao.domain.entity.TrilhaConteudo;
import java.time.LocalDateTime;

public record TrilhaConteudoDTO(
        Long id,
        Long trilhaId,
        String titulo,
        String resumo,
        String textoCompleto,
        String videoUrl,
        String pdfUrl,
        int ordem,
        LocalDateTime dataCadastro,
        boolean concluido,
        Long atorId,
        String atorNome
) {
    public static TrilhaConteudoDTO fromEntity(TrilhaConteudo tc, boolean concluido) {
        return new TrilhaConteudoDTO(
                tc.getId(),
                tc.getTrilha() != null ? tc.getTrilha().getId() : null,
                tc.getTitulo(),
                tc.getResumo(),
                tc.getTextoCompleto(),
                tc.getVideoUrl(),
                tc.getPdfUrl(),
                tc.getOrdem(),
                tc.getDataCadastro(),
                concluido,
                tc.getAtor() != null ? tc.getAtor().getId() : null,
                tc.getAtor() != null ? tc.getAtor().getNomeCompleto() : null
        );
    }
}
