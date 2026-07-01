package com.suaempresa.gestao.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "bazar_itens_estoque", schema = "gestao")
@Getter
@Setter
public class BazarItemEstoque {

    @Id
    @Column(name = "serial_number", length = 50)
    private String serialNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produto_id", nullable = false)
    private BazarProduto produto;

    @Column(name = "status_item", nullable = false, length = 20)
    private String statusItem = "DISPONIVEL"; // "DISPONIVEL", "VENDIDO", "ESTORNADO"

    @Column(name = "venda_id")
    private Long vendaId;

    @Column(name = "data_atualizacao", nullable = false)
    private LocalDateTime dataAtualizacao = LocalDateTime.now();
}
