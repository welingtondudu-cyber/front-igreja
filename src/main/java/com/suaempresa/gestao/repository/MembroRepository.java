package com.suaempresa.gestao.repository;

import com.suaempresa.gestao.domain.entity.Membro;
import com.suaempresa.gestao.domain.dto.MembroSimplificadoDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MembroRepository extends JpaRepository<Membro, Long>, JpaSpecificationExecutor<Membro> {

    @Query("SELECT new com.suaempresa.gestao.domain.dto.MembroSimplificadoDTO(" +
           "m.id, m.nomeCompleto, m.fotoPerfilUrl, c.titulo, m.statusCadastro) " +
           "FROM Membro m LEFT JOIN m.cargo c " +
           "WHERE LOWER(m.statusCadastro) = 'ativo'")
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
           "WHERE LOWER(m.statusCadastro) = 'ativo'")
    List<Membro> findAllAtivosWithCargoAndLider();

    @Query("SELECT m FROM Membro m " +
           "LEFT JOIN FETCH m.cargo " +
           "LEFT JOIN FETCH m.liderDireto")
    List<Membro> findAllWithCargoAndLider();

    Optional<Membro> findByCpf(String cpf);

    Optional<Membro> findByEmail(String email);

    long countByStatusCadastroIgnoreCase(String statusCadastro);

    @Query("SELECT COUNT(m) FROM Membro m " +
           "WHERE LOWER(m.statusCadastro) = 'ativo' " +
           "AND (m.cargo IS NULL OR (m.cargo.pesoHierarquico <> 4 AND m.cargo.titulo <> 'Visitante')) " +
           "AND m.dataNascimento IS NOT NULL " +
           "AND m.dataNascimento <= :limiteIdade " +
           "AND NOT EXISTS (" +
           "    SELECT r FROM VotacaoRestricao r " +
           "    WHERE r.id.membroId = m.id AND r.id.votacaoId = :votacaoId" +
           ")")
    long countMembrosAptosParaVotar(@Param("votacaoId") Long votacaoId, @Param("limiteIdade") java.time.LocalDate limiteIdade);

    @Query("SELECT m.dataAdesao FROM Membro m WHERE m.dataAdesao IS NOT NULL AND m.dataAdesao >= :dataInicio")
    List<java.time.LocalDate> findDatasAdesaoDesde(@Param("dataInicio") java.time.LocalDate dataInicio);
}
