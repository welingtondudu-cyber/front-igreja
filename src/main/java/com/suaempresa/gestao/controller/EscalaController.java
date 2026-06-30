package com.suaempresa.gestao.controller;

import com.suaempresa.gestao.domain.dto.EventoDTO;
import com.suaempresa.gestao.domain.dto.EventoFormDTO;
import com.suaempresa.gestao.domain.dto.EscalaDetalheDTO;
import com.suaempresa.gestao.domain.dto.EscalaFormDTO;
import com.suaempresa.gestao.domain.dto.EscalaVisaoGeralDTO;
import com.suaempresa.gestao.service.EscalaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/escalas")
@RequiredArgsConstructor
@Tag(name = "Escalas de Culto", description = "Endpoints para gerenciamento de escalas e eventos")
public class EscalaController {

    private final EscalaService escalaService;

    @PostMapping("/eventos")
    @Operation(summary = "Criar novo evento/culto exigindo ministérios")
    public ResponseEntity<EventoDTO> criarEvento(@RequestBody @Valid EventoFormDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(escalaService.criarEvento(dto));
    }

    @PutMapping("/eventos/{id}")
    @Operation(summary = "Atualizar evento/culto existente")
    public ResponseEntity<EventoDTO> atualizarEvento(@PathVariable Long id, @RequestBody @Valid EventoFormDTO dto) {
        return ResponseEntity.ok(escalaService.atualizarEvento(id, dto));
    }

    @GetMapping("/visao-geral")
    @Operation(summary = "Obter visão geral de cultos e status das equipes do mês")
    public ResponseEntity<List<EscalaVisaoGeralDTO>> obterVisaoGeral(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim
    ) {
        return ResponseEntity.ok(escalaService.obterVisaoGeral(dataInicio, dataFim));
    }

    @GetMapping("/evento/{eventoId}")
    @Operation(summary = "Obter listagem de escalas para um evento")
    public ResponseEntity<List<EscalaDetalheDTO>> obterEscalasDoEvento(@PathVariable Long eventoId) {
        return ResponseEntity.ok(escalaService.obterEscalasDoEvento(eventoId));
    }

    @GetMapping("/membro/{membroId}")
    @Operation(summary = "Obter listagem de escalas para um membro específico")
    public ResponseEntity<List<EscalaDetalheDTO>> obterEscalasDoMembro(@PathVariable Long membroId) {
        return ResponseEntity.ok(escalaService.obterEscalasDoMembro(membroId));
    }

    @PostMapping("/evento/{eventoId}")
    @Operation(summary = "Salvar / atualizar todas as escalas de voluntários do evento")
    public ResponseEntity<List<EscalaDetalheDTO>> salvarEscalasDoEvento(
            @PathVariable Long eventoId,
            @RequestBody List<EscalaFormDTO> dtos
    ) {
        return ResponseEntity.ok(escalaService.salvarEscalasDoEvento(eventoId, dtos));
    }

    @PostMapping("/{escalaId}/responder")
    @Operation(summary = "Voluntário responde confirmação da escala")
    public ResponseEntity<Void> responderEscala(
            @PathVariable Long escalaId,
            @RequestParam String status,
            @RequestParam(required = false) String motivo
    ) {
        escalaService.responderEscala(escalaId, status, motivo);
        return ResponseEntity.ok().build();
    }
}
