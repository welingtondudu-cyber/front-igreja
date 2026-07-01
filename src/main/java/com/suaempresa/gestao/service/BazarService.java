package com.suaempresa.gestao.service;

import com.suaempresa.gestao.domain.dto.*;
import com.suaempresa.gestao.domain.entity.*;
import com.suaempresa.gestao.exception.RegraNegocioException;
import com.suaempresa.gestao.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BazarService {

    private final BazarPeriodoRepository bazarPeriodoRepository;
    private final BazarResponsavelRepository bazarResponsavelRepository;
    private final BazarProdutoRepository bazarProdutoRepository;
    private final BazarItemEstoqueRepository bazarItemEstoqueRepository;
    private final BazarVendaRepository bazarVendaRepository;
    private final MembroRepository membroRepository;

    /**
     * Valida se o bazar está ativo. Se estiver concluído, bloqueia qualquer operação.
     */
    private void validarBazarAtivo(Long bazarId) {
        BazarPeriodo bazar = bazarPeriodoRepository.findById(bazarId)
                .orElseThrow(() -> new RegraNegocioException("Bazar não encontrado com ID: " + bazarId));
        if ("CONCLUIDO".equalsIgnoreCase(bazar.getStatus())) {
            throw new RegraNegocioException("Operação bloqueada! O evento " + bazar.getNomeBazar() + " já está CONCLUÍDO.");
        }
    }

    @Transactional(readOnly = true)
    public List<BazarPeriodoDTO> pesquisarBazares(String nome, String status, LocalDateTime dataInicio, LocalDateTime dataFim) {
        return bazarPeriodoRepository.pesquisarBazares(nome, status, dataInicio, dataFim)
                .stream()
                .map(this::mapToBazarPeriodoDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public BazarPeriodoDTO criarBazar(BazarPeriodoFormDTO form) {
        BazarPeriodo bp = new BazarPeriodo();
        bp.setNomeBazar(form.nomeBazar());
        bp.setStatus("ATIVO");
        bp.setDataInicio(LocalDateTime.now());
        BazarPeriodo salvo = bazarPeriodoRepository.save(bp);
        return mapToBazarPeriodoDTO(salvo);
    }

    @Transactional
    public BazarPeriodoDTO concluirBazar(Long id) {
        BazarPeriodo bp = bazarPeriodoRepository.findById(id)
                .orElseThrow(() -> new RegraNegocioException("Bazar não encontrado com ID: " + id));
        bp.setStatus("CONCLUIDO");
        bp.setDataFechamento(LocalDateTime.now());
        BazarPeriodo salvo = bazarPeriodoRepository.save(bp);
        return mapToBazarPeriodoDTO(salvo);
    }

    @Transactional
    public BazarResponsavelDTO adicionarResponsavel(BazarResponsavelFormDTO form) {
        validarBazarAtivo(form.bazarId());
        
        if (bazarResponsavelRepository.existsByBazarIdAndMembroId(form.bazarId(), form.membroId())) {
            throw new RegraNegocioException("Este membro já é responsável por este bazar.");
        }

        BazarPeriodo bp = bazarPeriodoRepository.findById(form.bazarId())
                .orElseThrow(() -> new RegraNegocioException("Bazar não encontrado"));
        Membro membro = membroRepository.findById(form.membroId())
                .orElseThrow(() -> new RegraNegocioException("Membro não encontrado"));

        BazarResponsavel br = new BazarResponsavel();
        br.setBazar(bp);
        br.setMembro(membro);
        BazarResponsavel salvo = bazarResponsavelRepository.save(br);
        return mapToBazarResponsavelDTO(salvo);
    }

    @Transactional
    public void removerResponsavel(Long responsavelId) {
        BazarResponsavel br = bazarResponsavelRepository.findById(responsavelId)
                .orElseThrow(() -> new RegraNegocioException("Responsável não encontrado"));
        validarBazarAtivo(br.getBazar().getId());
        bazarResponsavelRepository.delete(br);
    }

    @Transactional(readOnly = true)
    public List<BazarResponsavelDTO> listarResponsaveis(Long bazarId) {
        return bazarResponsavelRepository.findByBazarId(bazarId)
                .stream()
                .map(this::mapToBazarResponsavelDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<BazarProdutoDTO> importarProdutosMassa(ProdutoImportFormDTO form) {
        validarBazarAtivo(form.bazarId());
        BazarPeriodo bp = bazarPeriodoRepository.findById(form.bazarId())
                .orElseThrow(() -> new RegraNegocioException("Bazar não encontrado"));

        List<BazarProdutoDTO> importados = new ArrayList<>();

        for (var item : form.produtos()) {
            BazarProduto produto = new BazarProduto();
            produto.setBazar(bp);
            produto.setTitulo(item.titulo());
            produto.setDescricao(item.descricao());
            produto.setPreco(item.preco());
            produto.setFotoUrl(item.fotoUrl());
            BazarProduto prodSalvo = bazarProdutoRepository.save(produto);

            // Gerar estoque em lote com seriais únicos
            for (int i = 0; i < item.quantidade(); i++) {
                BazarItemEstoque itemEstoque = new BazarItemEstoque();
                // Formato do serial: BAZ-{bazarId}-{produtoId}-{uuidSeq}
                String uuidSeq = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                String serial = "BAZ-" + bp.getId() + "-" + prodSalvo.getId() + "-" + uuidSeq;
                
                itemEstoque.setSerialNumber(serial);
                itemEstoque.setProduto(prodSalvo);
                itemEstoque.setStatusItem("DISPONIVEL");
                itemEstoque.setDataAtualizacao(LocalDateTime.now());
                bazarItemEstoqueRepository.save(itemEstoque);
            }

            importados.add(mapToBazarProdutoDTO(prodSalvo));
        }

        return importados;
    }

    @Transactional(readOnly = true)
    public List<BazarProdutoDTO> pesquisarProdutos(Long bazarId, String nome, String statusItem, BigDecimal precoMin, BigDecimal precoMax) {
        return bazarProdutoRepository.pesquisarProdutos(bazarId, nome, statusItem, precoMin, precoMax)
                .stream()
                .map(this::mapToBazarProdutoDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public BazarVendaDTO confirmarVenda(BazarVendaFormDTO form) {
        validarBazarAtivo(form.bazarId());
        BazarPeriodo bp = bazarPeriodoRepository.findById(form.bazarId())
                .orElseThrow(() -> new RegraNegocioException("Bazar não encontrado"));

        List<BazarItemEstoque> itensVenda = new ArrayList<>();
        BigDecimal totalVenda = BigDecimal.ZERO;

        for (String serial : form.seriais()) {
            BazarItemEstoque item = bazarItemEstoqueRepository.findBySerialNumber(serial)
                    .orElseThrow(() -> new RegraNegocioException("Item de estoque com serial " + serial + " não encontrado."));

            if (!item.getProduto().getBazar().getId().equals(bp.getId())) {
                throw new RegraNegocioException("Item " + serial + " não pertence a este bazar.");
            }

            if (!"DISPONIVEL".equalsIgnoreCase(item.getStatusItem())) {
                throw new RegraNegocioException("Item " + serial + " não está disponível para venda. Status: " + item.getStatusItem());
            }

            itensVenda.add(item);
            totalVenda = totalVenda.add(item.getProduto().getPreco());
        }

        // Criar venda
        BazarVenda venda = new BazarVenda();
        venda.setBazar(bp);
        venda.setValorTotal(totalVenda);
        venda.setFormaPagamento(form.formaPagamento());
        venda.setDataVenda(LocalDateTime.now());
        BazarVenda vendaSalva = bazarVendaRepository.save(venda);

        // Atualizar itens de estoque
        for (BazarItemEstoque item : itensVenda) {
            item.setStatusItem("VENDIDO");
            item.setVendaId(vendaSalva.getId());
            item.setDataAtualizacao(LocalDateTime.now());
            bazarItemEstoqueRepository.save(item);
        }

        return mapToBazarVendaDTO(vendaSalva, form.seriais());
    }

    @Transactional
    public void estornarVenda(Long id) {
        BazarVenda venda = bazarVendaRepository.findById(id)
                .orElseThrow(() -> new RegraNegocioException("Venda não encontrada com ID: " + id));
        
        validarBazarAtivo(venda.getBazar().getId());

        List<BazarItemEstoque> itens = bazarItemEstoqueRepository.findByVendaId(id);
        for (BazarItemEstoque item : itens) {
            item.setStatusItem("DISPONIVEL");
            item.setVendaId(null);
            item.setDataAtualizacao(LocalDateTime.now());
            bazarItemEstoqueRepository.save(item);
        }

        // Deletar o registro agregador da venda
        bazarVendaRepository.delete(venda);
    }

    @Transactional(readOnly = true)
    public BigDecimal obterTotalArrecadado(Long bazarId) {
        return bazarVendaRepository.sumValorTotalByBazarId(bazarId);
    }

    @Transactional(readOnly = true)
    public long obterTotalItensEstoque(Long bazarId) {
        return bazarItemEstoqueRepository.countByProdutoBazarId(bazarId);
    }

    @Transactional(readOnly = true)
    public long obterTotalItensVendidos(Long bazarId) {
        return bazarItemEstoqueRepository.countByProdutoBazarIdAndStatusItem(bazarId, "VENDIDO");
    }

    // Helper mappings
    private BazarPeriodoDTO mapToBazarPeriodoDTO(BazarPeriodo bp) {
        return new BazarPeriodoDTO(bp.getId(), bp.getNomeBazar(), bp.getStatus(), bp.getDataInicio(), bp.getDataFechamento());
    }

    private BazarResponsavelDTO mapToBazarResponsavelDTO(BazarResponsavel br) {
        return new BazarResponsavelDTO(
                br.getId(),
                br.getBazar().getId(),
                br.getMembro().getId(),
                br.getMembro().getNomeCompleto(),
                br.getMembro().getFotoPerfilUrl()
        );
    }

    private BazarProdutoDTO mapToBazarProdutoDTO(BazarProduto bp) {
        long totalEstoque = bazarItemEstoqueRepository.countByProdutoId(bp.getId());
        long totalVendido = bazarItemEstoqueRepository.findByProdutoIdAndStatusItem(bp.getId(), "VENDIDO").size();
        return new BazarProdutoDTO(
                bp.getId(),
                bp.getBazar().getId(),
                bp.getTitulo(),
                bp.getDescricao(),
                bp.getPreco(),
                bp.getFotoUrl(),
                totalEstoque,
                totalVendido
        );
    }

    @Transactional(readOnly = true)
    public String obterSerialDisponivel(Long produtoId) {
        List<BazarItemEstoque> disponiveis = bazarItemEstoqueRepository.findByProdutoIdAndStatusItem(produtoId, "DISPONIVEL");
        if (disponiveis.isEmpty()) {
            throw new RegraNegocioException("Não há itens em estoque disponíveis para este produto.");
        }
        return disponiveis.get(0).getSerialNumber();
    }

    private BazarVendaDTO mapToBazarVendaDTO(BazarVenda bv, List<String> seriais) {
        return new BazarVendaDTO(
                bv.getId(),
                bv.getBazar().getId(),
                bv.getValorTotal(),
                bv.getFormaPagamento(),
                bv.getDataVenda(),
                seriais
        );
    }
}
