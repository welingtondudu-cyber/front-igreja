package com.suaempresa.gestao.repository;

import com.suaempresa.gestao.domain.entity.MembroHistorico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MembroHistoricoRepository extends JpaRepository<MembroHistorico, Long> {
    List<MembroHistorico> findByMembroIdOrderByDataAlteracaoDesc(Long membroId);
}
