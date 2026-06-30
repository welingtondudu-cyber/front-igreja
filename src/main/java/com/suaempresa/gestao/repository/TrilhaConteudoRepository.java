package com.suaempresa.gestao.repository;

import com.suaempresa.gestao.domain.entity.TrilhaConteudo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TrilhaConteudoRepository extends JpaRepository<TrilhaConteudo, Long> {
    List<TrilhaConteudo> findByTrilhaIdOrderByOrdemAsc(Long trilhaId);
    List<TrilhaConteudo> findByTrilhaIsNullOrderByDataCadastroDesc();

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(MAX(tc.ordem), 0) FROM TrilhaConteudo tc WHERE tc.trilha.id = :trilhaId")
    int obterOrdemMaximaPorTrilhaId(@org.springframework.data.repository.query.Param("trilhaId") Long trilhaId);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(MAX(tc.ordem), 0) FROM TrilhaConteudo tc WHERE tc.trilha IS NULL")
    int obterOrdemMaximaPorTrilhaIsNull();
}
