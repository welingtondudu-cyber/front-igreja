package com.suaempresa.gestao.domain.dto;

import com.suaempresa.gestao.domain.entity.Noticia;
import java.time.LocalDateTime;

public record NoticiaDTO(
        Long id,
        String titulo,
        String conteudo,
        String imagemUrl,
        LocalDateTime dataPublicacao,
        String sociedade
) {
    public static NoticiaDTO fromEntity(Noticia n) {
        return new NoticiaDTO(
                n.getId(),
                n.getTitulo(),
                n.getConteudo(),
                n.getImagemUrl(),
                n.getDataPublicacao(),
                n.getSociedade()
        );
    }
}
