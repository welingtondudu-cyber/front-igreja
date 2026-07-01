package com.suaempresa.gestao.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "bazar_responsaveis", schema = "gestao",
       uniqueConstraints = @UniqueConstraint(columnNames = {"bazar_id", "membro_id"}))
@Getter
@Setter
public class BazarResponsavel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bazar_id", nullable = false)
    private BazarPeriodo bazar;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "membro_id", nullable = false)
    private Membro membro;
}
