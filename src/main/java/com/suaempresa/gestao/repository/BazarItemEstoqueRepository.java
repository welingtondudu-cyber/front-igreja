package com.suaempresa.gestao.repository;

import com.suaempresa.gestao.domain.entity.BazarItemEstoque;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BazarItemEstoqueRepository extends JpaRepository<BazarItemEstoque, String> {
    List<BazarItemEstoque> findByProdutoId(Long produtoId);
    long countByProdutoId(Long produtoId);
    List<BazarItemEstoque> findByVendaId(Long vendaId);
    List<BazarItemEstoque> findByProdutoIdAndStatusItem(Long produtoId, String statusItem);
    
    long countByProdutoBazarId(Long bazarId);
    long countByProdutoBazarIdAndStatusItem(Long bazarId, String statusItem);
    
    List<BazarItemEstoque> findByProdutoBazarId(Long bazarId);
    Optional<BazarItemEstoque> findBySerialNumber(String serialNumber);
}
