package com.suaempresa.gestao.repository;

import com.suaempresa.gestao.domain.entity.Categoria;
import com.suaempresa.gestao.domain.entity.TipoFluxo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    Optional<Categoria> findByNomeIgnoreCase(String nome);
    List<Categoria> findByTipoFluxo(TipoFluxo tipoFluxo);
}
