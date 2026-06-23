package com.suaempresa.gestao.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(schema = "gestao", name = "votacoes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Votacao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(name = "limite_votos", nullable = false)
    private Integer limiteVotos;

    @Column(nullable = false)
    private Boolean ativa;

    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao;
}
