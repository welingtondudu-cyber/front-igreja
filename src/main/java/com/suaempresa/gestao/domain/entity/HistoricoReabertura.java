package com.suaempresa.gestao.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(schema = "gestao", name = "historico_reaberturas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistoricoReabertura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private int ano;

    @Column(nullable = false)
    private int mes; // 1-12 para meses, 0 para ano completo

    @Column(nullable = false, length = 1000)
    private String motivo;

    @Column(name = "data_reabertura", nullable = false)
    private LocalDateTime dataReabertura;

    @Column(name = "usuario_id")
    private Long usuarioId;
}
