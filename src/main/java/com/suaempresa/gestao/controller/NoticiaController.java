package com.suaempresa.gestao.controller;

import com.suaempresa.gestao.domain.dto.NoticiaDTO;
import com.suaempresa.gestao.domain.dto.NoticiaFormDTO;
import com.suaempresa.gestao.service.NoticiaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/noticias")
@RequiredArgsConstructor
@Tag(name = "Notícias", description = "Feed de notícias e novidades da igreja")
public class NoticiaController {

    private final NoticiaService noticiaService;

    @GetMapping
    @Operation(summary = "Listar notícias", description = "Retorna todas as notícias cadastradas no feed ordenadas por data decrescente.")
    public ResponseEntity<List<NoticiaDTO>> listarTodas() {
        return ResponseEntity.ok(noticiaService.listarTodas());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar notícia por ID")
    public ResponseEntity<NoticiaDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(noticiaService.buscarPorId(id));
    }

    @PostMapping
    @Operation(summary = "Criar nova notícia")
    public ResponseEntity<NoticiaDTO> criar(@RequestBody @Valid NoticiaFormDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(noticiaService.criar(dto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar notícia existente")
    public ResponseEntity<NoticiaDTO> atualizar(@PathVariable Long id, @RequestBody @Valid NoticiaFormDTO dto) {
        return ResponseEntity.ok(noticiaService.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deletar notícia")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        noticiaService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
