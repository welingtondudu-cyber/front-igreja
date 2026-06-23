package com.suaempresa.gestao.controller;

import com.suaempresa.gestao.domain.dto.GrupoDTO;
import com.suaempresa.gestao.domain.dto.GrupoFormDTO;
import com.suaempresa.gestao.domain.dto.MembroGrupoDTO;
import com.suaempresa.gestao.domain.entity.TipoGrupo;
import com.suaempresa.gestao.service.GrupoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/grupos")
@RequiredArgsConstructor
public class GrupoController {

    private final GrupoService grupoService;

    @GetMapping
    public ResponseEntity<List<GrupoDTO>> listarGrupos(@RequestParam(value = "tipo", required = false) TipoGrupo tipo) {
        return ResponseEntity.ok(grupoService.listarGrupos(tipo));
    }

    @PostMapping
    public ResponseEntity<GrupoDTO> criarGrupo(@RequestBody @Valid GrupoFormDTO dto) {
        GrupoDTO criado = grupoService.criarGrupo(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<GrupoDTO> atualizarGrupo(@PathVariable Long id, @RequestBody @Valid GrupoFormDTO dto) {
        return ResponseEntity.ok(grupoService.atualizarGrupo(id, dto));
    }

    @PostMapping("/{grupoId}/membros/{membroId}")
    public ResponseEntity<Void> vincularMembro(@PathVariable Long grupoId, @PathVariable Long membroId) {
        grupoService.vincularMembro(grupoId, membroId);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/{grupoId}/membros/{membroId}")
    public ResponseEntity<Void> desvincularMembro(@PathVariable Long grupoId, @PathVariable Long membroId) {
        grupoService.desvincularMembro(grupoId, membroId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/membros/{membroId}")
    public ResponseEntity<List<MembroGrupoDTO>> listarGruposDoMembro(@PathVariable Long membroId) {
        return ResponseEntity.ok(grupoService.listarGruposDoMembro(membroId));
    }
}
