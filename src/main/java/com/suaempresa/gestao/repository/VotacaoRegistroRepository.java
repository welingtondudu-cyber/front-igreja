package com.suaempresa.gestao.repository;

import com.suaempresa.gestao.domain.entity.VotacaoRegistro;
import com.suaempresa.gestao.domain.entity.VotacaoRegistroId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VotacaoRegistroRepository extends JpaRepository<VotacaoRegistro, VotacaoRegistroId> {
    boolean existsByIdVotacaoIdAndIdMembroId(Long votacaoId, Long membroId);
    long countByIdVotacaoId(Long votacaoId);
}
