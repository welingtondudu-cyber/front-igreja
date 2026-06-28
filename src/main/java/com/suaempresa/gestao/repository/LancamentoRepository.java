package com.suaempresa.gestao.repository;

import com.suaempresa.gestao.domain.entity.Lancamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface LancamentoRepository extends JpaRepository<Lancamento, Long> {
    @Query("SELECT l FROM Lancamento l LEFT JOIN FETCH l.categoria LEFT JOIN FETCH l.membroDizimista WHERE l.data BETWEEN :dataInicio AND :dataFim")
    List<Lancamento> findByDataBetweenWithDetails(@Param("dataInicio") LocalDate dataInicio, @Param("dataFim") LocalDate dataFim);
}
