package com.suaempresa.gestao.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(schema = "gestao", name = "membros_relacionamentos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MembroRelacionamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "membro_id", nullable = false)
    private Membro membro;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parente_id", nullable = false)
    private Membro parente;

    @Column(name = "tipo_vinculo", nullable = false, length = 50)
    private String tipoVinculo; // 'CONJUGE' ou 'PAI_MAE'

    @Column(name = "data_casamento")
    private LocalDate dataCasamento;
}
