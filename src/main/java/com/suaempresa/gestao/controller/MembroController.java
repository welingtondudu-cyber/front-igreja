package com.suaempresa.gestao.controller;

import com.suaempresa.gestao.domain.dto.MembroDetalhadoDTO;
import com.suaempresa.gestao.domain.dto.MembroFormDTO;
import com.suaempresa.gestao.domain.dto.MembroSimplificadoDTO;
import com.suaempresa.gestao.service.MembroService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/membros")
@RequiredArgsConstructor
public class MembroController {

    private final MembroService membroService;

    @GetMapping
    public ResponseEntity<List<MembroSimplificadoDTO>> listarMembros() {
        return ResponseEntity.ok(membroService.listarMembrosAtivos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MembroDetalhadoDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(membroService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<MembroDetalhadoDTO> criar(@RequestBody @Valid MembroFormDTO dto) {
        MembroDetalhadoDTO criado = membroService.criar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MembroDetalhadoDTO> atualizar(@PathVariable Long id, @RequestBody @Valid MembroFormDTO dto) {
        return ResponseEntity.ok(membroService.atualizar(id, dto));
    }

    @GetMapping(value = "/exportar/csv", produces = "text/csv")
    public ResponseEntity<byte[]> exportarCsv() {
        byte[] csvData = membroService.exportarCsv();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "membros.csv");

        return ResponseEntity.ok()
                .headers(headers)
                .body(csvData);
    }

    @PostMapping(value = "/importar/csv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> importarCsv(@RequestParam("file") MultipartFile file) {
        membroService.importarCsv(file);
        return ResponseEntity.ok(Map.of("mensagem", "Arquivo CSV importado com sucesso no banco de dados!"));
    }

}
