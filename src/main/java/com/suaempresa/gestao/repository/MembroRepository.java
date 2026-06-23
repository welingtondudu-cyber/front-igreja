package com.suaempresa.gestao.repository;

import com.suaempresa.gestao.domain.entity.Membro;
import com.suaempresa.gestao.domain.dto.MembroSimplificadoDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MembroRepository extends JpaRepository<Membro, Long> {

    @Query("SELECT new com.suaempresa.gestao.domain.dto.MembroSimplificadoDTO(" +
           "m.id, m.nomeCompleto, m.fotoPerfilUrl, c.titulo, m.statusCadastro) " +
           "FROM Membro m LEFT JOIN m.cargo c " +
           "WHERE m.statusCadastro = 'ATIVO'")
    List<MembroSimplificadoDTO> findAllAtivosSimplificado();

    @Query("SELECT m FROM Membro m " +
           "LEFT JOIN FETCH m.cargo " +
           "LEFT JOIN FETCH m.liderDireto " +
           "WHERE m.id = :id")
    Optional<Membro> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT m FROM Membro m LEFT JOIN FETCH m.cargo")
    List<Membro> findAllWithCargo();

    @Query("SELECT m FROM Membro m " +
           "LEFT JOIN FETCH m.cargo " +
           "LEFT JOIN FETCH m.liderDireto " +
           "WHERE m.statusCadastro = 'ATIVO'")
    List<Membro> findAllAtivosWithCargoAndLider();

    Optional<Membro> findByCpf(String cpf);

    @Query("SELECT COUNT(m) FROM Membro m " +
           "WHERE m.statusCadastro = 'ATIVO' " +
           "AND m.dataNascimento IS NOT NULL " +
           "AND (2026 - YEAR(m.dataNascimento)) >= 18 " +
           "AND NOT EXISTS (" +
           "    SELECT r FROM VotacaoRestricao r " +
           "    WHERE r.id.membroId = m.id AND r.id.votacaoId = :votacaoId" +
           ")")
    long countMembrosAptosParaVotar(@Param("votacaoId") Long votacaoId);
}
