package com.suaempresa.gestao.controller;

import com.suaempresa.gestao.domain.dto.*;
import com.suaempresa.gestao.service.VotacaoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Tag(name = "Votações", description = "API para realização de eleições, votações públicas de membros e apuração de votos")
public class VotacaoController {

    private final VotacaoService votacaoService;

    @PostMapping("/api/public/votacoes/verificar-elegibilidade")
    @Operation(summary = "Verificar elegibilidade do eleitor", description = "Valida se o CPF fornecido pertence a um membro apto a participar da votação informada.")
    public ResponseEntity<ElegibilidadeResponse> verificarElegibilidade(@RequestBody @Valid ElegibilidadeRequest request) {
        ElegibilidadeResponse response = votacaoService.verificarElegibilidade(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/public/votacoes/votar")
    @Operation(summary = "Registrar voto", description = "Computa o voto secreto de um membro para uma opção/candidato, gerando um comprovante de auditoria.")
    public ResponseEntity<String> votar(@RequestBody @Valid VotoRequest request) {
        String codigoAuditoria = votacaoService.votar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(codigoAuditoria);
    }

    @PostMapping("/api/admin/votacoes")
    @Operation(summary = "Criar nova votação (Admin)", description = "Cadastra uma nova assembleia ou eleição com candidatos configurados e restrições.")
    public ResponseEntity<Long> criarVotacao(@RequestBody @Valid CriarVotacaoRequest request) {
        Long votacaoId = votacaoService.criarVotacao(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(votacaoId);
    }

    @GetMapping("/api/public/votacoes/ativas")
    @Operation(summary = "Listar votações ativas", description = "Retorna uma lista resumida de todas as eleições e votações em andamento.")
    public ResponseEntity<java.util.List<VotacaoSimplificadaDTO>> listarAtivas() {
        java.util.List<VotacaoSimplificadaDTO> response = votacaoService.listarAtivas();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/public/votacoes/{id}/cedula")
    @Operation(summary = "Obter cédula de votação", description = "Obtém as informações de uma eleição e a lista de candidatos disponíveis para o eleitor visualizar.")
    public ResponseEntity<CedulaVotacaoResponse> obterCedula(
            @Parameter(description = "ID da votação", required = true) @PathVariable Long id
    ) {
        CedulaVotacaoResponse response = votacaoService.obterCedulaVotacao(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/admin/votacoes/{id}/apuracao")
    @Operation(summary = "Obter apuração de votos (Admin)", description = "Calcula em tempo real ou final o total de votos válidos, brancos, nulos e percentuais por candidato.")
    public ResponseEntity<ApuracaoResponse> obterApuracao(
            @Parameter(description = "ID da votação", required = true) @PathVariable Long id
    ) {
        ApuracaoResponse response = votacaoService.obterApuracao(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/admin/votacoes/{id}/encerrar")
    @Operation(summary = "Encerrar votação (Admin)", description = "Encerra uma votação ativa, calcula e salva o quórum final (total de membros aptos) na coluna histórica e define o timestamp de encerramento.")
    public ResponseEntity<Void> encerrarVotacao(
            @Parameter(description = "ID da votação a ser encerrada", required = true) @PathVariable Long id
    ) {
        votacaoService.encerrarVotacao(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/api/admin/votacoes/{id}/restricoes")
    @Operation(summary = "Listar restrições de voto (Admin)", description = "Retorna a lista de restrições de voto de membros para uma determinada votação.")
    public ResponseEntity<java.util.List<VotacaoRestricaoDTO>> listarRestricoes(
            @Parameter(description = "ID da votação", required = true) @PathVariable Long id
    ) {
        return ResponseEntity.ok(votacaoService.listarRestricoes(id));
    }

    @PostMapping("/api/admin/votacoes/{id}/restricoes")
    @Operation(summary = "Cadastrar restrição de voto (Admin)", description = "Registra uma nova restrição para impedir um membro específico de votar em determinada votação.")
    public ResponseEntity<Void> cadastrarRestricao(
            @Parameter(description = "ID da votação", required = true) @PathVariable Long id,
            @RequestBody @Valid VotacaoRestricaoForm form
    ) {
        votacaoService.cadastrarRestricao(id, form.matricula(), form.motivo());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/api/admin/votacoes/{id}/restricoes/{matricula}")
    @Operation(summary = "Remover restrição de voto (Admin)", description = "Remove a restrição de voto para o membro na votação especificada.")
    public ResponseEntity<Void> removerRestricao(
            @Parameter(description = "ID da votação", required = true) @PathVariable Long id,
            @Parameter(description = "Matrícula do membro", required = true) @PathVariable String matricula
    ) {
        votacaoService.removerRestricao(id, matricula);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/admin/votacoes")
    @Operation(summary = "Listar todas as votações (Admin)", description = "Retorna a lista completa de todas as eleições e votações (ativas ou encerradas) registradas.")
    public ResponseEntity<java.util.List<VotacaoAdminDTO>> listarTodasParaAdmin() {
        return ResponseEntity.ok(votacaoService.listarTodasParaAdmin());
    }

    @PutMapping("/api/admin/votacoes/{id}")
    @Operation(summary = "Editar votação (Admin)", description = "Atualiza os dados cadastrais da votação, como título, limite de votos por eleitor, idade mínima e opções.")
    public ResponseEntity<Void> atualizarVotacao(@PathVariable Long id, @RequestBody @Valid CriarVotacaoRequest request) {
        votacaoService.atualizarVotacao(id, request);
        return ResponseEntity.ok().build();
    }
}
