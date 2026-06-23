package com.suaempresa.gestao.repository;

import com.suaempresa.gestao.domain.entity.Votacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VotacaoRepository extends JpaRepository<Votacao, Long> {
    java.util.List<Votacao> findByAtivaTrue();
}
