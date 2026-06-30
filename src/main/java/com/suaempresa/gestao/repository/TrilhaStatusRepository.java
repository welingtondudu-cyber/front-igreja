package com.suaempresa.gestao.repository;

import com.suaempresa.gestao.domain.entity.TrilhaStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TrilhaStatusRepository extends JpaRepository<TrilhaStatus, Long> {
    List<TrilhaStatus> findByMembroId(Long membroId);
    Optional<TrilhaStatus> findByMembroIdAndTrilhaId(Long membroId, Long trilhaId);
    Optional<TrilhaStatus> findByMembroIdAndConteudoId(Long membroId, Long conteudoId);
}
