package com.suaempresa.gestao.repository;

import com.suaempresa.gestao.domain.entity.Escala;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EscalaRepository extends JpaRepository<Escala, Long> {
    List<Escala> findByEventoId(Long eventoId);
    List<Escala> findByMembroId(Long membroId);
    void deleteByEventoId(Long eventoId);
}
