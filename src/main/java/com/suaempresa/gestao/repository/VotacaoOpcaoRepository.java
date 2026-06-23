package com.suaempresa.gestao.repository;

import com.suaempresa.gestao.domain.entity.VotacaoOpcao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VotacaoOpcaoRepository extends JpaRepository<VotacaoOpcao, Long> {
    List<VotacaoOpcao> findByVotacaoId(Long votacaoId);

    @org.springframework.data.jpa.repository.Query("SELECT o FROM VotacaoOpcao o LEFT JOIN FETCH o.membro WHERE o.votacao.id = :votacaoId")
    List<VotacaoOpcao> findByVotacaoIdWithMembro(@org.springframework.data.repository.query.Param("votacaoId") Long votacaoId);
}
