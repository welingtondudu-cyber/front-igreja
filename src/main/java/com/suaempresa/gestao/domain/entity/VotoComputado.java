package com.suaempresa.gestao.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(schema = "gestao", name = "votos_computados")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VotoComputado {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "opcao_id", nullable = true)
    private VotacaoOpcao opcao;

    @Column(name = "codigo_auditoria", nullable = false, length = 10)
    private String codigoAuditoria;

    @Column(name = "data_hora", nullable = false)
    private LocalDateTime dataHora;
}
