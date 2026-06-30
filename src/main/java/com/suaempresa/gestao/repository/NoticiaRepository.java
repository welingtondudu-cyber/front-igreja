package com.suaempresa.gestao.repository;

import com.suaempresa.gestao.domain.entity.Noticia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NoticiaRepository extends JpaRepository<Noticia, Long> {
    List<Noticia> findAllByOrderByDataPublicacaoDesc();
}
