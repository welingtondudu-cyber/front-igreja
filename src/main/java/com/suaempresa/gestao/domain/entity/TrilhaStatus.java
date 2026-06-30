package com.suaempresa.gestao.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(schema = "gestao", name = "trilha_status")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrilhaStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "membro_id", nullable = false)
    private Membro membro;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trilha_id")
    private Trilha trilha;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conteudo_id")
    private TrilhaConteudo conteudo;

    @Column(nullable = false)
    private String status; // 'EM_ANDAMENTO', 'PARALISADO', 'CONCLUIDO'

    @Column(name = "data_atualizacao", nullable = false)
    @Builder.Default
    private LocalDateTime dataAtualizacao = LocalDateTime.now();

    @PrePersist
    @PreUpdate
    public void prePersist() {
        this.dataAtualizacao = LocalDateTime.now();
    }
}
