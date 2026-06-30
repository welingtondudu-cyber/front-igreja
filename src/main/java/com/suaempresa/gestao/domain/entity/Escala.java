package com.suaempresa.gestao.domain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(schema = "gestao", name = "escalas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Escala {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evento_id", nullable = false)
    private Evento evento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "membro_id", nullable = false)
    private Membro membro;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grupo_id")
    private Grupo grupo;

    @Column(name = "funcao_especifica")
    private String funcaoEspecifica;

    @Column(name = "status_confirmacao", nullable = false)
    @Builder.Default
    private String statusConfirmacao = "PENDENTE";

    @Column(name = "motivo_recusa", length = 500)
    private String motivoRecusa;
}
