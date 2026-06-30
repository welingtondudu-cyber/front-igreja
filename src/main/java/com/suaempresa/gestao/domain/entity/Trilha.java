package com.suaempresa.gestao.domain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(schema = "gestao", name = "trilhas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Trilha {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    @Column(length = 1000)
    private String descricao;

    @Column(nullable = false)
    private String tipo; // 'MINI_CURSO', 'TRILHA' ou 'DEVOCIONAL'

    @Column(name = "imagem_url", columnDefinition = "TEXT")
    private String imagemUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ator_id")
    private Membro ator;
}
