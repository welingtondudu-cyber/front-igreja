package com.suaempresa.gestao.domain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(schema = "gestao", name = "grupos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Grupo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome_grupo", nullable = false)
    private String nomeGrupo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lider_id")
    private Membro lider;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_grupo", nullable = false)
    private TipoGrupo tipoGrupo;
}
