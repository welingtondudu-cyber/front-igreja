package com.suaempresa.gestao.controller;

import com.suaempresa.gestao.domain.dto.MembroDetalhadoDTO;
import com.suaempresa.gestao.domain.dto.MembroFormDTO;
import com.suaempresa.gestao.service.MembroService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/membros")
@RequiredArgsConstructor
public class MembroController {

    private final MembroService membroService;

    /**
     * GET /api/membros
     * Todos os filtros são opcionais. Sem filtros, retorna todos paginado.
     *
     * Parâmetros:
     *   nome          - parte do nome (case-insensitive)
     *   cpf           - CPF completo ou parcial (ignora máscara)
     *   cargoId       - ID exato do cargo
     *   tituloCargo   - parte do título do cargo
     *   statusCadastro- ex: ATIVO, INATIVO
     *   liderDiretoId - ID do líder direto
     *   nascimentoDe  - data início do período de nascimento (yyyy-MM-dd)
     *   nascimentoAte - data fim do período de nascimento (yyyy-MM-dd)
     *   page          - número da página (0-indexed, default 0)
     *   size          - tamanho da página (default 20)
     *   sort          - campo,direção ex: nomeCompleto,asc
     */
    @GetMapping
    public ResponseEntity<Page<MembroDetalhadoDTO>> listarMembros(
            @RequestParam(required = false) String nome,
            @RequestParam(required = false) String cpf,
            @RequestParam(required = false) Long cargoId,
            @RequestParam(required = false) String tituloCargo,
            @RequestParam(required = false) String statusCadastro,
            @RequestParam(required = false) Long liderDiretoId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate nascimentoDe,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate nascimentoAte,
            @PageableDefault(size = 20, sort = "nomeCompleto", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        Page<MembroDetalhadoDTO> page = membroService.listarComFiltros(
                nome, cpf, cargoId, tituloCargo, statusCadastro,
                liderDiretoId, nascimentoDe, nascimentoAte, pageable
        );
        return ResponseEntity.ok(page);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MembroDetalhadoDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(membroService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<MembroDetalhadoDTO> criar(@RequestBody @Valid MembroFormDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(membroService.criar(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MembroDetalhadoDTO> atualizar(
            @PathVariable Long id,
            @RequestBody @Valid MembroFormDTO dto
    ) {
        return ResponseEntity.ok(membroService.atualizar(id, dto));
    }

    @GetMapping(value = "/exportar/csv", produces = "text/csv;charset=UTF-8")
    public ResponseEntity<byte[]> exportarCsv() {
        byte[] csvData = membroService.exportarCsv();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv;charset=UTF-8"));
        // Filename com UTF-8 encoding para nomes com acento
        headers.set(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename*=UTF-8''membros.csv");

        return ResponseEntity.ok()
                .headers(headers)
                .body(csvData);
    }

    @PostMapping(value = "/importar/csv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> importarCsv(@RequestParam("file") MultipartFile file) {
        membroService.importarCsv(file);
        return ResponseEntity.ok(Map.of("mensagem", "CSV importado com sucesso!"));
    }
}
