package com.suaempresa.gestao.repository;

import com.suaempresa.gestao.domain.entity.Escala;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EscalaRepository extends JpaRepository<Escala, Long> {
    List<Escala> findByEventoId(Long eventoId);
    List<Escala> findByMembroId(Long membroId);
    void deleteByEventoId(Long eventoId);

    @Query("SELECT DISTINCT e.membro.id FROM Escala e " +
           "WHERE e.grupo.id = :grupoId " +
           "AND e.membro.id IN :membroIds " +
           "AND e.evento.dataHora >= :dataLimite")
    List<Long> findMembrosAtivosNaEscalaNosUltimos90Dias(
        @Param("grupoId") Long grupoId,
        @Param("membroIds") List<Long> membroIds,
        @Param("dataLimite") java.time.LocalDateTime dataLimite
    );
}
