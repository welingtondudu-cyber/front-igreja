package com.suaempresa.gestao.repository;

import com.suaempresa.gestao.domain.entity.FechamentoMensal;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface FechamentoMensalRepository extends JpaRepository<FechamentoMensal, Long> {
    Optional<FechamentoMensal> findByAnoAndMes(int ano, int mes);
    List<FechamentoMensal> findAllByOrderByAnoDescMesDesc();
}
