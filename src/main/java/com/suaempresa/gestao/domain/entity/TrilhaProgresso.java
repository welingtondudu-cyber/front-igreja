package com.suaempresa.gestao.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(
    schema = "gestao",
    name = "trilha_progresso",
    uniqueConstraints = @UniqueConstraint(columnNames = {"membro_id", "conteudo_id"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrilhaProgresso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "membro_id", nullable = false)
    private Membro membro;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conteudo_id", nullable = false)
    private TrilhaConteudo conteudo;

    @Builder.Default
    private boolean concluido = false;

    @Column(name = "data_conclusao")
    private LocalDateTime dataConclusao;
}
