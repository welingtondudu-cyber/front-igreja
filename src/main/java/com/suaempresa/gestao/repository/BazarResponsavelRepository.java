package com.suaempresa.gestao.repository;

import com.suaempresa.gestao.domain.entity.BazarResponsavel;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BazarResponsavelRepository extends JpaRepository<BazarResponsavel, Long> {
    List<BazarResponsavel> findByBazarId(Long bazarId);
    boolean existsByBazarIdAndMembroId(Long bazarId, Long membroId);
    void deleteByBazarIdAndMembroId(Long bazarId, Long membroId);
}
