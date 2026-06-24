package com.suaempresa.gestao.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(schema = "gestao", name = "membros")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Membro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome_completo", nullable = false)
    private String nomeCompleto;

    private String whatsapp;
    
    private String email;

    @Column(name = "foto_perfil_url")
    private String fotoPerfilUrl;

    @Column(name = "status_cadastro")
    private String statusCadastro;

    @Column(name = "data_adesao")
    private LocalDate dataAdesao;

    @Column(name = "data_nascimento")
    private LocalDate dataNascimento;

    private String sexo;

    @Column(name = "cpf", unique = true)
    private String cpf;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cargo_id")
    private Cargo cargo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lider_direto_id")
    private Membro liderDireto;

    @OneToMany(mappedBy = "membro", fetch = FetchType.LAZY)
    @Builder.Default
    private java.util.List<MembroGrupo> membrosGrupos = new java.util.ArrayList<>();
}
