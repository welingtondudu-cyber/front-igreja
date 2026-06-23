package com.suaempresa.gestao.repository;

import com.suaempresa.gestao.domain.entity.Cargo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CargoRepository extends JpaRepository<Cargo, Long> {
    Optional<Cargo> findByTituloIgnoreCase(String titulo);
}
