package com.suaempresa.gestao.domain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(schema = "gestao", name = "votacao_opcoes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VotacaoOpcao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "votacao_id", nullable = false)
    private Votacao votacao;

    @Column(name = "titulo_opcao", nullable = false, length = 150)
    private String tituloOpcao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "membro_id")
    private Membro membro;
}
