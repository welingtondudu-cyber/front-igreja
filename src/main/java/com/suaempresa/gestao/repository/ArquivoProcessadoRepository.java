package com.suaempresa.gestao.repository;

import com.suaempresa.gestao.domain.entity.ArquivoProcessado;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ArquivoProcessadoRepository extends JpaRepository<ArquivoProcessado, Long> {
    boolean existsByHashSha256(String hashSha256);
}
