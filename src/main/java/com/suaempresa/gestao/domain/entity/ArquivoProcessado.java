package com.suaempresa.gestao.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(schema = "gestao", name = "arquivos_processados")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArquivoProcessado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "hash_sha256", nullable = false, unique = true)
    private String hashSha256;

    @Column(name = "nome_arquivo")
    private String nomeArquivo;

    @Column(name = "data_processamento", nullable = false)
    private LocalDateTime dataProcessamento;
}
