package com.suaempresa.gestao.repository;

import com.suaempresa.gestao.domain.entity.BazarVenda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;

public interface BazarVendaRepository extends JpaRepository<BazarVenda, Long> {
    List<BazarVenda> findByBazarId(Long bazarId);

    @Query("SELECT COALESCE(SUM(bv.valorTotal), 0) FROM BazarVenda bv WHERE bv.bazar.id = :bazarId")
    BigDecimal sumValorTotalByBazarId(@Param("bazarId") Long bazarId);
}
