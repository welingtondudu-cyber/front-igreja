package com.suaempresa.gestao.controller;

import com.suaempresa.gestao.domain.dto.MembroDetalhadoDTO;
import com.suaempresa.gestao.domain.dto.MembroFormDTO;
import com.suaempresa.gestao.service.MembroService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
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
@Tag(name = "Membros", description = "API para gestão e consulta de membros da igreja")
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
    @Operation(
            summary = "Listar membros com paginação e filtros opcionais",
            description = "Retorna uma página de membros cadastrados. Nenhum filtro é obrigatório. Se nenhum for especificado, retorna todos paginados."
    )
    public ResponseEntity<Page<MembroDetalhadoDTO>> listarMembros(
            @Parameter(description = "Filtro por parte do nome completo (busca case-insensitive)")
            @RequestParam(required = false) String nome,
            @Parameter(description = "Filtro por CPF (parcial ou completo, ignora caracteres não numéricos)")
            @RequestParam(required = false) String cpf,
            @Parameter(description = "Filtro por ID do cargo")
            @RequestParam(required = false) Long cargoId,
            @Parameter(description = "Filtro por parte do título do cargo")
            @RequestParam(required = false) String tituloCargo,
            @Parameter(description = "Filtro por status do cadastro (ex: ATIVO, INATIVO)")
            @RequestParam(required = false) String statusCadastro,
            @Parameter(description = "Filtro por ID do líder direto")
            @RequestParam(required = false) Long liderDiretoId,
            @Parameter(description = "Filtro por data de nascimento inicial (período - yyyy-MM-dd)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate nascimentoDe,
            @Parameter(description = "Filtro por data de nascimento final (período - yyyy-MM-dd)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate nascimentoAte,
            @ParameterObject @PageableDefault(size = 20, sort = "nomeCompleto", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        Page<MembroDetalhadoDTO> page = membroService.listarComFiltros(
                nome, cpf, cargoId, tituloCargo, statusCadastro,
                liderDiretoId, nascimentoDe, nascimentoAte, pageable
        );
        return ResponseEntity.ok(page);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar membro por ID", description = "Retorna os detalhes completos de um membro específico pelo seu ID.")
    public ResponseEntity<MembroDetalhadoDTO> buscarPorId(
            @Parameter(description = "ID do membro", required = true) @PathVariable Long id
    ) {
        return ResponseEntity.ok(membroService.buscarPorId(id));
    }

    @PostMapping
    @Operation(summary = "Criar novo membro", description = "Cadastra um novo membro no sistema. O CPF não pode estar duplicado.")
    public ResponseEntity<MembroDetalhadoDTO> criar(@RequestBody @Valid MembroFormDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(membroService.criar(dto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar membro existente", description = "Atualiza todas as informações de um membro específico a partir de seu ID.")
    public ResponseEntity<MembroDetalhadoDTO> atualizar(
            @Parameter(description = "ID do membro a ser atualizado", required = true) @PathVariable Long id,
            @RequestBody @Valid MembroFormDTO dto
    ) {
        return ResponseEntity.ok(membroService.atualizar(id, dto));
    }

    @GetMapping(value = "/exportar/csv", produces = "text/csv;charset=UTF-8")
    @Operation(summary = "Exportar membros para CSV", description = "Gera e exporta um arquivo CSV codificado em UTF-8 com BOM contendo todos os membros cadastrados.")
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
    @Operation(
            summary = "Importar membros via arquivo CSV",
            description = "Importa uma lista de membros a partir de um arquivo CSV. Realiza upsert com base no CPF (se já existir, atualiza; caso contrário, insere) e trata caracteres especiais."
    )
    public ResponseEntity<Map<String, String>> importarCsv(
            @Parameter(description = "Arquivo CSV a ser importado contendo os campos delimitados por vírgula ou ponto-e-vírgula", required = true)
            @RequestParam("file") MultipartFile file
    ) {
        membroService.importarCsv(file);
        return ResponseEntity.ok(Map.of("mensagem", "CSV importado com sucesso!"));
    }
}
