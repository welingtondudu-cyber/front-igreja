package com.suaempresa.gestao.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(schema = "gestao", name = "eventos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Evento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    @Column(nullable = false)
    private LocalDate data;

    @Column(nullable = false)
    private LocalTime hora;

    @Column(length = 1000)
    private String observacoes;

    @Column(name = "imagem_url", columnDefinition = "TEXT")
    private String imagemUrl;

    @Column(name = "data_hora")
    private java.time.LocalDateTime dataHora;

    @Builder.Default
    @Column(nullable = true)
    private String status = "AGENDADO";

    @PrePersist
    @PreUpdate
    public void prePersist() {
        if (this.data != null && this.hora != null) {
            this.dataHora = java.time.LocalDateTime.of(this.data, this.hora);
        }
    }

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(schema = "gestao", name = "eventos_cargos_necessarios", joinColumns = @JoinColumn(name = "evento_id"), inverseJoinColumns = @JoinColumn(name = "cargo_id"))
    @Builder.Default
    private List<Cargo> cargosNecessarios = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(schema = "gestao", name = "eventos_grupos_necessarios", joinColumns = @JoinColumn(name = "evento_id"), inverseJoinColumns = @JoinColumn(name = "grupo_id"))
    @Builder.Default
    private List<Grupo> gruposNecessarios = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grupo_convocado_id")
    private Grupo grupoConvocado;
}
