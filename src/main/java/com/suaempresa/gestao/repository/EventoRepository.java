package com.suaempresa.gestao.repository;

import com.suaempresa.gestao.domain.entity.Evento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface EventoRepository extends JpaRepository<Evento, Long> {
    
    @Query("SELECT e FROM Evento e LEFT JOIN FETCH e.gruposNecessarios WHERE e.data BETWEEN :inicio AND :fim ORDER BY e.data ASC, e.hora ASC")
    List<Evento> findByDataBetweenWithCargos(@Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);
}
