package com.suaempresa.gestao.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
    schema = "gestao", 
    name = "fechamentos_mensais",
    uniqueConstraints = @UniqueConstraint(columnNames = {"ano", "mes"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FechamentoMensal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private int ano;

    @Column(nullable = false)
    private int mes;

    @Column(name = "saldo_inicial", nullable = false, precision = 15, scale = 2)
    private BigDecimal saldoInicial;

    @Column(name = "entradas_do_mes", nullable = false, precision = 15, scale = 2)
    private BigDecimal entradasDoMes;

    @Column(name = "saidas_do_mes", nullable = false, precision = 15, scale = 2)
    private BigDecimal saidasDoMes;

    @Column(name = "saldo_final", nullable = false, precision = 15, scale = 2)
    private BigDecimal saldoFinal;

    @Column(name = "data_fechamento", nullable = false)
    private LocalDateTime dataFechamento;

    @Column(name = "usuario_id")
    private Long usuarioId;
}
