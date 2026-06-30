package com.suaempresa.gestao.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(schema = "gestao", name = "noticias")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Noticia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    @Column(nullable = false, length = 10000)
    private String conteudo;

    @Column(name = "imagem_url", columnDefinition = "TEXT")
    private String imagemUrl;

    @Column(name = "data_publicacao", nullable = false)
    @Builder.Default
    private LocalDateTime dataPublicacao = LocalDateTime.now();

    @Column(name = "sociedade")
    @Builder.Default
    private String sociedade = "TODA_IGREJA";
}
