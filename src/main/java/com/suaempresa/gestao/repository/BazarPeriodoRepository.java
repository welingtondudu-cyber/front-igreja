package com.suaempresa.gestao.repository;

import com.suaempresa.gestao.domain.entity.BazarPeriodo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface BazarPeriodoRepository extends JpaRepository<BazarPeriodo, Long> {

    @Query("SELECT bp FROM BazarPeriodo bp WHERE " +
           "(:nome IS NULL OR LOWER(bp.nomeBazar) LIKE LOWER(CONCAT('%', :nome, '%'))) AND " +
           "(:status IS NULL OR bp.status = :status) AND " +
           "(:dataInicio IS NULL OR bp.dataInicio >= :dataInicio) AND " +
           "(:dataFim IS NULL OR bp.dataInicio <= :dataFim) " +
           "ORDER BY bp.dataInicio DESC")
    List<BazarPeriodo> pesquisarBazares(
            @Param("nome") String nome,
            @Param("status") String status,
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim
    );
}
