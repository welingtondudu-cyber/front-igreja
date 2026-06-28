package com.suaempresa.gestao.repository;

import com.suaempresa.gestao.domain.entity.HistoricoReabertura;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HistoricoReaberturaRepository extends JpaRepository<HistoricoReabertura, Long> {
    List<HistoricoReabertura> findAllByOrderByDataReaberturaDesc();
}
