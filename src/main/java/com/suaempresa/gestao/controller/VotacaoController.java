package com.suaempresa.gestao.controller;

import com.suaempresa.gestao.domain.dto.*;
import com.suaempresa.gestao.service.VotacaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class VotacaoController {

    private final VotacaoService votacaoService;

    @PostMapping("/api/public/votacoes/verificar-elegibilidade")
    public ResponseEntity<ElegibilidadeResponse> verificarElegibilidade(@RequestBody @Valid ElegibilidadeRequest request) {
        ElegibilidadeResponse response = votacaoService.verificarElegibilidade(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/public/votacoes/votar")
    public ResponseEntity<String> votar(@RequestBody @Valid VotoRequest request) {
        String codigoAuditoria = votacaoService.votar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(codigoAuditoria);
    }

    @PostMapping("/api/admin/votacoes")
    public ResponseEntity<Long> criarVotacao(@RequestBody @Valid CriarVotacaoRequest request) {
        Long votacaoId = votacaoService.criarVotacao(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(votacaoId);
    }

    @GetMapping("/api/public/votacoes/ativas")
    public ResponseEntity<java.util.List<VotacaoSimplificadaDTO>> listarAtivas() {
        java.util.List<VotacaoSimplificadaDTO> response = votacaoService.listarAtivas();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/public/votacoes/{id}/cedula")
    public ResponseEntity<CedulaVotacaoResponse> obterCedula(@PathVariable Long id) {
        CedulaVotacaoResponse response = votacaoService.obterCedulaVotacao(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/admin/votacoes/{id}/apuracao")
    public ResponseEntity<ApuracaoResponse> obterApuracao(@PathVariable Long id) {
        ApuracaoResponse response = votacaoService.obterApuracao(id);
        return ResponseEntity.ok(response);
    }
}
