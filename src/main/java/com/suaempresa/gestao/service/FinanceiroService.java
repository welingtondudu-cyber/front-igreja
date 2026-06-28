package com.suaempresa.gestao.service;

import com.suaempresa.gestao.domain.entity.*;
import com.suaempresa.gestao.domain.dto.*;
import com.suaempresa.gestao.repository.*;
import com.suaempresa.gestao.exception.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.InputStreamReader;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FinanceiroService {

    private final LancamentoRepository lancamentoRepository;
    private final CategoriaRepository categoriaRepository;
    private final FechamentoMensalRepository fechamentoMensalRepository;
    private final ArquivoProcessadoRepository arquivoProcessadoRepository;
    private final MembroRepository membroRepository;
    private final HistoricoReaberturaRepository historicoReaberturaRepository;

    public FinanceiroService(
            LancamentoRepository lancamentoRepository,
            CategoriaRepository categoriaRepository,
            FechamentoMensalRepository fechamentoMensalRepository,
            ArquivoProcessadoRepository arquivoProcessadoRepository,
            MembroRepository membroRepository,
            HistoricoReaberturaRepository historicoReaberturaRepository) {
        this.lancamentoRepository = lancamentoRepository;
        this.categoriaRepository = categoriaRepository;
        this.fechamentoMensalRepository = fechamentoMensalRepository;
        this.arquivoProcessadoRepository = arquivoProcessadoRepository;
        this.membroRepository = membroRepository;
        this.historicoReaberturaRepository = historicoReaberturaRepository;
    }

    // Regra de Bloqueio por Competência
    public void validarCompetenciaAberta(LocalDate data) {
        int ano = data.getYear();
        int mes = data.getMonthValue();

        // 1. Verifica se o ano correspondente está fechado (mes = 0)
        boolean anoFechado = fechamentoMensalRepository.findByAnoAndMes(ano, 0).isPresent();
        if (anoFechado) {
            throw new CompetenciaBloqueadaException(
                "O ano de " + ano + " já se encontra fechado globalmente e não permite alterações."
            );
        }

        // 2. Verifica se o mês específico está fechado
        boolean mesFechado = fechamentoMensalRepository.findByAnoAndMes(ano, mes).isPresent();
        if (mesFechado) {
            throw new CompetenciaBloqueadaException(
                "A competência " + String.format("%02d/%d", mes, ano) + " já se encontra fechada e não permite alterações."
            );
        }
    }

    // Listar categorias ativas
    public List<CategoriaResumoDTO> obterCategorias() {
        return categoriaRepository.findAll()
            .stream()
            .map(c -> new CategoriaResumoDTO(c.getId(), c.getNome(), c.getTipoFluxo()))
            .sorted((a, b) -> a.nome().compareToIgnoreCase(b.nome()))
            .toList();
    }

    // Listar membros ativos para seleção de contribuinte
    public List<MembroContribuinteDTO> obterMembrosAtivos() {
        return membroRepository.findAllAtivosWithCargoAndLider()
            .stream()
            .map(m -> new MembroContribuinteDTO(m.getId(), m.getNomeCompleto()))
            .sorted((a, b) -> a.nomeCompleto().compareToIgnoreCase(b.nomeCompleto()))
            .toList();
    }



    // Listar lançamentos analíticos
    @Transactional(readOnly = true)
    public List<LancamentoExtratoDTO> obterExtrato(LocalDate dataInicio, LocalDate dataFim) {
        return lancamentoRepository.findByDataBetweenWithDetails(dataInicio, dataFim)
            .stream()
            .map(this::mapToExtratoDTO)
            .sorted((a, b) -> b.data().compareTo(a.data())) // Mais recentes primeiro
            .toList();
    }

    // Cadastrar Lançamento manual
    @Transactional
    public LancamentoExtratoDTO cadastrarLancamento(CadastroLancamentoDTO dto) {
        validarCompetenciaAberta(dto.data());

        Categoria categoria = categoriaRepository.findById(dto.categoriaId())
            .orElseThrow(() -> new RegraNegocioException("Categoria não encontrada"));

        Membro dizimista = null;
        if (dto.membroDizimistaId() != null) {
            dizimista = membroRepository.findById(dto.membroDizimistaId())
                .orElseThrow(() -> new MembroNaoEncontradoException("Membro dizimista não encontrado"));
        }

        Lancamento lancamento = Lancamento.builder()
            .data(dto.data())
            .descricao(dto.descricao())
            .valor(dto.valor())
            .tipoFluxo(dto.tipoFluxo())
            .categoria(categoria)
            .membroDizimista(dizimista)
            .statusConciliado(false)
            .build();

        Lancamento salvo = lancamentoRepository.save(lancamento);
        return mapToExtratoDTO(salvo);
    }

    // Exclusão em Lote
    @Transactional
    public void excluirLancamentos(List<Long> ids) {
        List<Lancamento> lancamentos = lancamentoRepository.findAllById(ids);
        for (Lancamento l : lancamentos) {
            validarCompetenciaAberta(l.getData());
        }
        lancamentoRepository.deleteAllByIdInBatch(ids);
    }

    // Encerrar Mês (Competência) ou Ano Completo
    @Transactional
    public FechamentoMensalResumoDTO encerrarCompetencia(int ano, int mes, Long usuarioId) {
        Optional<FechamentoMensal> existente = fechamentoMensalRepository.findByAnoAndMes(ano, mes);
        if (existente.isPresent()) {
            throw new RegraNegocioException(mes == 0 ? "O ano " + ano + " já está encerrado." : "Esta competência já está encerrada.");
        }

        BigDecimal saldoInicial = BigDecimal.ZERO;
        LocalDate dataInicio;
        LocalDate dataFim;

        if (mes == 0) {
            // Fechamento Anual
            dataInicio = LocalDate.of(ano, 1, 1);
            dataFim = LocalDate.of(ano, 12, 31);

            // Busca saldo do ano anterior trancado se existir
            Optional<FechamentoMensal> anteriorAnual = fechamentoMensalRepository.findByAnoAndMes(ano - 1, 0);
            if (anteriorAnual.isPresent()) {
                saldoInicial = anteriorAnual.get().getSaldoFinal();
            } else {
                // Caso não exista anual anterior, pega o último fechamento do ano anterior
                List<FechamentoMensal> fechamentos = fechamentoMensalRepository.findAllByOrderByAnoDescMesDesc();
                Optional<FechamentoMensal> ultimoAnoAnterior = fechamentos.stream()
                    .filter(f -> f.getAno() < ano)
                    .findFirst();
                if (ultimoAnoAnterior.isPresent()) {
                    saldoInicial = ultimoAnoAnterior.get().getSaldoFinal();
                }
            }
        } else {
            // Fechamento Mensal
            dataInicio = LocalDate.of(ano, mes, 1);
            dataFim = dataInicio.withDayOfMonth(dataInicio.lengthOfMonth());

            // O Saldo inicial é o saldo final do último fechamento histórico.
            List<FechamentoMensal> fechamentos = fechamentoMensalRepository.findAllByOrderByAnoDescMesDesc();
            if (!fechamentos.isEmpty()) {
                FechamentoMensal ultimo = fechamentos.get(0);
                saldoInicial = ultimo.getSaldoFinal();
            }
        }

        List<Lancamento> lancamentos = lancamentoRepository.findByDataBetweenWithDetails(dataInicio, dataFim);
        BigDecimal entradas = lancamentos.stream()
            .filter(l -> l.getTipoFluxo() == TipoFluxo.ENTRADA)
            .map(Lancamento::getValor)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal saidas = lancamentos.stream()
            .filter(l -> l.getTipoFluxo() == TipoFluxo.SAIDA)
            .map(Lancamento::getValor)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal saldoFinal = saldoInicial.add(entradas).subtract(saidas);

        FechamentoMensal fechamento = FechamentoMensal.builder()
            .ano(ano)
            .mes(mes)
            .saldoInicial(saldoInicial)
            .entradasDoMes(entradas)
            .saidasDoMes(saidas)
            .saldoFinal(saldoFinal)
            .dataFechamento(LocalDateTime.now())
            .usuarioId(usuarioId)
            .build();

        FechamentoMensal salvo = fechamentoMensalRepository.save(fechamento);
        return mapToFechamentoResumoDTO(salvo);
    }

    // Reabrir período trancado
    @Transactional
    public void reabrirCompetencia(int ano, int mes, String motivo, Long usuarioId) {
        FechamentoMensal fechamento = fechamentoMensalRepository.findByAnoAndMes(ano, mes)
            .orElseThrow(() -> new RegraNegocioException("Não existe um fechamento registrado para este período."));

        fechamentoMensalRepository.delete(fechamento);

        HistoricoReabertura historico = HistoricoReabertura.builder()
            .ano(ano)
            .mes(mes)
            .motivo(motivo)
            .dataReabertura(LocalDateTime.now())
            .usuarioId(usuarioId)
            .build();

        historicoReaberturaRepository.save(historico);
    }

    // Listar histórico de reaberturas
    public List<HistoricoReaberturaDTO> obterHistoricoReaberturas() {
        return historicoReaberturaRepository.findAllByOrderByDataReaberturaDesc()
            .stream()
            .map(h -> new HistoricoReaberturaDTO(
                h.getId(),
                h.getAno(),
                h.getMes(),
                h.getMotivo(),
                h.getDataReabertura(),
                h.getUsuarioId()
            ))
            .toList();
    }

    // Listar fechamentos
    public List<FechamentoMensalResumoDTO> obterFechamentos() {
        return fechamentoMensalRepository.findAllByOrderByAnoDescMesDesc()
            .stream()
            .map(this::mapToFechamentoResumoDTO)
            .toList();
    }

    // Dashboard Financeiro
    @Transactional(readOnly = true)
    public FinanceiroDashboardDTO obterDashboard(LocalDate dataInicio, LocalDate dataFim) {
        // Lançamentos do período atual
        List<Lancamento> lancamentos = lancamentoRepository.findByDataBetweenWithDetails(dataInicio, dataFim);

        BigDecimal receitaOperacional = lancamentos.stream()
            .filter(l -> l.getTipoFluxo() == TipoFluxo.ENTRADA)
            .map(Lancamento::getValor)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal despesasConsolidadas = lancamentos.stream()
            .filter(l -> l.getTipoFluxo() == TipoFluxo.SAIDA)
            .map(Lancamento::getValor)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal saldoDoMes = receitaOperacional.subtract(despesasConsolidadas);

        // Período anterior: anual vs mês corrido
        int anoAtual = dataInicio.getYear();
        boolean isAnual = dataInicio.getMonthValue() == 1 && dataFim.getMonthValue() == 12;

        LocalDate dataInicioAnterior;
        LocalDate dataFimAnterior;

        if (isAnual) {
            // Quando for Ano Completo, comparar com o ano anterior inteiro
            dataInicioAnterior = LocalDate.of(anoAtual - 1, 1, 1);
            dataFimAnterior    = LocalDate.of(anoAtual - 1, 12, 31);
        } else {
            // Para visão mensal, comparar com o mês imediatamente anterior
            long dias = ChronoUnit.DAYS.between(dataInicio, dataFim) + 1;
            dataInicioAnterior = dataInicio.minusDays(dias);
            dataFimAnterior    = dataInicio.minusDays(1);
        }

        List<Lancamento> lancamentosAnteriores = lancamentoRepository.findByDataBetweenWithDetails(dataInicioAnterior, dataFimAnterior);

        BigDecimal receitaAnterior = lancamentosAnteriores.stream()
            .filter(l -> l.getTipoFluxo() == TipoFluxo.ENTRADA)
            .map(Lancamento::getValor)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal despesaAnterior = lancamentosAnteriores.stream()
            .filter(l -> l.getTipoFluxo() == TipoFluxo.SAIDA)
            .map(Lancamento::getValor)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        // null = sem dados para comparar (não exibir tendência)
        Double receitaTendencia  = lancamentosAnteriores.isEmpty() ? null : calcularVariacaoPercentual(receitaOperacional, receitaAnterior);
        Double despesasTendencia = lancamentosAnteriores.isEmpty() ? null : calcularVariacaoPercentual(despesasConsolidadas, despesaAnterior);

        // Métrica de Dizimistas — contar apenas lançamentos de categoria Dízimos com membro vinculado
        long totalMembrosAtivos = membroRepository.countByStatusCadastroIgnoreCase("Ativo");
        if (totalMembrosAtivos == 0) totalMembrosAtivos = 1;

        long dizimistasPeriodoAtual = lancamentos.stream()
            .filter(l -> l.getMembroDizimista() != null
                && l.getCategoria() != null
                && l.getCategoria().getNome().toLowerCase().contains("dízimo")
                    || (l.getMembroDizimista() != null
                        && l.getCategoria() != null
                        && l.getCategoria().getNome().toLowerCase().contains("dizimo")))
            .map(l -> l.getMembroDizimista().getId())
            .distinct()
            .count();

        double dizimistasAtivosPercentual = ((double) dizimistasPeriodoAtual / totalMembrosAtivos) * 100.0;

        long dizimistasPeriodoAnterior = lancamentosAnteriores.stream()
            .filter(l -> l.getMembroDizimista() != null
                && l.getCategoria() != null
                && l.getCategoria().getNome().toLowerCase().contains("dízimo")
                    || (l.getMembroDizimista() != null
                        && l.getCategoria() != null
                        && l.getCategoria().getNome().toLowerCase().contains("dizimo")))
            .map(l -> l.getMembroDizimista().getId())
            .distinct()
            .count();

        double dizimistasAnteriorPercentual = ((double) dizimistasPeriodoAnterior / totalMembrosAtivos) * 100.0;
        Double dizimistasTendencia = lancamentosAnteriores.isEmpty() ? null : (dizimistasAtivosPercentual - dizimistasAnteriorPercentual);

        // Distribuições por Categoria
        List<CategoriaDistribuicaoDTO> distribuicaoEntradas = agruparPorCategoria(lancamentos, TipoFluxo.ENTRADA, receitaOperacional);
        List<CategoriaDistribuicaoDTO> distribuicaoSaidas = agruparPorCategoria(lancamentos, TipoFluxo.SAIDA, despesasConsolidadas);

        // Histórico de saldos para o gráfico: calcular entradas e saídas de Jan a Dez para o ano selecionado
        int ano = dataInicio.getYear();
        List<Lancamento> lancamentosDoAno = lancamentoRepository.findByDataBetweenWithDetails(
            LocalDate.of(ano, 1, 1),
            LocalDate.of(ano, 12, 31)
        );

        java.util.Map<Integer, List<Lancamento>> porMes = lancamentosDoAno.stream()
            .collect(java.util.stream.Collectors.groupingBy(l -> l.getData().getMonthValue()));

        List<FechamentoMensalResumoDTO> historicoSaldos = new java.util.ArrayList<>();
        BigDecimal saldoAcumulado = BigDecimal.ZERO;

        for (int m = 1; m <= 12; m++) {
            List<Lancamento> lancsMes = porMes.getOrDefault(m, java.util.Collections.emptyList());
            BigDecimal entradasMes = lancsMes.stream()
                .filter(l -> l.getTipoFluxo() == TipoFluxo.ENTRADA)
                .map(Lancamento::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal saidasMes = lancsMes.stream()
                .filter(l -> l.getTipoFluxo() == TipoFluxo.SAIDA)
                .map(Lancamento::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

            java.util.Optional<FechamentoMensal> fechamentoOpt = fechamentoMensalRepository.findByAnoAndMes(ano, m);
            boolean statusTrancado = fechamentoOpt.isPresent();
            BigDecimal saldoFinalMes = saldoAcumulado.add(entradasMes).subtract(saidasMes);

            BigDecimal finalEntradas = statusTrancado ? fechamentoOpt.get().getEntradasDoMes() : entradasMes;
            BigDecimal finalSaidas = statusTrancado ? fechamentoOpt.get().getSaidasDoMes() : saidasMes;
            BigDecimal finalSaldoFinal = statusTrancado ? fechamentoOpt.get().getSaldoFinal() : saldoFinalMes;
            BigDecimal finalSaldoInicial = statusTrancado ? fechamentoOpt.get().getSaldoInicial() : saldoAcumulado;
            java.time.LocalDateTime dataFech = statusTrancado ? fechamentoOpt.get().getDataFechamento() : null;
            Long userId = statusTrancado ? fechamentoOpt.get().getUsuarioId() : null;

            historicoSaldos.add(new FechamentoMensalResumoDTO(
                statusTrancado ? fechamentoOpt.get().getId() : null,
                ano,
                m,
                finalSaldoInicial,
                finalEntradas,
                finalSaidas,
                finalSaldoFinal,
                dataFech,
                userId,
                statusTrancado
            ));

            saldoAcumulado = finalSaldoFinal;
        }

        return new FinanceiroDashboardDTO(
            receitaOperacional,
            receitaTendencia,
            despesasConsolidadas,
            despesasTendencia,
            saldoDoMes,
            dizimistasAtivosPercentual,
            dizimistasTendencia,
            distribuicaoEntradas,
            distribuicaoSaidas,
            historicoSaldos
        );
    }

    // Importador de CSV Bradesco PJ
    @Transactional
    public void importarExtratoBradesco(String nomeArquivo, byte[] conteudo) {
        String hash = calcularHashSha256(conteudo);
        if (arquivoProcessadoRepository.existsByHashSha256(hash)) {
            throw new ArquivoDuplicadoException("Este arquivo já foi importado anteriormente.");
        }

        List<Categoria> categorias = categoriaRepository.findAll();
        Categoria catDizimos = encontrarCategoria(categorias, "Dízimos", TipoFluxo.ENTRADA);
        Categoria catOfertas = encontrarCategoria(categorias, "Ofertas", TipoFluxo.ENTRADA);
        Categoria catManutencao = encontrarCategoria(categorias, "Manutenção/Reformas", TipoFluxo.SAIDA);
        Categoria catUtilidades = encontrarCategoria(categorias, "Utilidades (Água, Luz, Internet)", TipoFluxo.SAIDA);
        Categoria catOutrasEntradas = encontrarCategoria(categorias, "Outras Entradas", TipoFluxo.ENTRADA);
        Categoria catOutrasDespesas = encontrarCategoria(categorias, "Outras Despesas", TipoFluxo.SAIDA);

        List<Lancamento> lancamentosParaSalvar = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(new ByteArrayInputStream(conteudo), StandardCharsets.ISO_8859_1))) {

            String linha;
            while ((linha = reader.readLine()) != null) {
                linha = linha.trim();
                if (linha.isEmpty()) continue;

                // Separador de colunas CSV do Bradesco PJ
                String[] colunas = linha.split(";");
                if (colunas.length < 4) continue;

                String dataStr = colunas[0].trim();
                // Regex para DD/MM/AAAA
                if (!dataStr.matches("\\d{2}/\\d{2}/\\d{4}")) {
                    continue; 
                }

                LocalDate data = parseData(dataStr);
                // Valida trava do período
                validarCompetenciaAberta(data);

                String descricao = colunas[1].trim();
                String valorStr = colunas[3].trim(); 

                BigDecimal valor = parseValor(valorStr);
                if (valor.compareTo(BigDecimal.ZERO) == 0) continue;

                TipoFluxo tipo = valor.compareTo(BigDecimal.ZERO) > 0 ? TipoFluxo.ENTRADA : TipoFluxo.SAIDA;
                BigDecimal valorAbsoluto = valor.abs();

                // Regras inteligentes de busca por categoria
                Categoria categoriaMapeada = null;
                String descLower = descricao.toLowerCase();
                if (tipo == TipoFluxo.ENTRADA) {
                    if (descLower.contains("dizimo") || descLower.contains("dízimo")) {
                        categoriaMapeada = catDizimos;
                    } else if (descLower.contains("oferta")) {
                        categoriaMapeada = catOfertas;
                    } else {
                        categoriaMapeada = catOutrasEntradas;
                    }
                } else {
                    if (descLower.contains("manutencao") || descLower.contains("manutenção") || descLower.contains("reforma")) {
                        categoriaMapeada = catManutencao;
                    } else if (descLower.contains("neoenergia") || descLower.contains("copasa") || descLower.contains("agua") || descLower.contains("água") || descLower.contains("luz") || descLower.contains("telef") || descLower.contains("internet") || descLower.contains("energia")) {
                        categoriaMapeada = catUtilidades;
                    } else {
                        categoriaMapeada = catOutrasDespesas;
                    }
                }

                Lancamento lancamento = Lancamento.builder()
                    .data(data)
                    .descricao(descricao)
                    .valor(valorAbsoluto)
                    .tipoFluxo(tipo)
                    .categoria(categoriaMapeada)
                    .statusConciliado(true) // Importação de extrato oficial banco PJ
                    .build();

                lancamentosParaSalvar.add(lancamento);
            }
        } catch (IOException e) {
            throw new RegraNegocioException("Erro ao ler o arquivo CSV enviado: " + e.getMessage());
        }

        if (lancamentosParaSalvar.isEmpty()) {
            throw new RegraNegocioException("Nenhum lançamento válido de data ou valor encontrado no extrato enviado.");
        }

        lancamentoRepository.saveAll(lancamentosParaSalvar);

        ArquivoProcessado AP = ArquivoProcessado.builder()
            .hashSha256(hash)
            .nomeArquivo(nomeArquivo)
            .dataProcessamento(LocalDateTime.now())
            .build();

        arquivoProcessadoRepository.save(AP);
    }

    private Categoria encontrarCategoria(List<Categoria> lista, String nome, TipoFluxo tipo) {
        return lista.stream()
            .filter(c -> c.getNome().equalsIgnoreCase(nome) && c.getTipoFluxo() == tipo)
            .findFirst()
            .orElse(lista.stream().filter(c -> c.getTipoFluxo() == tipo).findFirst().orElse(null));
    }

    private LocalDate parseData(String dataStr) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        return LocalDate.parse(dataStr, formatter);
    }

    private BigDecimal parseValor(String valorStr) {
        try {
            // Remove pontos de milhar e substitui vírgula decimal brasileira por ponto
            String limpo = valorStr.replace(".", "").replace(",", ".").trim();
            return new BigDecimal(limpo);
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }

    private String calcularHashSha256(byte[] bytes) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(bytes);
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Erro ao calcular checksum SHA-256 do arquivo", e);
        }
    }

    private double calcularVariacaoPercentual(BigDecimal atual, BigDecimal anterior) {
        if (anterior.compareTo(BigDecimal.ZERO) == 0) {
            return atual.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0;
        }
        BigDecimal variacao = atual.subtract(anterior)
            .multiply(BigDecimal.valueOf(100))
            .divide(anterior, 2, RoundingMode.HALF_UP);
        return variacao.doubleValue();
    }

    private List<CategoriaDistribuicaoDTO> agruparPorCategoria(List<Lancamento> lancamentos, TipoFluxo tipo, BigDecimal totalFluxo) {
        if (totalFluxo.compareTo(BigDecimal.ZERO) == 0) {
            return List.of();
        }

        return lancamentos.stream()
            .filter(l -> l.getTipoFluxo() == tipo)
            .collect(Collectors.groupingBy(
                l -> l.getCategoria().getNome(),
                Collectors.reducing(BigDecimal.ZERO, Lancamento::getValor, BigDecimal::add)
            ))
            .entrySet()
            .stream()
            .map(entry -> {
                BigDecimal valorTotal = entry.getValue();
                double percentual = valorTotal.multiply(BigDecimal.valueOf(100))
                    .divide(totalFluxo, 2, RoundingMode.HALF_UP)
                    .doubleValue();
                return new CategoriaDistribuicaoDTO(entry.getKey(), valorTotal, percentual);
            })
            .sorted((a, b) -> b.valorTotal().compareTo(a.valorTotal()))
            .toList();
    }

    private LancamentoExtratoDTO mapToExtratoDTO(Lancamento l) {
        Long dizimistaId = l.getMembroDizimista() != null ? l.getMembroDizimista().getId() : null;
        String dizimistaNome = l.getMembroDizimista() != null ? l.getMembroDizimista().getNomeCompleto() : null;
        return new LancamentoExtratoDTO(
            l.getId(),
            l.getData(),
            l.getDescricao(),
            l.getCategoria().getNome(),
            l.getTipoFluxo(),
            l.getValor(),
            l.isStatusConciliado(),
            dizimistaId,
            dizimistaNome
        );
    }

    private FechamentoMensalResumoDTO mapToFechamentoResumoDTO(FechamentoMensal f) {
        return new FechamentoMensalResumoDTO(
            f.getId(),
            f.getAno(),
            f.getMes(),
            f.getSaldoInicial(),
            f.getEntradasDoMes(),
            f.getSaidasDoMes(),
            f.getSaldoFinal(),
            f.getDataFechamento(),
            f.getUsuarioId(),
            true // Qualquer fechamento registrado na base indica competência trancada
        );
    }
}
