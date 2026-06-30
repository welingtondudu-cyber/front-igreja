package com.suaempresa.gestao.service;

import com.suaempresa.gestao.domain.dto.NoticiaDTO;
import com.suaempresa.gestao.domain.dto.NoticiaFormDTO;
import com.suaempresa.gestao.domain.entity.Noticia;
import com.suaempresa.gestao.repository.NoticiaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NoticiaService {

    private final NoticiaRepository noticiaRepository;

    @Transactional(readOnly = true)
    public List<NoticiaDTO> listarTodas() {
        return noticiaRepository.findAllByOrderByDataPublicacaoDesc()
                .stream()
                .map(NoticiaDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public NoticiaDTO buscarPorId(Long id) {
        Noticia n = noticiaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notícia não encontrada"));
        return NoticiaDTO.fromEntity(n);
    }

    @Transactional
    public NoticiaDTO criar(NoticiaFormDTO dto) {
        Noticia n = Noticia.builder()
                .titulo(dto.titulo())
                .conteudo(dto.conteudo())
                .imagemUrl(dto.imagemUrl())
                .sociedade(dto.sociedade() != null ? dto.sociedade().toUpperCase() : "TODA_IGREJA")
                .dataPublicacao(LocalDateTime.now())
                .build();
        return NoticiaDTO.fromEntity(noticiaRepository.save(n));
    }

    @Transactional
    public NoticiaDTO atualizar(Long id, NoticiaFormDTO dto) {
        Noticia n = noticiaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notícia não encontrada"));
        n.setTitulo(dto.titulo());
        n.setConteudo(dto.conteudo());
        n.setImagemUrl(dto.imagemUrl());
        n.setSociedade(dto.sociedade() != null ? dto.sociedade().toUpperCase() : "TODA_IGREJA");
        return NoticiaDTO.fromEntity(noticiaRepository.save(n));
    }

    @Transactional
    public void deletar(Long id) {
        if (!noticiaRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Notícia não encontrada");
        }
        noticiaRepository.deleteById(id);
    }
}
