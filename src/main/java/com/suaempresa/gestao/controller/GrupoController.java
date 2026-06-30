package com.suaempresa.gestao.controller;

import com.suaempresa.gestao.domain.dto.GrupoDTO;
import com.suaempresa.gestao.domain.dto.GrupoFormDTO;
import com.suaempresa.gestao.domain.dto.MembroGrupoDTO;
import com.suaempresa.gestao.domain.entity.TipoGrupo;
import com.suaempresa.gestao.service.GrupoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/grupos")
@RequiredArgsConstructor
@Tag(name = "Grupos", description = "API para gestão e vinculação de grupos da igreja (ex: Ministérios, Sociedades Internas)")
public class GrupoController {

    private final GrupoService grupoService;

    @GetMapping
    @Operation(summary = "Listar grupos", description = "Retorna todos os grupos cadastrados, com opção de filtrar por tipo de grupo.")
    public ResponseEntity<List<GrupoDTO>> listarGrupos(
            @Parameter(description = "Tipo de grupo para filtro (ex: MINISTERIO, SOCIEDADES_INTERNAS, PEQUENO_GRUPO)")
            @RequestParam(value = "tipo", required = false) TipoGrupo tipo
    ) {
        return ResponseEntity.ok(grupoService.listarGrupos(tipo));
    }

    @PostMapping
    @Operation(summary = "Criar novo grupo", description = "Cadastra um novo grupo com nome, tipo opcional e descrição.")
    public ResponseEntity<GrupoDTO> criarGrupo(@RequestBody @Valid GrupoFormDTO dto) {
        GrupoDTO criado = grupoService.criarGrupo(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar grupo", description = "Atualiza os dados de um grupo existente pelo seu ID.")
    public ResponseEntity<GrupoDTO> atualizarGrupo(
            @Parameter(description = "ID do grupo a ser atualizado", required = true) @PathVariable Long id,
            @RequestBody @Valid GrupoFormDTO dto
    ) {
        return ResponseEntity.ok(grupoService.atualizarGrupo(id, dto));
    }

    @PostMapping("/{grupoId}/membros/{matriculaMembro}")
    @Operation(summary = "Vincular membro ao grupo", description = "Adiciona a associação entre um membro e um grupo.")
    public ResponseEntity<Void> vincularMembro(
            @Parameter(description = "ID do grupo", required = true) @PathVariable Long grupoId,
            @Parameter(description = "Matrícula do membro a ser vinculado", required = true) @PathVariable String matriculaMembro
    ) {
        Long membroId = parseMatriculaToId(matriculaMembro);
        grupoService.vincularMembro(grupoId, membroId);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/{grupoId}/membros/{matriculaMembro}")
    @Operation(summary = "Desvincular membro do grupo", description = "Remove a associação entre um membro e um grupo.")
    public ResponseEntity<Void> desvincularMembro(
            @Parameter(description = "ID do grupo", required = true) @PathVariable Long grupoId,
            @Parameter(description = "Matrícula do membro a ser desvinculado", required = true) @PathVariable String matriculaMembro
    ) {
        Long membroId = parseMatriculaToId(matriculaMembro);
        grupoService.desvincularMembro(grupoId, membroId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{grupoId}/membros-disponiveis")
    @Operation(summary = "Listar membros de um grupo", description = "Retorna os membros vinculados a um grupo específico para uso na alocação de escalas.")
    public ResponseEntity<List<Map<String, Object>>> listarMembrosDoGrupo(
            @Parameter(description = "ID do grupo", required = true) @PathVariable Long grupoId
    ) {
        return ResponseEntity.ok(grupoService.listarMembrosDoGrupo(grupoId));
    }

    private Long parseMatriculaToId(String matricula) {
        try {
            return Long.parseLong(matricula);
        } catch (NumberFormatException e) {
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.BAD_REQUEST, "Matrícula inválida: " + matricula);
        }
    }
}
