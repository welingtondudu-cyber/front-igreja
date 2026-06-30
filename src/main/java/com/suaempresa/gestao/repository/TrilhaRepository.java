package com.suaempresa.gestao.repository;

import com.suaempresa.gestao.domain.entity.Trilha;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TrilhaRepository extends JpaRepository<Trilha, Long> {
    List<Trilha> findByTipo(String tipo);
}
