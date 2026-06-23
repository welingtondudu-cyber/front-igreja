package com.suaempresa.gestao.repository;

import com.suaempresa.gestao.domain.entity.VotoComputado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VotoComputadoRepository extends JpaRepository<VotoComputado, Long> {

    @Query("SELECT o.id, o.tituloOpcao, m.id, m.fotoPerfilUrl, COUNT(v.id), m.nomeCompleto " +
           "FROM VotacaoOpcao o " +
           "LEFT JOIN o.membro m " +
           "LEFT JOIN VotoComputado v ON v.opcao = o " +
           "WHERE o.votacao.id = :votacaoId " +
           "GROUP BY o.id, o.tituloOpcao, m.id, m.fotoPerfilUrl, m.nomeCompleto")
    List<Object[]> findResultadosApuracao(@Param("votacaoId") Long votacaoId);
}
