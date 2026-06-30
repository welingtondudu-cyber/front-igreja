package com.suaempresa.gestao.controller;

import com.suaempresa.gestao.domain.dto.TrilhaDTO;
import com.suaempresa.gestao.domain.dto.TrilhaConteudoDTO;
import com.suaempresa.gestao.service.TrilhaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/trilhas")
@RequiredArgsConstructor
@Tag(name = "Trilhas", description = "Portal de conteúdos, cursos e devocionais")
public class TrilhaController {

    private final TrilhaService trilhaService;

    @GetMapping
    @Operation(summary = "Listar trilhas por tipo com progresso do membro")
    public ResponseEntity<List<TrilhaDTO>> listarTrilhas(
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) Long membroId
    ) {
        return ResponseEntity.ok(trilhaService.listarTrilhas(tipo, membroId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter trilha por ID com progresso")
    public ResponseEntity<TrilhaDTO> obterTrilha(
            @PathVariable Long id,
            @RequestParam(required = false) Long membroId
    ) {
        return ResponseEntity.ok(trilhaService.obterTrilhaPorId(id, membroId));
    }

    @GetMapping("/{id}/conteudos")
    @Operation(summary = "Listar aulas/conteúdos da trilha")
    public ResponseEntity<List<TrilhaConteudoDTO>> obterConteudos(
            @PathVariable Long id,
            @RequestParam(required = false) Long membroId
    ) {
        return ResponseEntity.ok(trilhaService.obterConteudos(id, membroId));
    }

    @GetMapping("/conteudos-soltos")
    @Operation(summary = "Listar conteúdos avulsos")
    public ResponseEntity<List<TrilhaConteudoDTO>> obterConteudosSoltos(@RequestParam(required = false) Long membroId) {
        return ResponseEntity.ok(trilhaService.obterConteudos(null, membroId));
    }

    @PostMapping
    @Operation(summary = "Criar nova trilha")
    public ResponseEntity<TrilhaDTO> criarTrilha(@RequestBody TrilhaDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(trilhaService.criarTrilha(dto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar uma trilha existente")
    public ResponseEntity<TrilhaDTO> atualizarTrilha(@PathVariable Long id, @RequestBody TrilhaDTO dto) {
        return ResponseEntity.ok(trilhaService.atualizarTrilha(id, dto));
    }

    @PostMapping("/{id}/conteudos")
    @Operation(summary = "Adicionar conteúdo à trilha")
    public ResponseEntity<TrilhaConteudoDTO> adicionarConteudo(
            @PathVariable Long id,
            @RequestBody TrilhaConteudoDTO dto
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(trilhaService.adicionarConteudo(id, dto));
    }

    @PutMapping("/conteudos/{conteudoId}")
    @Operation(summary = "Atualizar um conteúdo/aula existente")
    public ResponseEntity<TrilhaConteudoDTO> atualizarConteudo(
            @PathVariable Long conteudoId,
            @RequestBody TrilhaConteudoDTO dto
    ) {
        return ResponseEntity.ok(trilhaService.atualizarConteudo(conteudoId, dto));
    }

    @PostMapping("/conteudos-soltos")
    @Operation(summary = "Adicionar conteúdo avulso (sem trilha)")
    public ResponseEntity<TrilhaConteudoDTO> adicionarConteudoSolto(@RequestBody TrilhaConteudoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(trilhaService.adicionarConteudo(null, dto));
    }

    @PostMapping("/conteudos/{conteudoId}/concluir")
    @Operation(summary = "Marcar conteúdo como concluído")
    public ResponseEntity<Void> marcarConcluido(
            @RequestParam Long membroId,
            @PathVariable Long conteudoId,
            @RequestParam boolean concluido
    ) {
        trilhaService.marcarConcluido(membroId, conteudoId, concluido);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/status")
    @Operation(summary = "Salvar ou atualizar status do estudo manualmente")
    public ResponseEntity<Void> salvarStatusManualmente(
            @RequestParam Long membroId,
            @RequestParam(required = false) Long trilhaId,
            @RequestParam(required = false) Long conteudoId,
            @RequestParam String status
    ) {
        trilhaService.salvarStatusManualmente(membroId, trilhaId, conteudoId, status);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/meus-estudos")
    @Operation(summary = "Listar estudos iniciados pelo membro")
    public ResponseEntity<List<TrilhaDTO>> obterEstudosIniciados(
            @RequestParam Long membroId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String busca
    ) {
        return ResponseEntity.ok(trilhaService.obterEstudosIniciados(membroId, status, busca));
    }
}
