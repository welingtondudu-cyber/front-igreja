package com.suaempresa.gestao.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(schema = "gestao", name = "trilha_conteudos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrilhaConteudo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trilha_id")
    private Trilha trilha;

    @Column(nullable = false)
    private String titulo;

    @Column(length = 2000)
    private String resumo;

    @Column(name = "texto_completo", columnDefinition = "TEXT")
    private String textoCompleto;

    @Column(name = "video_url")
    private String videoUrl;

    @Column(name = "pdf_url", columnDefinition = "TEXT")
    private String pdfUrl;

    @Column(nullable = false)
    private int ordem;

    @Column(name = "data_cadastro", nullable = false)
    @Builder.Default
    private LocalDateTime dataCadastro = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ator_id")
    private Membro ator;
}
