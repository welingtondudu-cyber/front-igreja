package com.suaempresa.gestao.controller;

import com.suaempresa.gestao.domain.dto.MembroDetalhadoDTO;
import com.suaempresa.gestao.domain.dto.MembroFormDTO;
import com.suaempresa.gestao.domain.dto.MembroRelacionamentoDTO;
import com.suaempresa.gestao.domain.dto.MembroRelacionamentoFormDTO;
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
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/membros")
@RequiredArgsConstructor
@Tag(name = "Membros", description = "API para gestão e consulta de membros da igreja")
public class MembroController {

    private final MembroService membroService;
    private final com.suaempresa.gestao.repository.CargoRepository cargoRepository;

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
            @Parameter(description = "Filtro por ID do grupo ou ministério")
            @RequestParam(required = false) Long grupoId,
            @ParameterObject @PageableDefault(size = 20, sort = "nomeCompleto", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        Page<MembroDetalhadoDTO> page = membroService.listarComFiltros(
                nome, cpf, cargoId, tituloCargo, statusCadastro,
                liderDiretoId, nascimentoDe, nascimentoAte, grupoId, pageable
        );
        return ResponseEntity.ok(page);
    }

    @GetMapping("/{matricula}")
    @Operation(summary = "Buscar membro por matrícula", description = "Retorna os detalhes completos de um membro específico pela sua matrícula de 4 dígitos.")
    public ResponseEntity<MembroDetalhadoDTO> buscarPorMatricula(
            @Parameter(description = "Matrícula de 4 dígitos do membro", required = true) @PathVariable String matricula
    ) {
        Long id = parseMatriculaToId(matricula);
        return ResponseEntity.ok(membroService.buscarPorId(id));
    }

    @PostMapping
    @Operation(summary = "Criar novo membro", description = "Cadastra um novo membro no sistema. O CPF não pode estar duplicado.")
    public ResponseEntity<MembroDetalhadoDTO> criar(@RequestBody @Valid MembroFormDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(membroService.criar(dto));
    }

    @PutMapping("/{matricula}")
    @Operation(summary = "Atualizar membro existente", description = "Atualiza todas as informações de um membro específico a partir de sua matrícula de 4 dígitos.")
    public ResponseEntity<MembroDetalhadoDTO> atualizar(
            @Parameter(description = "Matrícula de 4 dígitos do membro a ser atualizado", required = true) @PathVariable String matricula,
            @RequestBody @Valid MembroFormDTO dto
    ) {
        Long id = parseMatriculaToId(matricula);
        return ResponseEntity.ok(membroService.atualizar(id, dto));
    }

    @GetMapping("/{matricula}/historico")
    @Operation(summary = "Obter histórico de alterações do membro", description = "Retorna a lista de todas as edições no cadastro de um membro específico pela matrícula.")
    public ResponseEntity<java.util.List<com.suaempresa.gestao.domain.dto.MembroHistoricoDTO>> obterHistorico(
            @Parameter(description = "Matrícula do membro", required = true) @PathVariable String matricula
    ) {
        Long id = parseMatriculaToId(matricula);
        java.util.List<com.suaempresa.gestao.domain.dto.MembroHistoricoDTO> logs = membroService.obterHistoricoMembro(id)
                .stream()
                .map(com.suaempresa.gestao.domain.dto.MembroHistoricoDTO::fromEntity)
                .toList();
        return ResponseEntity.ok(logs);
    }

    private Long parseMatriculaToId(String matricula) {
        try {
            return Long.parseLong(matricula);
        } catch (NumberFormatException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Matrícula inválida: " + matricula);
        }
    }

    @GetMapping(value = "/exportar/csv", produces = "text/csv;charset=UTF-8")
    @Operation(summary = "Exportar membros para CSV", description = "Gera e exporta um arquivo CSV codificado em UTF-8 com BOM contendo os membros filtrados pelos parâmetros de busca.")
    public ResponseEntity<byte[]> exportarCsv(
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
            @Parameter(description = "Filtro por ID do grupo ou ministério")
            @RequestParam(required = false) Long grupoId
    ) {
        byte[] csvData = membroService.exportarCsv(
                nome, cpf, cargoId, tituloCargo, statusCadastro,
                liderDiretoId, nascimentoDe, nascimentoAte, grupoId
        );

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

    @GetMapping("/cargos")
    @Operation(summary = "Listar todos os cargos", description = "Retorna todos os cargos cadastrados para seleção em formulários.")
    public ResponseEntity<java.util.List<com.suaempresa.gestao.domain.dto.CargoResumoDTO>> listarTodosCargos() {
        return ResponseEntity.ok(
            cargoRepository.findAll().stream().map(com.suaempresa.gestao.domain.dto.CargoResumoDTO::fromEntity).toList()
        );
    }

    @GetMapping("/ativos")
    @Operation(summary = "Listar membros ativos simplificado", description = "Retorna uma lista resumida de todos os membros ativos para seleção.")
    public ResponseEntity<java.util.List<com.suaempresa.gestao.domain.dto.MembroSimplificadoDTO>> listarAtivos() {
        return ResponseEntity.ok(membroService.listarMembrosAtivos());
    }

    @PostMapping("/relacionamentos")
    @Operation(summary = "Salvar relacionamento familiar", description = "Vincula dois membros como cônjuge ou pai/mãe, validando a data de casamento.")
    public ResponseEntity<MembroRelacionamentoDTO> criarRelacionamento(@RequestBody @Valid MembroRelacionamentoFormDTO form) {
        return ResponseEntity.status(HttpStatus.CREATED).body(membroService.salvarRelacionamento(form));
    }

    @DeleteMapping("/relacionamentos/{id}")
    @Operation(summary = "Remover relacionamento familiar", description = "Remove um vínculo familiar entre dois membros pelo ID do relacionamento.")
    public ResponseEntity<Void> removerRelacionamento(@PathVariable Long id) {
        membroService.removerRelacionamento(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/importar-massa", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Importação massiva de membros via CSV", description = "Importa uma lista de membros, incluindo endereço e prevenindo duplicações de CPF ou E-mail.")
    public ResponseEntity<Map<String, String>> importarMassa(@RequestParam("file") MultipartFile file) {
        membroService.importarMassa(file);
        return ResponseEntity.ok(Map.of("mensagem", "Importação concluída com sucesso!"));
    }

    @GetMapping(value = "/exportar", produces = "text/csv;charset=UTF-8")
    @Operation(summary = "Exportação completa de membros", description = "Gera um CSV UTF-8 com BOM contendo a listagem completa dos membros com blocos de endereço.")
    public ResponseEntity<byte[]> exportarCompleto() {
        byte[] csvData = membroService.exportarCompletoCsv();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv;charset=UTF-8"));
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''membros_backup.csv");
        return ResponseEntity.ok().headers(headers).body(csvData);
    }
}
