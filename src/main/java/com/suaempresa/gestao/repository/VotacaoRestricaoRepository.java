package com.suaempresa.gestao.repository;

import com.suaempresa.gestao.domain.entity.VotacaoRestricao;
import com.suaempresa.gestao.domain.entity.VotacaoRestricaoId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VotacaoRestricaoRepository extends JpaRepository<VotacaoRestricao, VotacaoRestricaoId> {
    Optional<VotacaoRestricao> findByIdVotacaoIdAndIdMembroId(Long votacaoId, Long membroId);
    java.util.List<VotacaoRestricao> findByIdVotacaoId(Long votacaoId);
}
