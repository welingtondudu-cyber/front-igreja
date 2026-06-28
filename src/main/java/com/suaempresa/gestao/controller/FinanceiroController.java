package com.suaempresa.gestao.controller;

import com.suaempresa.gestao.domain.dto.*;
import com.suaempresa.gestao.service.FinanceiroService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/financeiro")
@RequiredArgsConstructor
@Tag(name = "Financeiro", description = "API para gestão financeira, relatórios analíticos, fechamentos e conciliação")
public class FinanceiroController {

    private final FinanceiroService financeiroService;

    @GetMapping("/dashboard")
    @Operation(summary = "Obter dados do dashboard financeiro consolidado")
    public ResponseEntity<FinanceiroDashboardDTO> obterDashboard(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim
    ) {
        return ResponseEntity.ok(financeiroService.obterDashboard(dataInicio, dataFim));
    }

    @GetMapping("/extrato")
    @Operation(summary = "Obter extrato analítico de lançamentos no período")
    public ResponseEntity<List<LancamentoExtratoDTO>> obterExtrato(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim
    ) {
        return ResponseEntity.ok(financeiroService.obterExtrato(dataInicio, dataFim));
    }

    @PostMapping("/extrato")
    @Operation(summary = "Cadastrar um novo lançamento financeiro manual")
    public ResponseEntity<LancamentoExtratoDTO> cadastrarLancamento(
            @RequestBody @Valid CadastroLancamentoDTO dto
    ) {
        return ResponseEntity.ok(financeiroService.cadastrarLancamento(dto));
    }

    @DeleteMapping("/extrato")
    @Operation(summary = "Excluir transações financeiras em lote")
    public ResponseEntity<Void> excluirLancamentos(
            @RequestBody @Valid ExclusaoLoteDTO dto
    ) {
        financeiroService.excluirLancamentos(dto.ids());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/extrato/importar")
    @Operation(summary = "Importar extrato bancário oficial do Bradesco PJ (CSV)")
    public ResponseEntity<Void> importarExtrato(
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        financeiroService.importarExtratoBradesco(file.getOriginalFilename(), file.getBytes());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/fechamentos")
    @Operation(summary = "Listar histórico de competências mensais encerradas")
    public ResponseEntity<List<FechamentoMensalResumoDTO>> obterFechamentos() {
        return ResponseEntity.ok(financeiroService.obterFechamentos());
    }

    @PostMapping("/fechamentos/encerrar")
    @Operation(summary = "Encerrar e trancar competência mensal de lançamentos")
    public ResponseEntity<FechamentoMensalResumoDTO> encerrarCompetencia(
            @RequestParam int ano,
            @RequestParam int mes,
            @RequestParam(required = false) Long usuarioId
    ) {
        Long idAutor = usuarioId != null ? usuarioId : 1L; // Fallback para usuário admin principal
        return ResponseEntity.ok(financeiroService.encerrarCompetencia(ano, mes, idAutor));
    }

    @PostMapping("/fechamentos/reabrir")
    @Operation(summary = "Reabrir uma competência mensal ou anual trancada")
    public ResponseEntity<Void> reabrirCompetencia(
            @RequestParam int ano,
            @RequestParam int mes,
            @RequestParam String motivo,
            @RequestParam(required = false) Long usuarioId
    ) {
        Long idAutor = usuarioId != null ? usuarioId : 1L;
        financeiroService.reabrirCompetencia(ano, mes, motivo, idAutor);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/fechamentos/reaberturas")
    @Operation(summary = "Obter histórico de reaberturas de competência")
    public ResponseEntity<List<HistoricoReaberturaDTO>> obterHistoricoReaberturas() {
        return ResponseEntity.ok(financeiroService.obterHistoricoReaberturas());
    }

    @GetMapping("/categorias")
    @Operation(summary = "Listar categorias financeiras disponíveis")
    public ResponseEntity<List<CategoriaResumoDTO>> obterCategorias() {
        return ResponseEntity.ok(financeiroService.obterCategorias());
    }

    @GetMapping("/membros-ativos")
    @Operation(summary = "Listar membros ativos para seleção de contribuinte em lançamentos")
    public ResponseEntity<List<MembroContribuinteDTO>> obterMembrosAtivos() {
        return ResponseEntity.ok(financeiroService.obterMembrosAtivos());
    }
}

