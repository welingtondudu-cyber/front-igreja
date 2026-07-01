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
           "(CAST(:nome AS String) IS NULL OR LOWER(bp.titulo) LIKE LOWER(CONCAT('%', CAST(:nome AS String), '%'))) AND " +
           "(CAST(:precoMin AS BigDecimal) IS NULL OR bp.preco >= :precoMin) AND " +
           "(CAST(:precoMax AS BigDecimal) IS NULL OR bp.preco <= :precoMax) AND " +
           "(CAST(:codigoBarras AS String) IS NULL OR EXISTS (" +
           "  SELECT bie FROM BazarItemEstoque bie WHERE bie.produto = bp AND LOWER(bie.serialNumber) LIKE LOWER(CONCAT('%', CAST(:codigoBarras AS String), '%'))" +
           ")) AND " +
           "(CAST(:statusItem AS String) IS NULL OR EXISTS (" +
           "  SELECT bie FROM BazarItemEstoque bie WHERE bie.produto = bp AND bie.statusItem = :statusItem" +
           "))")
    List<BazarProduto> pesquisarProdutos(
            @Param("bazarId") Long bazarId,
            @Param("nome") String nome,
            @Param("statusItem") String statusItem,
            @Param("precoMin") BigDecimal precoMin,
            @Param("precoMax") BigDecimal precoMax,
            @Param("codigoBarras") String codigoBarras
    );

    List<BazarProduto> findByBazarId(Long bazarId);
}
