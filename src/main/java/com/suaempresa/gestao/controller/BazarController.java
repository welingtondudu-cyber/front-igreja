package com.suaempresa.gestao.controller;

import com.suaempresa.gestao.domain.dto.*;
import com.suaempresa.gestao.service.BazarService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/balcao-vendas")
@RequiredArgsConstructor
@Tag(name = "Balcão de Vendas", description = "Gestão de eventos de vendas e estoque local")
public class BazarController {

    private final BazarService bazarService;

    @GetMapping("/periodos")
    @Operation(summary = "Listar períodos de bazar com filtros")
    public ResponseEntity<List<BazarPeriodoDTO>> pesquisarBazares(
            @RequestParam(required = false) String nome,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim
    ) {
        LocalDateTime inicio = dataInicio != null ? dataInicio.atStartOfDay() : null;
        LocalDateTime fim = dataFim != null ? dataFim.atTime(LocalTime.MAX) : null;
        return ResponseEntity.ok(bazarService.pesquisarBazares(nome, status, inicio, fim));
    }

    @PostMapping("/periodos")
    @Operation(summary = "Criar um novo período de bazar")
    public ResponseEntity<BazarPeriodoDTO> criarBazar(@RequestBody @Valid BazarPeriodoFormDTO form) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bazarService.criarBazar(form));
    }

    @PutMapping("/periodos/{id}")
    @Operation(summary = "Editar dados de um período de venda")
    public ResponseEntity<BazarPeriodoDTO> editarBazar(@PathVariable Long id, @RequestBody @Valid BazarPeriodoFormDTO form) {
        return ResponseEntity.ok(bazarService.editarBazar(id, form));
    }

    @DeleteMapping("/periodos/{id}")
    @Operation(summary = "Excluir um período de venda")
    public ResponseEntity<Void> excluirBazar(@PathVariable Long id, @RequestParam Long membroId) {
        bazarService.excluirBazar(id, membroId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/periodos/{id}/concluir")
    @Operation(summary = "Concluir definitivamente um bazar (Trava de segurança ativada)")
    public ResponseEntity<BazarPeriodoDTO> concluirBazar(@PathVariable Long id, @RequestParam Long membroId) {
        return ResponseEntity.ok(bazarService.concluirBazar(id, membroId));
    }

    @PutMapping("/periodos/{id}/reabrir")
    @Operation(summary = "Reabrir um bazar concluído")
    public ResponseEntity<BazarPeriodoDTO> reabrirBazar(@PathVariable Long id, @RequestParam Long membroId) {
        return ResponseEntity.ok(bazarService.reabrirBazar(id, membroId));
    }

    @GetMapping("/periodos/{id}/dashboard")
    @Operation(summary = "Obter indicadores do painel do bazar")
    public ResponseEntity<Map<String, Object>> obterDashboardBazar(@PathVariable Long id) {
        BigDecimal totalArrecadado = bazarService.obterTotalArrecadado(id);
        long totalItens = bazarService.obterTotalItensEstoque(id);
        long totalVendidos = bazarService.obterTotalItensVendidos(id);

        Map<String, Object> data = new HashMap<>();
        data.put("totalArrecadado", totalArrecadado);
        data.put("totalItens", totalItens);
        data.put("totalVendidos", totalVendidos);
        return ResponseEntity.ok(data);
    }

    @GetMapping("/periodos/{id}/responsaveis")
    @Operation(summary = "Listar responsáveis pelo bazar")
    public ResponseEntity<List<BazarResponsavelDTO>> listarResponsaveis(@PathVariable Long id) {
        return ResponseEntity.ok(bazarService.listarResponsaveis(id));
    }

    @PostMapping("/periodos/{id}/responsaveis")
    @Operation(summary = "Adicionar um organizador responsável ao bazar")
    public ResponseEntity<BazarResponsavelDTO> adicionarResponsavel(
            @PathVariable Long id,
            @RequestBody @Valid BazarResponsavelFormDTO form
    ) {
        // Garantir coerência do path param com o body
        BazarResponsavelFormDTO dto = new BazarResponsavelFormDTO(id, form.membroId());
        return ResponseEntity.status(HttpStatus.CREATED).body(bazarService.adicionarResponsavel(dto));
    }

    @DeleteMapping("/responsaveis/{id}")
    @Operation(summary = "Remover um organizador responsável do bazar")
    public ResponseEntity<Void> removerResponsavel(@PathVariable Long id) {
        bazarService.removerResponsavel(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/produtos/importar-massa")
    @Operation(summary = "Importação em lote de produtos com geração de seriais únicos")
    public ResponseEntity<List<BazarProdutoDTO>> importarProdutosMassa(@RequestBody @Valid ProdutoImportFormDTO form) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bazarService.importarProdutosMassa(form));
    }

    @GetMapping("/produtos/pesquisa")
    @Operation(summary = "Filtro avançado de produtos na vitrine")
    public ResponseEntity<List<BazarProdutoDTO>> pesquisarProdutos(
            @RequestParam Long bazarId,
            @RequestParam(required = false) String nome,
            @RequestParam(required = false) String statusItem,
            @RequestParam(required = false) BigDecimal precoMin,
            @RequestParam(required = false) BigDecimal precoMax,
            @RequestParam(required = false) String codigoBarras
    ) {
        return ResponseEntity.ok(bazarService.pesquisarProdutos(bazarId, nome, statusItem, precoMin, precoMax, codigoBarras));
    }

    @PutMapping("/produtos/{id}")
    @Operation(summary = "Editar dados de um produto")
    public ResponseEntity<BazarProdutoDTO> editarProduto(@PathVariable Long id, @RequestBody @Valid BazarProdutoFormDTO form) {
        return ResponseEntity.ok(bazarService.editarProduto(id, form));
    }

    @DeleteMapping("/produtos/{id}")
    @Operation(summary = "Excluir um produto")
    public ResponseEntity<Void> excluirProduto(@PathVariable Long id, @RequestParam Long membroId) {
        bazarService.excluirProduto(id, membroId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/produtos/{produtoId}/serial-disponivel")
    @Operation(summary = "Obter um serial disponível de um produto para alocação automática no PDV")
    public ResponseEntity<Map<String, Object>> obterSerialDisponivel(
            @PathVariable Long produtoId,
            @RequestParam(required = false, defaultValue = "1") Integer limit
    ) {
        java.util.List<String> seriais = bazarService.obterSeriaisDisponiveis(produtoId, limit);
        Map<String, Object> res = new java.util.HashMap<>();
        res.put("seriais", seriais);
        if (!seriais.isEmpty()) {
            res.put("serialNumber", seriais.get(0));
        }
        return ResponseEntity.ok(res);
    }

    @PostMapping("/vendas/confirmar")
    @Operation(summary = "Confirmar venda de múltiplos seriais (baixa no estoque)")
    public ResponseEntity<BazarVendaDTO> confirmarVenda(@RequestBody @Valid BazarVendaFormDTO form) {
        return ResponseEntity.ok(bazarService.confirmarVenda(form));
    }

    @PostMapping("/vendas/{id}/estorno")
    @Operation(summary = "Estornar venda devolvendo os seriais para disponível")
    public ResponseEntity<Void> estornarVenda(@PathVariable Long id) {
        bazarService.estornarVenda(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/itens/estorno")
    @Operation(summary = "Estornar item de estoque (código de barras) individual devolvendo para disponível")
    public ResponseEntity<Void> estornarItem(
            @RequestParam String serialNumber,
            @RequestParam Long membroId) {
        bazarService.estornarItem(serialNumber, membroId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/periodos/{id}/itens")
    @Operation(summary = "Listar todos os itens de estoque (código de barras) de um bazar")
    public ResponseEntity<List<Map<String, Object>>> listarItensEstoque(@PathVariable Long id) {
        return ResponseEntity.ok(bazarService.listarItensEstoque(id));
    }
}
