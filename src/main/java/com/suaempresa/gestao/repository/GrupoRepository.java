package com.suaempresa.gestao.repository;

import com.suaempresa.gestao.domain.entity.Grupo;
import com.suaempresa.gestao.domain.entity.TipoGrupo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface GrupoRepository extends JpaRepository<Grupo, Long> {

    @Query("SELECT g FROM Grupo g LEFT JOIN FETCH g.lider WHERE :tipo IS NULL OR g.tipoGrupo = :tipo")
    List<Grupo> findAllByTipoFetchLider(@Param("tipo") TipoGrupo tipo);
}
