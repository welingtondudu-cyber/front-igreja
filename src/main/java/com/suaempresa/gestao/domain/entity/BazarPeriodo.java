package com.suaempresa.gestao.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "bazar_periodos", schema = "gestao")
@Getter
@Setter
public class BazarPeriodo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome_bazar", nullable = false, length = 100)
    private String nomeBazar;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "ATIVO"; // "ATIVO", "CONCLUIDO"

    @Column(name = "data_inicio", nullable = false)
    private LocalDateTime dataInicio = LocalDateTime.now();

    @Column(name = "data_fechamento")
    private LocalDateTime dataFechamento;
}
