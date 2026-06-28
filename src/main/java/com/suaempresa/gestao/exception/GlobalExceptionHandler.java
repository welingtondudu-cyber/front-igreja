package com.suaempresa.gestao.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RegraNegocioException.class)
    public ResponseEntity<ProblemDetail> handleRegraNegocio(RegraNegocioException ex) {
        return buildProblemDetail(HttpStatus.BAD_REQUEST, "Erro de Regra de Negócio", ex.getMessage());
    }

    @ExceptionHandler(VotoJaComputadoException.class)
    public ResponseEntity<ProblemDetail> handleVotoJaComputado(VotoJaComputadoException ex) {
        return buildProblemDetail(HttpStatus.BAD_REQUEST, "Voto Já Computado", ex.getMessage());
    }

    @ExceptionHandler(LimiteVotosExcedidoException.class)
    public ResponseEntity<ProblemDetail> handleLimiteVotosExcedido(LimiteVotosExcedidoException ex) {
        return buildProblemDetail(HttpStatus.BAD_REQUEST, "Limite de Votos Excedido", ex.getMessage());
    }

    @ExceptionHandler(MembroNaoElegivelException.class)
    public ResponseEntity<ProblemDetail> handleMembroNaoElegivel(MembroNaoElegivelException ex) {
        return buildProblemDetail(HttpStatus.FORBIDDEN, "Membro Não Elegível", ex.getMessage());
    }

    @ExceptionHandler(MembroMenorDeIdadeException.class)
    public ResponseEntity<ProblemDetail> handleMembroMenorDeIdade(MembroMenorDeIdadeException ex) {
        return buildProblemDetail(HttpStatus.FORBIDDEN, "Membro Menor de Idade", ex.getMessage());
    }

    @ExceptionHandler(MembroRestritoException.class)
    public ResponseEntity<ProblemDetail> handleMembroRestrito(MembroRestritoException ex) {
        return buildProblemDetail(HttpStatus.FORBIDDEN, "Membro Restrito", "Este membro possui restrição de voto para esta eleição. Motivo: " + ex.getMessage());
    }

    @ExceptionHandler(MembroNaoEncontradoException.class)
    public ResponseEntity<ProblemDetail> handleMembroNaoEncontrado(MembroNaoEncontradoException ex) {
        return buildProblemDetail(HttpStatus.NOT_FOUND, "Membro Não Encontrado", ex.getMessage());
    }

    @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetail> handleValidationExceptions(org.springframework.web.bind.MethodArgumentNotValidException ex) {
        StringBuilder sb = new StringBuilder("Erro de validação: ");
        ex.getBindingResult().getFieldErrors().forEach(error -> {
            sb.append(error.getField()).append(" (").append(error.getDefaultMessage()).append("); ");
        });
        return buildProblemDetail(HttpStatus.BAD_REQUEST, "Erro de Validação", sb.toString());
    }

    @ExceptionHandler(VotacaoInativaException.class)
    public ResponseEntity<ProblemDetail> handleVotacaoInativa(VotacaoInativaException ex) {
        return buildProblemDetail(HttpStatus.BAD_REQUEST, "Votação Inativa", ex.getMessage());
    }

    @ExceptionHandler(CompetenciaBloqueadaException.class)
    public ResponseEntity<ProblemDetail> handleCompetenciaBloqueada(CompetenciaBloqueadaException ex) {
        return buildProblemDetail(HttpStatus.BAD_REQUEST, "Competência Bloqueada", ex.getMessage());
    }

    @ExceptionHandler(ArquivoDuplicadoException.class)
    public ResponseEntity<ProblemDetail> handleArquivoDuplicado(ArquivoDuplicadoException ex) {
        return buildProblemDetail(HttpStatus.BAD_REQUEST, "Arquivo Duplicado", ex.getMessage());
    }

    private ResponseEntity<ProblemDetail> buildProblemDetail(HttpStatus status, String title, String detail) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(status, detail);
        problemDetail.setTitle(title);
        problemDetail.setProperty("timestamp", Instant.now());
        return ResponseEntity.status(status).body(problemDetail);
    }
}
