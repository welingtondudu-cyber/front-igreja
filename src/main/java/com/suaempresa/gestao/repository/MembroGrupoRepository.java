package com.suaempresa.gestao.repository;

import com.suaempresa.gestao.domain.entity.Grupo;
import com.suaempresa.gestao.domain.entity.MembroGrupo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MembroGrupoRepository extends JpaRepository<MembroGrupo, Long> {

    Optional<MembroGrupo> findByGrupoIdAndMembroId(Long grupoId, Long membroId);

    @Query("SELECT mg.grupo FROM MembroGrupo mg WHERE mg.membro.id = :membroId")
    List<Grupo> findGruposByMembroId(@Param("membroId") Long membroId);
    
    boolean existsByGrupoIdAndMembroId(Long grupoId, Long membroId);
}
