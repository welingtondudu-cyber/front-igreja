package com.suaempresa.gestao.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(schema = "gestao", name = "membros_historico")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MembroHistorico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "membro_id", nullable = false)
    private Membro membro;

    @Column(name = "campo_alterado", nullable = false)
    private String campoAlterado;

    @Column(name = "valor_antigo")
    private String valorAntigo;

    @Column(name = "valor_novo")
    private String valorNovo;

    @Column(name = "data_alteracao", nullable = false)
    private LocalDateTime dataAlteracao;

    @Column(name = "usuario_id")
    private Long usuarioId;
}
