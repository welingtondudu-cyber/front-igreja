package com.suaempresa.gestao.domain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(schema = "gestao", name = "votacao_restricoes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VotacaoRestricao {
    @EmbeddedId
    private VotacaoRestricaoId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("votacaoId")
    @JoinColumn(name = "votacao_id")
    private Votacao votacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("membroId")
    @JoinColumn(name = "membro_id")
    private Membro membro;

    @Column(nullable = false, length = 255)
    private String motivo;
}
