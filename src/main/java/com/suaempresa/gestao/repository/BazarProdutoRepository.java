package com.suaempresa.gestao.repository;

import com.suaempresa.gestao.domain.entity.BazarProduto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;

public interface BazarProdutoRepository extends JpaRepository<BazarProduto, Long> {

    @Query("SELECT DISTINCT bp FROM BazarProduto bp WHERE " +
           "bp.bazar.id = :bazarId AND " +
           "(:nome IS NULL OR LOWER(bp.titulo) LIKE LOWER(CONCAT('%', :nome, '%'))) AND " +
           "(:precoMin IS NULL OR bp.preco >= :precoMin) AND " +
           "(:precoMax IS NULL OR bp.preco <= :precoMax) AND " +
           "(:statusItem IS NULL OR EXISTS (" +
           "  SELECT bie FROM BazarItemEstoque bie WHERE bie.produto = bp AND bie.statusItem = :statusItem" +
           "))")
    List<BazarProduto> pesquisarProdutos(
            @Param("bazarId") Long bazarId,
            @Param("nome") String nome,
            @Param("statusItem") String statusItem,
            @Param("precoMin") BigDecimal precoMin,
            @Param("precoMax") BigDecimal precoMax
    );

    List<BazarProduto> findByBazarId(Long bazarId);
}
