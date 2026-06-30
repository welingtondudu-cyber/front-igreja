package com.suaempresa.gestao.repository;

import com.suaempresa.gestao.domain.entity.TrilhaProgresso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TrilhaProgressoRepository extends JpaRepository<TrilhaProgresso, Long> {
    Optional<TrilhaProgresso> findByMembroIdAndConteudoId(Long membroId, Long conteudoId);
    List<TrilhaProgresso> findByMembroId(Long membroId);
}
