package com.suaempresa.gestao.repository;

import com.suaempresa.gestao.domain.entity.MembroRelacionamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MembroRelacionamentoRepository extends JpaRepository<MembroRelacionamento, Long> {
    List<MembroRelacionamento> findByMembroId(Long membroId);
    List<MembroRelacionamento> findByParenteId(Long parenteId);
}
