package com.suaempresa.gestao.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(schema = "gestao", name = "votacao_registros")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VotacaoRegistro {
    @EmbeddedId
    private VotacaoRegistroId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("votacaoId")
    @JoinColumn(name = "votacao_id")
    private Votacao votacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("membroId")
    @JoinColumn(name = "membro_id")
    private Membro membro;

    @Column(name = "data_voto", nullable = false)
    private LocalDateTime dataVoto;
}
