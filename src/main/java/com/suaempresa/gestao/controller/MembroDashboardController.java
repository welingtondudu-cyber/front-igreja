package com.suaempresa.gestao.controller;

import com.suaempresa.gestao.domain.dto.MembroDashboardDTO;
import com.suaempresa.gestao.service.MembroDashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/membros/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard de Membros", description = "API para consolidação de métricas e analytics de membros da igreja")
public class MembroDashboardController {

    private final MembroDashboardService membroDashboardService;

    @GetMapping
    @Operation(summary = "Obter consolidação analítica de membros da igreja")
    public ResponseEntity<MembroDashboardDTO> obterDashboard() {
        return ResponseEntity.ok(membroDashboardService.obterDashboardConsolidado());
    }
}
