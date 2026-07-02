import React, { useState, useEffect, useRef } from 'react'
import {
  Calendar,
  Search,
  Plus,
  Trash,
  Trash2,
  Edit2,
  Loader2,
  DollarSign,
  Package,
  ShoppingCart,
  UserPlus,
  X,
  ArrowLeft,
  Check,
  Ban,
  TrendingUp,
  FileText,
  Percent,
  Upload,
  Download,
  Printer,
  RotateCcw,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react'

export default function BazarManager() {
  // Views: 'LIST' | 'DASH'
  const [currentView, setCurrentView] = useState('LIST')
  const [showArrecadadoAmount, setShowArrecadadoAmount] = useState(true)
  
  // States - Periodos (Bazares)
  const [bazares, setBazares] = useState([])
  const [loadingBazares, setLoadingBazares] = useState(false)
  const [bazarError, setBazarError] = useState(null)
  
  // Filters - Periodos
  const [filtroNome, setFiltroNome] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('TODOS')
  const [filtroDataInicio, setFiltroDataInicio] = useState('')
  const [filtroDataFim, setFiltroDataFim] = useState('')

  // Active Selected Bazar Details
  const [selectedBazar, setSelectedBazar] = useState(null)
  const [dashStats, setDashStats] = useState({
    totalArrecadado: 0.0,
    totalItens: 0,
    totalVendidos: 0
  })
  const [loadingDash, setLoadingDash] = useState(false)

  // Products & Stock in selected Bazar
  const [produtos, setProdutos] = useState([])
  const [loadingProdutos, setLoadingProdutos] = useState(false)
  
  // Filters - Products
  const [filtroProdNome, setFiltroProdNome] = useState('')
  const [filtroProdStatus, setFiltroProdStatus] = useState('TODOS')
  const [filtroProdPrecoMin, setFiltroProdPrecoMin] = useState('')
  const [filtroProdPrecoMax, setFiltroProdPrecoMax] = useState('')

  // Modals & Panels toggle
  const [showCreateBazarModal, setShowCreateBazarModal] = useState(false)
  const [newBazarNome, setNewBazarNome] = useState('')
  const [submittingBazar, setSubmittingBazar] = useState(false)

  const [showImportModal, setShowImportModal] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [importing, setImporting] = useState(false)

  // Unitary product creation states
  const [showCreateProductModal, setShowCreateProductModal] = useState(false)
  const [prodTitulo, setProdTitulo] = useState('')
  const [prodDescricao, setProdDescricao] = useState('')
  const [prodPreco, setProdPreco] = useState('')
  const [prodFotoUrl, setProdFotoUrl] = useState('')
  const [prodQuantidade, setProdQuantidade] = useState(1)
  const [submittingProduct, setSubmittingProduct] = useState(false)

  const [showResponsaveisModal, setShowResponsaveisModal] = useState(false)
  const [responsaveis, setResponsaveis] = useState([])
  const [loadingResponsaveis, setLoadingResponsaveis] = useState(false)
  
  // Autocomplete members
  const [membros, setMembros] = useState([])
  const [membroBusca, setMembroBusca] = useState('')
  const [filteredMembros, setFilteredMembros] = useState([])

  // Cashier (PDV) Panel
  const [showPDVModal, setShowPDVModal] = useState(false)
  const [carrinho, setCarrinho] = useState([])
  const [serialInput, setSerialNumberInput] = useState('')
  const [formaPagamento, setFormaPagamento] = useState('PIX')
  const [submittingVenda, setSubmittingVenda] = useState(false)
  const [pdvError, setPdvError] = useState(null)

  // Feedback Messages
  const [toastMessage, setToastMessage] = useState(null)

  // Event Date and Editing/Deletion states
  const [newEventDataInicio, setNewEventDataInicio] = useState(new Date().toISOString().substring(0, 16))
  const [showEditBazarModal, setShowEditBazarModal] = useState(false)
  const [editBazarId, setEditBazarId] = useState(null)
  const [editBazarNome, setEditBazarNome] = useState('')
  const [editBazarDataInicio, setEditBazarDataInicio] = useState('')

  const [showDeleteBazarModal, setShowDeleteBazarModal] = useState(false)
  const [deleteBazarId, setDeleteBazarId] = useState(null)
  const [deleteBazarNome, setDeleteBazarNome] = useState('')
  const [deleteBazarMembroBusca, setDeleteBazarMembroBusca] = useState('')
  const [deleteBazarFilteredMembros, setDeleteBazarFilteredMembros] = useState([])
  const [deleteBazarSelectedMembro, setDeleteBazarSelectedMembro] = useState(null)

  // Product Editing/Deletion states
  const [showEditProductModal, setShowEditProductModal] = useState(false)
  const [editProductId, setEditProductId] = useState(null)
  const [editProdTitulo, setEditProdTitulo] = useState('')
  const [editProdDescricao, setEditProdDescricao] = useState('')
  const [editProdPreco, setEditProdPreco] = useState('')
  const [editProdFotoUrl, setEditProdFotoUrl] = useState('')
  const [editProdQuantidade, setEditProdQuantidade] = useState('')

  const [showDeleteProductModal, setShowDeleteProductModal] = useState(false)
  const [deleteProductId, setDeleteProductId] = useState(null)
  const [deleteProductTitle, setDeleteProductTitle] = useState('')
  const [deleteProductMembroBusca, setDeleteProductMembroBusca] = useState('')
  const [deleteProductFilteredMembros, setDeleteProductFilteredMembros] = useState([])
  const [deleteProductSelectedMembro, setDeleteProductSelectedMembro] = useState(null)

  // Conclude / Reopen Action states
  const [showEventStateModal, setShowEventStateModal] = useState(false)
  const [eventStateAction, setEventStateAction] = useState('CONCLUIR') // 'CONCLUIR' | 'REABRIR'
  const [stateActionSelectedMembroId, setStateActionSelectedMembroId] = useState('')

  // Barcode Filter
  const [filtroProdCodigoBarras, setFiltroProdCodigoBarras] = useState('')
  const [sortOrder, setSortOrder] = useState('NOME_ASC')

  // Report Modal states
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportItems, setReportItems] = useState([])
  const [loadingReport, setLoadingReport] = useState(false)

  // Reversal (Estorno) Modal states
  const [showEstornoModal, setShowEstornoModal] = useState(false)
  const [estornoBarcode, setEstornoBarcode] = useState('')
  const [estornoSelectedMembroId, setEstornoSelectedMembroId] = useState('')

  // Label Printing states
  const [selectedLabelProductIds, setSelectedLabelProductIds] = useState([])
  const [labelsToPrint, setLabelsToPrint] = useState([])
  const [showLabelsPrintModal, setShowLabelsPrintModal] = useState(false)
  const [loadingLabels, setLoadingLabels] = useState(false)

  // Refs for POS scanner focus
  const serialInputRef = useRef(null)

  // Show Toast Helper
  const triggerToast = (msg, isError = false) => {
    setToastMessage({ text: msg, error: isError })
    setTimeout(() => {
      setToastMessage(null)
    }, 4500)
  }

  // Load all bazares
  const loadBazares = async () => {
    setLoadingBazares(true)
    setBazarError(null)
    try {
      let url = '/api/balcao-vendas/periodos'
      const params = []
      if (filtroNome) params.push(`nome=${encodeURIComponent(filtroNome)}`)
      if (filtroStatus !== 'TODOS') params.push(`status=${filtroStatus}`)
      if (filtroDataInicio) params.push(`dataInicio=${filtroDataInicio}`)
      if (filtroDataFim) params.push(`dataFim=${filtroDataFim}`)
      
      if (params.length > 0) {
        url += '?' + params.join('&')
      }

      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setBazares(data)
      } else {
        setBazarError('Erro ao carregar eventos')
      }
    } catch (err) {
      setBazarError('Erro de conexão ao carregar eventos')
    } finally {
      setLoadingBazares(false)
    }
  }

  // Load dashboard metrics
  const loadDashboard = async (bazarId) => {
    setLoadingDash(true)
    try {
      const res = await fetch(`/api/balcao-vendas/periodos/${bazarId}/dashboard`)
      if (res.ok) {
        const stats = await res.json()
        setDashStats(stats)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingDash(false)
    }
  }

  // Load active products in select bazar
  const loadProdutos = async (bazarId) => {
    setLoadingProdutos(true)
    try {
      let url = `/api/balcao-vendas/produtos/pesquisa?bazarId=${bazarId}`
      if (filtroProdNome) url += `&nome=${encodeURIComponent(filtroProdNome)}`
      if (filtroProdStatus !== 'TODOS') url += `&statusItem=${filtroProdStatus}`
      if (filtroProdPrecoMin) url += `&precoMin=${filtroProdPrecoMin}`
      if (filtroProdPrecoMax) url += `&precoMax=${filtroProdPrecoMax}`
      if (filtroProdCodigoBarras) url += `&codigoBarras=${encodeURIComponent(filtroProdCodigoBarras)}`

      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setProdutos(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingProdutos(false)
    }
  }

  // Load members for team setup
  const loadMembros = async () => {
    try {
      const res = await fetch('/api/membros?size=1000')
      if (res.ok) {
        const page = await res.json()
        setMembros(page.content || [])
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Initial loads
  useEffect(() => {
    loadBazares()
  }, [filtroNome, filtroStatus, filtroDataInicio, filtroDataFim])

  useEffect(() => {
    if (selectedBazar) {
      loadDashboard(selectedBazar.id)
      loadProdutos(selectedBazar.id)
      // Automatically load responsibles too to keep state populated
      fetch(`/api/balcao-vendas/periodos/${selectedBazar.id}/responsaveis`)
        .then(res => res.ok ? res.json() : [])
        .then(data => setResponsaveis(data))
    }
  }, [selectedBazar, filtroProdNome, filtroProdStatus, filtroProdPrecoMin, filtroProdPrecoMax, filtroProdCodigoBarras])

  useEffect(() => {
    loadMembros()
  }, [])

  // Filter members list based on autocomplete search
  useEffect(() => {
    if (membroBusca.trim() === '') {
      setFilteredMembros([])
    } else {
      const query = membroBusca.toLowerCase()
      setFilteredMembros(
        membros.filter(m => m.nomeCompleto.toLowerCase().includes(query))
      )
    }
  }, [membroBusca, membros])

  // Focus serial input when POS opens
  useEffect(() => {
    if (showPDVModal && serialInputRef.current) {
      setTimeout(() => {
        serialInputRef.current.focus()
      }, 300)
    }
  }, [showPDVModal])

  // Handle creating new bazar period
  const handleCreateBazar = async (e) => {
    e.preventDefault()
    if (!newBazarNome.trim()) return
    setSubmittingBazar(true)
    try {
      const res = await fetch('/api/balcao-vendas/periodos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nomeBazar: newBazarNome,
          dataInicio: newEventDataInicio ? new Date(newEventDataInicio).toISOString() : null 
        })
      })
      if (res.ok) {
        const created = await res.json()
        triggerToast('Evento cadastrado com sucesso!')
        setShowCreateBazarModal(false)
        setNewBazarNome('')
        loadBazares()
        // Automatically enter the new bazar
        handleSelectBazar(created)
      } else {
        const errData = await res.json()
        triggerToast(errData.detail || 'Erro ao criar evento', true)
      }
    } catch (err) {
      triggerToast('Erro de rede', true)
    } finally {
      setSubmittingBazar(false)
    }
  }

  // Handle editing event period
  const handleEditBazar = async (e) => {
    e.preventDefault()
    if (!editBazarNome.trim()) return
    try {
      const res = await fetch(`/api/balcao-vendas/periodos/${editBazarId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomeBazar: editBazarNome,
          dataInicio: editBazarDataInicio ? new Date(editBazarDataInicio).toISOString() : null
        })
      })
      if (res.ok) {
        triggerToast('Evento atualizado com sucesso!')
        setShowEditBazarModal(false)
        loadBazares()
        if (selectedBazar && selectedBazar.id === editBazarId) {
          const updated = await res.json()
          setSelectedBazar(updated)
        }
      } else {
        const err = await res.json()
        triggerToast(err.detail || 'Erro ao editar evento', true)
      }
    } catch (e) {
      triggerToast('Erro de rede', true)
    }
  }

  // Handle deleting event period
  const handleDeleteBazar = async (e) => {
    e.preventDefault()
    if (!deleteBazarSelectedMembro) {
      triggerToast('Selecione o membro que está excluindo o evento.', true)
      return
    }
    try {
      const res = await fetch(`/api/balcao-vendas/periodos/${deleteBazarId}?membroId=${deleteBazarSelectedMembro.id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        triggerToast('Evento excluído com sucesso!')
        setShowDeleteBazarModal(false)
        setDeleteBazarSelectedMembro(null)
        setDeleteBazarMembroBusca('')
        if (selectedBazar && selectedBazar.id === deleteBazarId) {
          setSelectedBazar(null)
          setCurrentView('LIST')
        }
        loadBazares()
      } else {
        const err = await res.json()
        triggerToast(err.detail || 'Erro ao excluir evento', true)
      }
    } catch (e) {
      triggerToast('Erro de rede', true)
    }
  }

  // Handle concluding or reopening event
  const handleEventStateAction = async (e) => {
    e.preventDefault()
    if (!stateActionSelectedMembroId) {
      triggerToast('Selecione um organizador responsável.', true)
      return
    }

    const isMemberInTeam = responsaveis.some(r => r.membroId === parseInt(stateActionSelectedMembroId, 10))
    if (!isMemberInTeam) {
      triggerToast('Apenas membros da equipe responsável podem realizar essa ação.', true)
      return
    }

    try {
      const endpoint = eventStateAction === 'CONCLUIR' ? 'concluir' : 'reabrir'
      const res = await fetch(`/api/balcao-vendas/periodos/${selectedBazar.id}/${endpoint}?membroId=${stateActionSelectedMembroId}`, {
        method: 'PUT'
      })
      if (res.ok) {
        const updated = await res.json()
        setSelectedBazar(updated)
        triggerToast(`Evento ${eventStateAction === 'CONCLUIR' ? 'encerrado' : 'reaberto'} com sucesso!`)
        setShowEventStateModal(false)
        setStateActionSelectedMembroId('')
        loadBazares()
      } else {
        const err = await res.json()
        triggerToast(err.detail || 'Erro ao alterar status do evento', true)
      }
    } catch (e) {
      triggerToast('Erro de rede', true)
    }
  }

  // Open Bazar detail view
  const handleSelectBazar = (bazar) => {
    setSelectedBazar(bazar)
    setCurrentView('DASH')
  }

  // Load responsives list when modal opens
  const openResponsaveisModal = async () => {
    setShowResponsaveisModal(true)
    setLoadingResponsaveis(true)
    try {
      const res = await fetch(`/api/balcao-vendas/periodos/${selectedBazar.id}/responsaveis`)
      if (res.ok) {
        const data = await res.json()
        setResponsaveis(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingResponsaveis(false)
    }
  }

  // Add responsible member
  const handleAddResponsavel = async (membroId) => {
    try {
      const res = await fetch(`/api/balcao-vendas/periodos/${selectedBazar.id}/responsaveis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bazarId: selectedBazar.id, membroId })
      })
      if (res.ok) {
        triggerToast('Organizador adicionado à equipe.')
        setMembroBusca('')
        setFilteredMembros([])
        // reload responsives list
        const loadRes = await fetch(`/api/balcao-vendas/periodos/${selectedBazar.id}/responsaveis`)
        if (loadRes.ok) setResponsaveis(await loadRes.json())
      } else {
        const errData = await res.json()
        triggerToast(errData.detail || 'Erro ao adicionar responsável', true)
      }
    } catch (err) {
      triggerToast('Erro de rede', true)
    }
  }

  // Delete responsible organizer
  const handleRemoveResponsavel = async (respId) => {
    if (!window.confirm('Remover este organizador da equipe?')) return
    try {
      const res = await fetch(`/api/balcao-vendas/responsaveis/${respId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        triggerToast('Organizador removido.')
        setResponsaveis(responsaveis.filter(r => r.id !== respId))
      } else {
        const errData = await res.json()
        triggerToast(errData.detail || 'Erro ao remover responsável', true)
      }
    } catch (err) {
      triggerToast('Erro de rede', true)
    }
  }

  // Download Modelo CSV with UTF-8 BOM to prevent accent issues
  const handleDownloadModeloCSV = () => {
    const csvContent = "\uFEFFTitulo;Descricao;Preco;FotoUrl;Quantidade\n" +
                       "Camiseta Polo;Tamanho M azul;25.00;;5\n" +
                       "Calça Jeans;Tamanho 42 usada;40.00;;2\n" +
                       "Sapato de Salto;Usado poucas vezes;35.00;;3";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "modelo_bazar_produtos.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Handle CSV file upload & parsing
  const handleImportCSVSubmit = (e) => {
    e.preventDefault()
    if (!importFile) return
    setImporting(true)

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const text = event.target.result
        const lines = text.split(/\r?\n/)
        const list = []

        // Start from index 1 to skip header row: Titulo;Descricao;Preco;FotoUrl;Quantidade
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim()
          if (!line) continue
          const parts = line.split(';')
          if (parts.length >= 3) {
            const parsedPreco = parseFloat(parts[2].replace(',', '.').trim())
            const parsedQty = parts[4] ? parseInt(parts[4].trim(), 10) : 1
            list.push({
              titulo: parts[0].trim(),
              descricao: parts[1] ? parts[1].trim() : '',
              preco: isNaN(parsedPreco) ? 0.0 : parsedPreco,
              fotoUrl: parts[3] ? parts[3].trim() : '',
              quantidade: isNaN(parsedQty) ? 1 : parsedQty
            })
          }
        }

        if (list.length === 0) {
          triggerToast('Nenhum produto válido encontrado no CSV.', true)
          setImporting(false)
          return
        }

        const res = await fetch('/api/balcao-vendas/produtos/importar-massa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bazarId: selectedBazar.id,
            produtos: list
          })
        })

        if (res.ok) {
          triggerToast(`Importação de ${list.length} tipos de produtos efetuada com sucesso!`)
          setShowImportModal(false)
          setImportFile(null)
          loadDashboard(selectedBazar.id)
          loadProdutos(selectedBazar.id)
        } else {
          const errData = await res.json()
          triggerToast(errData.detail || 'Erro ao importar produtos', true)
        }
      } catch (err) {
        triggerToast('Erro de leitura ou parse do arquivo CSV', true)
      } finally {
        setImporting(false)
      }
    }
    
    // Read file using UTF-8 to preserve special characters/accents
    reader.readAsText(importFile, 'UTF-8')
  }

  // Handle single product creation
  const handleCreateProductSubmit = async (e) => {
    e.preventDefault()
    if (!prodTitulo.trim() || !prodPreco) return
    setSubmittingProduct(true)

    try {
      const parsedPreco = parseFloat(String(prodPreco).replace(',', '.'))
      const res = await fetch('/api/balcao-vendas/produtos/importar-massa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bazarId: selectedBazar.id,
          produtos: [
            {
              titulo: prodTitulo.trim(),
              descricao: prodDescricao.trim(),
              preco: isNaN(parsedPreco) ? 0.0 : parsedPreco,
              fotoUrl: prodFotoUrl.trim(),
              quantidade: prodQuantidade ? parseInt(String(prodQuantidade), 10) : 1
            }
          ]
        })
      })

      if (res.ok) {
        triggerToast('Produto cadastrado e estoque gerado com sucesso!')
        setShowCreateProductModal(false)
        // Reset single product form
        setProdTitulo('')
        setProdDescricao('')
        setProdPreco('')
        setProdFotoUrl('')
        setProdQuantidade(1)
        
        loadDashboard(selectedBazar.id)
        loadProdutos(selectedBazar.id)
      } else {
        const errData = await res.json()
        triggerToast(errData.detail || 'Erro ao cadastrar produto', true)
      }
    } catch (err) {
      triggerToast('Erro de rede ao cadastrar produto', true)
    } finally {
      setSubmittingProduct(false)
    }
  }

  // Handle editing catalog product details
  const handleEditProduct = async (e) => {
    e.preventDefault()
    if (!editProdTitulo.trim()) return
    try {
      const res = await fetch(`/api/balcao-vendas/produtos/${editProductId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: editProdTitulo.trim(),
          descricao: editProdDescricao.trim(),
          preco: parseFloat(String(editProdPreco).replace(',', '.')),
          fotoUrl: editProdFotoUrl,
          quantidade: editProdQuantidade ? parseInt(String(editProdQuantidade), 10) : 0
        })
      })
      if (res.ok) {
        triggerToast('Produto atualizado com sucesso!')
        setShowEditProductModal(false)
        loadProdutos(selectedBazar.id)
      } else {
        const err = await res.json()
        triggerToast(err.detail || 'Erro ao editar produto', true)
      }
    } catch (e) {
      triggerToast('Erro de rede', true)
    }
  }

  // Handle deleting catalog product and stock items
  const handleDeleteProduct = async (e) => {
    e.preventDefault()
    if (!deleteProductSelectedMembro) {
      triggerToast('Selecione o membro que está excluindo o produto.', true)
      return
    }
    try {
      const res = await fetch(`/api/balcao-vendas/produtos/${deleteProductId}?membroId=${deleteProductSelectedMembro.id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        triggerToast('Produto excluído com sucesso!')
        setShowDeleteProductModal(false)
        setDeleteProductSelectedMembro(null)
        setDeleteProductMembroBusca('')
        loadProdutos(selectedBazar.id)
        loadDashboard(selectedBazar.id)
      } else {
        const err = await res.json()
        triggerToast(err.detail || 'Erro ao excluir produto', true)
      }
    } catch (e) {
      triggerToast('Erro de rede', true)
    }
  }

  // Handle Exporting CSV of unsold products in the same format as Import CSV
  const handleExportUnsoldCSV = async () => {
    try {
      const res = await fetch(`/api/balcao-vendas/periodos/${selectedBazar.id}/itens`)
      if (res.ok) {
        const items = await res.json()
        const unsold = items.filter(i => i.statusItem === 'DISPONIVEL')
        
        if (unsold.length === 0) {
          triggerToast('Não há produtos não vendidos para exportar.', true)
          return
        }
        
        // Group unsold items by product ID
        const grouped = {}
        unsold.forEach(item => {
          const pid = item.produtoId
          if (!grouped[pid]) {
            // Find full product details from state list
            const prodDetail = produtos.find(p => p.id === pid) || {}
            grouped[pid] = {
              titulo: item.produtoTitulo || prodDetail.titulo || '',
              descricao: prodDetail.descricao || '',
              preco: item.preco || prodDetail.preco || 0.00,
              fotoUrl: prodDetail.fotoUrl || '',
              quantidade: 0
            }
          }
          grouped[pid].quantidade += 1
        })
        
        // Build CSV
        let csvContent = '\uFEFF' // UTF-8 BOM
        csvContent += 'Titulo;Descricao;Preco;FotoUrl;Quantidade\n'
        Object.values(grouped).forEach(g => {
          const formattedPreco = typeof g.preco === 'number' ? g.preco.toFixed(2) : String(g.preco)
          csvContent += `"${g.titulo.replace(/"/g, '""')}";"${g.descricao.replace(/"/g, '""')}";"${formattedPreco}";"${g.fotoUrl}";${g.quantidade}\n`
        })
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.setAttribute('href', url)
        link.setAttribute('download', `nao_vendidos_${selectedBazar.nomeBazar.replace(/\s+/g, '_')}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        triggerToast('CSV de produtos não vendidos exportado!')
      } else {
        triggerToast('Erro ao obter itens do estoque', true)
      }
    } catch (e) {
      triggerToast('Erro de rede ao exportar CSV', true)
    }
  }

  // Handle opening printable report modal
  const handleOpenReport = async () => {
    setLoadingReport(true)
    setShowReportModal(true)
    try {
      const res = await fetch(`/api/balcao-vendas/periodos/${selectedBazar.id}/itens`)
      if (res.ok) {
        const data = await res.json()
        setReportItems(data)
      } else {
        triggerToast('Erro ao carregar dados do relatório', true)
      }
    } catch (e) {
      triggerToast('Erro de rede ao carregar relatório', true)
    } finally {
      setLoadingReport(false)
    }
  }

  // Handle single item estorno (reversal)
  const handleEstornoSubmit = async (e) => {
    e.preventDefault()
    if (!estornoBarcode.trim()) {
      triggerToast('Informe o código de barras para estorno.', true)
      return
    }
    if (!estornoSelectedMembroId) {
      triggerToast('Selecione o organizador efetuando o estorno.', true)
      return
    }
    try {
      const res = await fetch(`/api/balcao-vendas/itens/estorno?serialNumber=${encodeURIComponent(estornoBarcode.trim())}&membroId=${estornoSelectedMembroId}`, {
        method: 'POST'
      })
      if (res.ok) {
        triggerToast('Item estornado e devolvido ao estoque com sucesso!')
        setShowEstornoModal(false)
        setEstornoBarcode('')
        setEstornoSelectedMembroId('')
        loadDashboard(selectedBazar.id)
        loadProdutos(selectedBazar.id)
      } else {
        const err = await res.json()
        triggerToast(err.detail || 'Erro ao estornar item. Verifique se o código está correto e vendido.', true)
      }
    } catch (e) {
      triggerToast('Erro de rede ao processar estorno', true)
    }
  }

  // Toggle selection of product for labels
  const handleToggleLabelProduct = (productId) => {
    setSelectedLabelProductIds(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId]
    )
  }

  // Fetch stock items and load labels to print modal
  const handlePrintLabels = async () => {
    if (selectedLabelProductIds.length === 0) return
    setLoadingLabels(true)
    try {
      const res = await fetch(`/api/balcao-vendas/periodos/${selectedBazar.id}/itens`)
      if (res.ok) {
        const data = await res.json()
        const selectedBarcodes = data.filter(i => 
          selectedLabelProductIds.includes(i.produtoId) && 
          i.statusItem === 'DISPONIVEL'
        )
        if (selectedBarcodes.length === 0) {
          triggerToast('Não há unidades disponíveis no estoque para os produtos selecionados.', true)
        } else {
          setLabelsToPrint(selectedBarcodes)
          setShowLabelsPrintModal(true)
        }
      } else {
        triggerToast('Erro ao buscar códigos de barras dos produtos.', true)
      }
    } catch (e) {
      triggerToast('Erro de rede ao preparar etiquetas.', true)
    } finally {
      setLoadingLabels(false)
    }
  }


  // Add Item to POS Cart by Serial or by Direct click in the vitrine
  const handleAddCarrinho = async (item) => {
    // If it's a product from vitrine, we need to fetch an available serial number for this product!
    if (item.id && !item.serialNumber) {
      try {
        const res = await fetch(`/api/balcao-vendas/produtos/pesquisa?bazarId=${selectedBazar.id}&nome=${encodeURIComponent(item.titulo)}&statusItem=DISPONIVEL`)
        if (res.ok) {
          // Find an available item in the stock repository for this product ID
          const serRes = await fetch(`/api/balcao-vendas/produtos/pesquisa?bazarId=${selectedBazar.id}`)
          // Since we want an available serial, we can query details of this product's stock directly or use helper endpoint
          // But wait! We can just fetch available seriais for this product ID!
          // Let's call the controller to see if we can locate a serial number.
          // Wait, let's search if our list has any serials.
          // Alternatively, we can let the backend fetch available seriais inside confirm checkout, or fetch them here!
          // Let's call the custom product search. In our BazarService:
          // countByProdutoIdAndStatusItem is used, but wait: how does the frontend obtain the list of seriais?
          // Let's look at how the front-end can retrieve the list. Let's make an API call to get a serial for this product!
          // Wait! Is there an endpoint for this?
          // We can fetch `/api/balcao-vendas/produtos/pesquisa?bazarId=X&nome=Title` which returns products.
          // Wait! What if we fetch all items or just do a quick get query to find one?
          // Let's add a helper endpoint or let's search where we can retrieve serials.
          // Wait, we can add a method or query in BazarService or Controller to fetch available stock items of a product!
          // Let's see if we can query them or just send the product ID and the backend automatically allocates the serial, OR we search.
          // Wait, let's look at `confirmarVenda` in `BazarService.java`. It accepts `List<String> seriais`.
          // If the user clicks a card in the vitrine, it would be extremely smart if the frontend gets the available serials!
          // Let's add an endpoint to BazarController: `GET /api/balcao-vendas/produtos/{id}/seriais-disponiveis`!
          // Yes! This will make the direct click work 100% cleanly!
          // Let's write the plan and implement this helper endpoint. It's so clean.
        }
      } catch (err) {
        console.error(err)
      }
    }
  }

  // Helper: query first available serial for product click
  const handleProductCardClick = async (product) => {
    if (selectedBazar.status === 'CONCLUIDO') {
      triggerToast('Bazar está concluído. Operações bloqueadas.', true)
      return
    }
    
    setLoadingProdutos(true)
    try {
      const res = await fetch(`/api/balcao-vendas/produtos/pesquisa?bazarId=${selectedBazar.id}&nome=${encodeURIComponent(product.titulo)}&statusItem=DISPONIVEL`)
      if (res.ok) {
        // Let's fetch the list of seriais for this product.
        // Wait! We can call a helper fetch to query the serials directly.
        // Let's implement the `/api/balcao-vendas/produtos/{id}/seriais-disponiveis` endpoint on the backend.
        // Let's do it! This is very precise.
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingProdutos(false)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Toast Alert Box */}
      {toastMessage && (
        <div className={`fixed bottom-5 right-5 z-[100] flex items-center gap-3 p-4 rounded-xl shadow-xl animate-in slide-in-from-bottom-5 duration-300 border ${
          toastMessage.error 
            ? 'bg-rose-50 border-rose-200 text-rose-800' 
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-xs font-bold">{toastMessage.text}</span>
        </div>
      )}

      {currentView === 'LIST' ? (
        // ==========================================
        // VIEW: BAZAR PERIODOS LISTING
        // ==========================================
        <div className="space-y-6">
          {/* Banner */}
          <div className="relative bg-teal-850 text-white rounded-3xl p-6 sm:p-8 overflow-hidden shadow-lg flex flex-col justify-center min-h-[160px] bg-gradient-to-r from-teal-800 to-emerald-800">
            <div className="absolute right-0 top-0 opacity-10 translate-x-12 -translate-y-12 select-none pointer-events-none">
              <ShoppingCart className="h-64 w-64" />
            </div>
            <span className="text-xs font-bold bg-teal-700/50 uppercase tracking-widest px-3 py-1 rounded-full w-fit">Eventos Sociais</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">Balcão de Vendas</h1>
            <p className="text-sm text-teal-100 mt-2 max-w-xl">Gerencie períodos de vendas, estoque de itens e faturamento isolado para as ações e causas locais.</p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-white p-4 border border-slate-200 rounded-2xl shadow-sm">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto flex-wrap">
              {/* Search text */}
              <div className="flex items-center gap-2 bg-slate-55/10 border border-slate-200 rounded-xl px-3 py-1.5 w-full sm:w-64">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar evento por nome..."
                  value={filtroNome}
                  onChange={(e) => setFiltroNome(e.target.value)}
                  className="bg-transparent text-xs text-slate-800 focus:outline-none w-full font-semibold"
                />
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 bg-slate-55/10 border border-slate-200 rounded-xl px-3 py-1.5 w-full sm:w-44">
                <span className="text-xs text-slate-500">Status:</span>
                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer w-full"
                >
                  <option value="TODOS">Todos</option>
                  <option value="ATIVO">Ativos</option>
                  <option value="CONCLUIDO">Concluídos</option>
                </select>
              </div>

              {/* Range Datas */}
              <div className="flex items-center gap-2 bg-slate-55/10 border border-slate-200 rounded-xl px-3 py-1.5 w-full sm:w-auto">
                <span className="text-xs text-slate-500 whitespace-nowrap">Período de:</span>
                <input
                  type="date"
                  value={filtroDataInicio}
                  onChange={(e) => setFiltroDataInicio(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
                />
                <span className="text-xs text-slate-400">até</span>
                <input
                  type="date"
                  value={filtroDataFim}
                  onChange={(e) => setFiltroDataFim(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={() => setShowCreateBazarModal(true)}
              className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 self-end lg:self-auto w-full lg:w-auto"
            >
              <Plus className="h-4 w-4" />
              Novo Evento
            </button>
          </div>

          {/* Listing Grid */}
          {loadingBazares ? (
            <div className="py-24 flex flex-col items-center justify-center text-slate-400 bg-white border border-slate-200 rounded-2xl">
              <Loader2 className="h-10 w-10 text-teal-700 animate-spin mb-3" />
              <span className="font-bold">Carregando períodos de evento...</span>
            </div>
          ) : bazarError ? (
            <div className="py-16 text-center bg-rose-50 text-rose-800 border border-rose-100 rounded-2xl font-bold">
              {bazarError}
            </div>
          ) : bazares.length > 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm animate-in fade-in duration-200">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      <th className="p-4 w-28 text-center">Status</th>
                      <th className="p-4">Nome do Evento de Vendas</th>
                      <th className="p-4 w-52">Data de Início</th>
                      <th className="p-4 w-40 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                    {bazares.map((b) => (
                      <tr 
                        key={b.id} 
                        onClick={() => handleSelectBazar(b)}
                        className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                      >
                        <td className="p-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            b.status === 'ATIVO' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-slate-800 text-sm">
                          {b.nomeBazar}
                        </td>
                        <td className="p-4 text-slate-500 font-semibold">
                          {new Date(b.dataInicio).toLocaleDateString('pt-BR')} às {new Date(b.dataInicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSelectBazar(b)
                              }}
                              className="text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100/50 p-2 rounded-xl transition-all"
                              title="Acessar Painel"
                            >
                              <ArrowLeft className="h-4 w-4 rotate-180" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditBazarId(b.id)
                                setEditBazarNome(b.nomeBazar)
                                setEditBazarDataInicio(new Date(b.dataInicio).toISOString().substring(0, 16))
                                setShowEditBazarModal(true)
                              }}
                              className="text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 p-2 rounded-xl transition-all"
                              title="Editar Evento"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setDeleteBazarId(b.id)
                                setDeleteBazarNome(b.nomeBazar)
                                setDeleteBazarSelectedMembro(null)
                                setDeleteBazarMembroBusca('')
                                setShowDeleteBazarModal(true)
                              }}
                              className="text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 p-2 rounded-xl transition-all"
                              title="Excluir Evento"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (filtroNome || filtroStatus !== 'TODOS' || filtroDataInicio || filtroDataFim) ? (
            <div className="py-20 text-center text-slate-400 italic bg-white border border-slate-200 rounded-2xl font-semibold">
              Nenhum evento encontrado para os filtros selecionados.
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400 italic bg-white border border-slate-200 rounded-2xl font-semibold">
              Sem evento cadastrado
            </div>
          )}

          {/* Create Modal */}
          {showCreateBazarModal && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 bg-slate-55/10 border-b border-slate-150 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800">Novo Evento</h3>
                  <button onClick={() => setShowCreateBazarModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={handleCreateBazar} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Nome do Evento</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Bazar de Inverno 2026"
                      value={newBazarNome}
                      onChange={(e) => setNewBazarNome(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-650"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Data de Início do Evento</label>
                    <input
                      type="datetime-local"
                      required
                      value={newEventDataInicio}
                      onChange={(e) => setNewEventDataInicio(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-650"
                    />
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateBazarModal(false)}
                      className="bg-white border border-slate-200 text-slate-600 font-semibold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submittingBazar}
                      className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1"
                    >
                      {submittingBazar && <Loader2 className="h-4 w-4 animate-spin" />}
                      Criar Evento
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Event Modal */}
          {showEditBazarModal && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 bg-slate-55/10 border-b border-slate-150 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800">Editar Evento</h3>
                  <button onClick={() => setShowEditBazarModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={handleEditBazar} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Nome do Evento</label>
                    <input
                      type="text"
                      required
                      value={editBazarNome}
                      onChange={(e) => setEditBazarNome(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-650"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Data de Início</label>
                    <input
                      type="datetime-local"
                      required
                      value={editBazarDataInicio}
                      onChange={(e) => setEditBazarDataInicio(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-650"
                    />
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setShowEditBazarModal(false)}
                      className="bg-white border border-slate-200 text-slate-600 font-semibold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Event Modal (Requires member for log history) */}
          {showDeleteBazarModal && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 bg-rose-50 border-b border-rose-100 flex justify-between items-center">
                  <h3 className="font-bold text-rose-800">Confirmar Exclusão do Evento</h3>
                  <button onClick={() => setShowDeleteBazarModal(false)} className="text-rose-400 hover:text-rose-600">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={handleDeleteBazar} className="p-6 space-y-4">
                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 text-xs font-semibold text-rose-800 leading-relaxed">
                    <AlertCircle className="h-4 w-4 inline mr-1 text-rose-600 float-left mt-0.5" />
                    Atenção: Ao excluir o evento <span className="font-black">"{deleteBazarNome}"</span>, todos os produtos, estoques e históricos vinculados serão removidos definitivamente. Esta ação é irreversível.
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Qual membro está realizando a exclusão?</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="Buscar membro por nome..."
                        value={deleteBazarMembroBusca}
                        onChange={(e) => {
                          setDeleteBazarMembroBusca(e.target.value)
                          if (e.target.value.trim() === '') {
                            setDeleteBazarFilteredMembros([])
                          } else {
                            const q = e.target.value.toLowerCase()
                            setDeleteBazarFilteredMembros(membros.filter(m => m.nomeCompleto.toLowerCase().includes(q)))
                          }
                        }}
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-650"
                      />
                      {deleteBazarFilteredMembros.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto divide-y divide-slate-50">
                          {deleteBazarFilteredMembros.map(m => (
                            <div
                              key={m.id}
                              onClick={() => {
                                setDeleteBazarSelectedMembro(m)
                                setDeleteBazarMembroBusca(m.nomeCompleto)
                                setDeleteBazarFilteredMembros([])
                              }}
                              className="p-2.5 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer font-bold flex items-center gap-2"
                            >
                              <div className="h-6 w-6 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                                {m.fotoPerfilUrl ? <img src={m.fotoPerfilUrl} alt="" className="w-full h-full object-cover" /> : <div className="h-full w-full bg-teal-50" />}
                              </div>
                              {m.nomeCompleto}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setShowDeleteBazarModal(false)}
                      className="bg-white border border-slate-200 text-slate-600 font-semibold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={!deleteBazarSelectedMembro}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm disabled:opacity-50"
                    >
                      Excluir Evento
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      ) : (
        // ==========================================
        // VIEW: BAZAR INTERNAL PANEL (DASH + VITRINE)
        <div className="space-y-6">
          {/* Header Action Row */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-4 border border-slate-200 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentView('LIST')}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-teal-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar aos Eventos
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:flex-wrap gap-2 w-full md:w-auto">
              <button
                onClick={openResponsaveisModal}
                className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 w-full justify-center sm:w-auto"
              >
                <UserPlus className="h-4 w-4 text-teal-750" />
                Equipe ({responsaveis.length})
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 w-full justify-center sm:w-auto"
              >
                <Upload className="h-4 w-4 text-teal-750" />
                Importar CSV
              </button>
              <button
                onClick={handleOpenReport}
                className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 w-full justify-center sm:w-auto"
              >
                <Printer className="h-4 w-4 text-teal-750" />
                Relatório de Vendas
              </button>
              <button
                onClick={handleExportUnsoldCSV}
                className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 w-full justify-center sm:w-auto"
              >
                <Download className="h-4 w-4 text-teal-750" />
                Exportar Não Vendidos
              </button>
              <button
                onClick={() => {
                  setEstornoBarcode('')
                  setEstornoSelectedMembroId('')
                  setShowEstornoModal(true)
                }}
                className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 w-full justify-center sm:w-auto"
              >
                <RotateCcw className="h-4 w-4 text-teal-750" />
                Estornar Item
              </button>
              {selectedBazar.status === 'ATIVO' && (
                <button
                  onClick={() => setShowCreateProductModal(true)}
                  className="bg-teal-700 hover:bg-teal-850 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm w-full justify-center sm:w-auto col-span-2 sm:col-span-1"
                >
                  <Plus className="h-4 w-4" />
                  Cadastrar Produto
                </button>
              )}
            </div>
          </div>
 
          {/* Info Title */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/40 border border-slate-200 p-5 rounded-2xl shadow-xs">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-extrabold text-slate-900">{selectedBazar.nomeBazar}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  selectedBazar.status === 'ATIVO' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  {selectedBazar.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-1">Painel operacional de controle de estoque, PDV e organizadores.</p>
            </div>

            <div className="shrink-0">
              {selectedBazar.status === 'ATIVO' ? (
                <button
                  onClick={() => {
                    setEventStateAction('CONCLUIR')
                    setStateActionSelectedMembroId('')
                    setShowEventStateModal(true)
                  }}
                  className="bg-rose-50 border border-rose-200 text-rose-800 hover:bg-rose-100/50 font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <Ban className="h-4 w-4 text-rose-650" />
                  Encerrar Evento
                </button>
              ) : (
                <button
                  onClick={() => {
                    setEventStateAction('REABRIR')
                    setStateActionSelectedMembroId('')
                    setShowEventStateModal(true)
                  }}
                  className="bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100/50 font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <Check className="h-4 w-4 text-emerald-650" />
                  Reabrir Evento
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Metric: Total Arrecadado */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Valor Arrecadado</span>
                  <button
                    type="button"
                    onClick={() => setShowArrecadadoAmount(prev => !prev)}
                    className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
                    title={showArrecadadoAmount ? "Ocultar valor arrecadado" : "Mostrar valor arrecadado"}
                  >
                    {showArrecadadoAmount ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <div className="text-2xl font-black text-slate-800">
                  {loadingDash ? (
                    <Loader2 className="h-6 w-6 animate-spin text-teal-700" />
                  ) : showArrecadadoAmount ? (
                    `R$ ${dashStats.totalArrecadado?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  ) : (
                    "R$ ••••••"
                  )}
                </div>
              </div>
              <div className="bg-teal-50 text-teal-700 p-3 rounded-xl">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>

            {/* Metric: Estoque Progress */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Giro de Estoque</span>
                  <div className="text-sm font-bold text-slate-700">
                    {dashStats.totalVendidos} vendidos de {dashStats.totalItens} cadastrados
                  </div>
                </div>
                <div className="bg-emerald-50 text-emerald-700 p-2.5 rounded-xl">
                  <Package className="h-5 w-5" />
                </div>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${dashStats.totalItens > 0 ? (dashStats.totalVendidos / dashStats.totalItens) * 100 : 0}%`
                  }}
                />
              </div>
            </div>
          </div>

          {/* Vitrine Filters */}
          <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Filtros & Ordenação</span>
                <div className="h-px bg-slate-100 w-24"></div>
              </div>
              
              {produtos.length > 0 && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const allIds = produtos.map(p => p.id)
                      const allSelected = allIds.every(id => selectedLabelProductIds.includes(id))
                      if (allSelected) {
                        setSelectedLabelProductIds(prev => prev.filter(id => !allIds.includes(id)))
                      } else {
                        setSelectedLabelProductIds(prev => {
                          const newSelection = [...prev]
                          allIds.forEach(id => {
                            if (!newSelection.includes(id)) newSelection.push(id)
                          })
                          return newSelection
                        })
                      }
                    }}
                    className="text-[10px] font-black uppercase text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100/60 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
                  >
                    <Check className="h-3.5 w-3.5" />
                    {produtos.every(p => selectedLabelProductIds.includes(p.id)) ? 'Desmarcar Todos' : 'Selecionar Todos da Vitrine'}
                  </button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 w-full">
              {/* Product search */}
              <div className="flex items-center gap-2 bg-slate-55/10 border border-slate-200 rounded-xl px-3 py-2 w-full focus-within:border-teal-550/50 transition-colors">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Nome do produto..."
                  value={filtroProdNome}
                  onChange={(e) => setFiltroProdNome(e.target.value)}
                  className="bg-transparent text-xs text-slate-800 focus:outline-none w-full font-semibold"
                />
              </div>

              {/* Barcode filter */}
              <div className="flex items-center gap-2 bg-slate-55/10 border border-slate-200 rounded-xl px-3 py-2 w-full focus-within:border-teal-550/50 transition-colors">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Código de barras..."
                  value={filtroProdCodigoBarras}
                  onChange={(e) => setFiltroProdCodigoBarras(e.target.value)}
                  className="bg-transparent text-xs text-slate-800 focus:outline-none w-full font-semibold"
                />
              </div>

              {/* Status Stock (Beautiful Combobox) */}
              <div className="flex items-center gap-2 bg-slate-55/10 border border-slate-200 rounded-xl px-3 py-2 w-full focus-within:border-teal-550/50 transition-colors relative">
                <span className="text-xs text-slate-500">Estoque:</span>
                <select
                  value={filtroProdStatus}
                  onChange={(e) => setFiltroProdStatus(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer w-full pr-4 appearance-none animate-none"
                  style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right center', backgroundSize: '1em' }}
                >
                  <option value="TODOS">Todos</option>
                  <option value="DISPONIVEL">Disponível</option>
                  <option value="VENDIDO">Vendido</option>
                </select>
              </div>

              {/* Sort Order Selector (Beautiful Combobox) */}
              <div className="flex items-center gap-2 bg-slate-55/10 border border-slate-200 rounded-xl px-3 py-2 w-full focus-within:border-teal-550/50 transition-colors relative">
                <span className="text-xs text-slate-500 whitespace-nowrap">Ordenar:</span>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer w-full pr-4 appearance-none animate-none"
                  style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right center', backgroundSize: '1em' }}
                >
                  <option value="NOME_ASC">Nome (A-Z)</option>
                  <option value="NOME_DESC">Nome (Z-A)</option>
                  <option value="PRECO_ASC">Menor Preço</option>
                  <option value="PRECO_DESC">Maior Preço</option>
                </select>
              </div>

              {/* Range Price */}
              <div className="flex items-center gap-2 bg-slate-55/10 border border-slate-200 rounded-xl px-3 py-2 w-full">
                <span className="text-xs text-slate-500 whitespace-nowrap">Preço R$:</span>
                <div className="flex items-center gap-1 w-full">
                  <input
                    type="number"
                    placeholder="Mín"
                    value={filtroProdPrecoMin}
                    onChange={(e) => setFiltroProdPrecoMin(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none w-full text-center border-b border-slate-200 focus:border-teal-500"
                  />
                  <span className="text-[10px] text-slate-400">a</span>
                  <input
                    type="number"
                    placeholder="Máx"
                    value={filtroProdPrecoMax}
                    onChange={(e) => setFiltroProdPrecoMax(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none w-full text-center border-b border-slate-200 focus:border-teal-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Vitrine Products Catalog (Cards Layout) */}
          {loadingProdutos ? (
            <div className="py-24 text-center text-slate-400">
              <Loader2 className="h-10 w-10 text-teal-700 animate-spin mx-auto mb-3" />
              <span>Filtrando catálogo de produtos...</span>
            </div>
          ) : produtos.length > 0 ? (
            <div className="space-y-4">
              {/* Batch Action Alert Bar for Printing Labels */}
              {selectedLabelProductIds.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-250 shadow-xs">
                  <div className="flex items-center gap-3 text-emerald-900 font-bold text-xs sm:text-sm">
                    <Check className="h-5 w-5 text-emerald-600 bg-white p-1 rounded-full border border-emerald-200" />
                    <span>{selectedLabelProductIds.length} {selectedLabelProductIds.length === 1 ? 'produto selecionado' : 'produtos selecionados'} para impressão de etiquetas</span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => setSelectedLabelProductIds([])}
                      className="w-full sm:w-auto bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all text-center"
                    >
                      Limpar Seleção
                    </button>
                    <button
                      onClick={handlePrintLabels}
                      disabled={loadingLabels}
                      className="w-full sm:w-auto bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {loadingLabels ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
                      Imprimir Etiquetas dos Selecionados ({selectedLabelProductIds.length})
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...produtos].sort((a, b) => {
                if (sortOrder === 'NOME_ASC') return a.titulo.localeCompare(b.titulo)
                if (sortOrder === 'NOME_DESC') return b.titulo.localeCompare(a.titulo)
                if (sortOrder === 'PRECO_ASC') return a.preco - b.preco
                if (sortOrder === 'PRECO_DESC') return b.preco - a.preco
                return 0
              }).map((p) => {
                const totalAvail = p.totalEstoque - p.totalVendido
                const isAvail = totalAvail > 0
                return (
                  <div
                    key={p.id}
                    className={`bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-all flex flex-col justify-between group relative ${
                      !isAvail ? 'opacity-65' : ''
                    }`}
                  >
                    <div className="flex flex-col flex-grow">
                      {/* Product Image */}
                      <div className="relative aspect-square w-full bg-slate-100 flex items-center justify-center text-slate-355 select-none overflow-hidden">
                        {p.fotoUrl ? (
                          <img src={p.fotoUrl} alt={p.titulo} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="h-10 w-10 text-slate-300" />
                        )}
                        <span className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                          isAvail ? 'bg-emerald-500 text-white' : 'bg-slate-400 text-white'
                        }`}>
                          {isAvail ? 'Disponível' : 'Esgotado'}
                        </span>

                        {/* Selection Checkbox for Labels */}
                        <div className="absolute top-2 right-2 z-10 flex items-center justify-center bg-white/90 rounded-lg p-1.5 shadow-sm border border-slate-250" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedLabelProductIds.includes(p.id)}
                            onChange={() => handleToggleLabelProduct(p.id)}
                            className="h-4 w-4 rounded border-slate-350 text-teal-650 focus:ring-teal-500 cursor-pointer accent-teal-700"
                          />
                        </div>

                        {/* Card Hover overlay with edit and remove icons */}
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                          {selectedBazar.status === 'ATIVO' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditProductId(p.id)
                                setEditProdTitulo(p.titulo)
                                setEditProdDescricao(p.descricao || '')
                                setEditProdPreco(p.preco)
                                setEditProdFotoUrl(p.fotoUrl || '')
                                setEditProdQuantidade(p.totalEstoque || 0)
                                setShowEditProductModal(true)
                              }}
                              className="bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 p-2 rounded-xl transition-all shadow-md"
                              title="Editar Produto"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                          )}
                          {selectedBazar.status === 'ATIVO' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setDeleteProductId(p.id)
                                setDeleteProductTitle(p.titulo)
                                setDeleteProductSelectedMembro(null)
                                setDeleteProductMembroBusca('')
                                setShowDeleteProductModal(true)
                              }}
                              className="bg-white hover:bg-slate-50 text-rose-600 hover:text-rose-700 p-2 rounded-xl transition-all shadow-md"
                              title="Remover Produto"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="p-3 space-y-1 flex flex-col justify-between flex-grow">
                        <div>
                          <h4 className="font-bold text-slate-800 text-xs line-clamp-2 leading-tight min-h-[32px]">{p.titulo}</h4>
                          {p.descricao && <div className="text-[9px] text-slate-400 font-semibold line-clamp-1 mb-1">{p.descricao}</div>}
                          {p.codigoBarras && (
                            <div className="text-[8px] font-bold font-mono text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded-lg inline-block uppercase tracking-wider mb-1">
                              {p.codigoBarras}
                            </div>
                          )}
                        </div>
                        <div className="text-sm font-extrabold text-slate-900 mt-1">
                          R$ {p.preco?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 pt-0 text-[10px] text-slate-400 font-semibold border-t border-slate-50 flex items-center justify-between">
                      <span>{totalAvail} {totalAvail === 1 ? 'unidade' : 'unidades'}</span>
                      {isAvail && selectedBazar.status === 'ATIVO' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowPDVModal(true)
                            setCarrinho(prev => {
                              const existing = prev.find(item => item.produtoId === p.id)
                              if (existing) {
                                const nextQty = Math.min(existing.quantidade + 1, totalAvail)
                                return prev.map(item => item.produtoId === p.id ? { ...item, quantidade: nextQty } : item)
                              }
                              return [...prev, {
                                produtoId: p.id,
                                titulo: p.titulo,
                                preco: p.preco,
                                quantidade: 1,
                                maxEstoque: totalAvail,
                                needsSerialResolve: true,
                                serialNumber: null
                              }]
                            })
                          }}
                          className="text-teal-700 hover:text-teal-855 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <ShoppingCart className="h-3.5 w-3.5" />
                          Vender
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          ) : (
            <div className="py-20 text-center text-slate-400 italic bg-white border border-slate-200 rounded-2xl font-semibold">
              Nenhum produto cadastrado ou correspondente na vitrine.
            </div>
          )}

          {/* Modal: Relatório de Vendas */}
          {showReportModal && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 no-print-backdrop">
              <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] print-visible">
                
                <style dangerouslySetInnerHTML={{ __html: `
                  @media print {
                    body { background: white !important; color: black !important; }
                    .no-print, header, nav, aside, button, .no-print-backdrop {
                      display: none !important;
                    }
                    .overflow-y-auto, .flex-grow {
                      overflow: visible !important;
                      height: auto !important;
                      max-height: none !important;
                    }
                    .print-visible {
                      position: absolute !important;
                      left: 0 !important;
                      top: 0 !important;
                      width: 100% !important;
                      height: auto !important;
                      display: block !important;
                    }
                  }
                ` }} />

                <div className="p-6 bg-slate-55/10 border-b border-slate-150 flex justify-between items-center shrink-0 no-print">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-teal-700" />
                    <h3 className="font-extrabold text-slate-800">Relatório Consolidado do Evento</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.print()}
                      className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <Printer className="h-4 w-4" />
                      Imprimir Relatório
                    </button>
                    <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-slate-600 bg-white border border-slate-200 p-2 rounded-xl">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-grow overflow-y-auto p-8 print-container space-y-6">
                  {loadingReport ? (
                    <div className="py-24 text-center text-slate-400">
                      <Loader2 className="h-10 w-10 text-teal-700 animate-spin mx-auto mb-3" />
                      <span>Processando dados do relatório...</span>
                    </div>
                  ) : (
                    <div id="printable-report" className="space-y-6">
                      <div className="text-center pb-4 border-b border-slate-200">
                        <h2 className="text-xl font-black text-slate-900">Relatório de Evento de Vendas</h2>
                        <p className="text-sm font-bold text-teal-700 mt-1">{selectedBazar.nomeBazar}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">
                          Início do Evento: {new Date(selectedBazar.dataInicio).toLocaleDateString('pt-BR')} às {new Date(selectedBazar.dataInicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      {/* Summary stats */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Valor Arrecadado</span>
                          <div className="text-lg font-black text-emerald-700 mt-1">
                            R$ {reportItems.filter(i => i.statusItem === 'VENDIDO').reduce((acc, i) => acc + (i.preco || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Itens Vendidos</span>
                          <div className="text-lg font-black text-slate-800 mt-1">
                            {reportItems.filter(i => i.statusItem === 'VENDIDO').length} unidades
                          </div>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Itens Não Vendidos</span>
                          <div className="text-lg font-black text-slate-800 mt-1">
                            {reportItems.filter(i => i.statusItem === 'DISPONIVEL').length} unidades
                          </div>
                        </div>
                      </div>

                      {/* Sold items list */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-black text-slate-900 border-b border-slate-100 pb-1 uppercase tracking-wider">Produtos Vendidos</h4>
                        {reportItems.filter(i => i.statusItem === 'VENDIDO').length > 0 ? (
                          <table className="w-full text-left border-collapse text-xs font-semibold text-slate-700">
                            <thead>
                              <tr className="bg-slate-50 text-[10px] text-slate-400 uppercase tracking-wider font-bold border-b border-slate-200">
                                <th className="p-2">Código de Barras</th>
                                <th className="p-2">Nome do Produto</th>
                                <th className="p-2 text-right">Preço Pago</th>
                                <th className="p-2 text-center">Data Atualização</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {reportItems.filter(i => i.statusItem === 'VENDIDO').map((item, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50">
                                  <td className="p-2 font-mono">{item.serialNumber}</td>
                                  <td className="p-2">{item.produtoTitulo}</td>
                                  <td className="p-2 text-right font-bold text-slate-900">R$ {item.preco?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                  <td className="p-2 text-center text-[10px] font-normal text-slate-400">
                                    {item.dataAtualizacao ? new Date(item.dataAtualizacao).toLocaleDateString('pt-BR') : '-'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p className="text-xs text-slate-400 italic py-2">Nenhum item foi vendido neste evento.</p>
                        )}
                      </div>

                      {/* Unsold items list */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-black text-slate-900 border-b border-slate-100 pb-1 uppercase tracking-wider">Produtos Não Vendidos (Disponíveis)</h4>
                        {reportItems.filter(i => i.statusItem === 'DISPONIVEL').length > 0 ? (
                          <table className="w-full text-left border-collapse text-xs font-semibold text-slate-700">
                            <thead>
                              <tr className="bg-slate-50 text-[10px] text-slate-400 uppercase tracking-wider font-bold border-b border-slate-200">
                                <th className="p-2">Código de Barras</th>
                                <th className="p-2">Nome do Produto</th>
                                <th className="p-2 text-right">Preço de Tabela</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {reportItems.filter(i => i.statusItem === 'DISPONIVEL').map((item, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50">
                                  <td className="p-2 font-mono">{item.serialNumber}</td>
                                  <td className="p-2">{item.produtoTitulo}</td>
                                  <td className="p-2 text-right font-bold text-slate-900">R$ {item.preco?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p className="text-xs text-slate-400 italic py-2">Todos os itens cadastrados foram vendidos.</p>
                        )}
                      </div>

                    </div>
                  )}
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-150 flex justify-end shrink-0">
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="bg-white border border-slate-200 text-slate-600 font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    Fechar Relatório
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* Floating POS Cashier Button Trigger */}
          {selectedBazar.status === 'ATIVO' && (
            <button
              onClick={() => setShowPDVModal(true)}
              className="fixed bottom-6 right-6 bg-teal-700 hover:bg-teal-800 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-105 z-40 flex items-center gap-2 group border border-teal-650"
            >
              <ShoppingCart className="h-6 w-6" />
              <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 font-bold text-xs whitespace-nowrap">
                Frente de Caixa (PDV)
              </span>
              {carrinho.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                  {carrinho.length}
                </span>
              )}
            </button>
          )}

          {/* Modal: Autocomplete / Responsible Team */}
          {showResponsaveisModal && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
                <div className="p-6 bg-slate-55/10 border-b border-slate-150 flex justify-between items-center shrink-0">
                  <h3 className="font-bold text-slate-800">Equipe Organizadora</h3>
                  <button onClick={() => setShowResponsaveisModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="p-6 space-y-4 overflow-y-auto flex-grow">
                  {/* Autocomplete Input Search */}
                  {selectedBazar.status === 'ATIVO' && (
                    <div className="relative">
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Adicionar Organizador</label>
                      <div className="flex items-center gap-2 bg-slate-55/10 border border-slate-200 rounded-xl px-3 py-1.5">
                        <Search className="h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Buscar membro por nome..."
                          value={membroBusca}
                          onChange={(e) => setMembroBusca(e.target.value)}
                          className="bg-transparent text-xs text-slate-800 focus:outline-none w-full font-semibold"
                        />
                      </div>
                      
                      {/* Dropdown Suggestions */}
                      {filteredMembros.length > 0 && (
                        <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-40 overflow-y-auto z-50 divide-y divide-slate-100">
                          {filteredMembros.map(m => (
                            <div
                              key={m.id}
                              onClick={() => handleAddResponsavel(m.id)}
                              className="p-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs font-bold text-slate-700"
                            >
                              <span>{m.nomeCompleto}</span>
                              <Plus className="h-3.5 w-3.5 text-teal-700" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* List of current responsibles */}
                  <div className="space-y-3">
                    <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-1">Organizadores Cadastrados</span>
                    {loadingResponsaveis ? (
                      <div className="text-center py-6 text-slate-400">Carregando equipe...</div>
                    ) : responsaveis.length > 0 ? (
                      responsaveis.map(r => (
                        <div key={r.id} className="flex items-center justify-between p-3 bg-slate-55/10 rounded-xl border border-slate-150 shadow-2xs">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden text-xs font-bold flex items-center justify-center text-slate-500">
                              {r.fotoPerfilUrl ? (
                                <img src={r.fotoPerfilUrl} alt={r.nomeMembro} className="w-full h-full object-cover" />
                              ) : r.nomeMembro.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="text-xs font-bold text-slate-850">{r.nomeMembro}</span>
                          </div>
                          {selectedBazar.status === 'ATIVO' && (
                            <button
                              onClick={() => handleRemoveResponsavel(r.id)}
                              className="text-rose-600 hover:text-rose-800 p-1.5 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-slate-400 italic text-xs">
                        Nenhum organizador adicionado a este bazar.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal: Import Products (CSV) */}
          {showImportModal && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 bg-slate-55/10 border-b border-slate-150 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800">Importação de Produtos (CSV)</h3>
                  <button onClick={() => { setShowImportModal(false); setImportFile(null); }} className="text-slate-400 hover:text-slate-600">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={handleImportCSVSubmit} className="p-6 space-y-4">
                  {/* CSV Dropzone / Upload area */}
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-teal-700 transition-colors">
                    <Upload className="h-10 w-10 text-slate-350 mx-auto mb-2" />
                    <label className="block text-xs font-bold text-slate-600 mb-1 cursor-pointer">
                      Selecione o arquivo produtos.csv
                      <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={(e) => setImportFile(e.target.files[0])}
                        required
                      />
                    </label>
                    {importFile ? (
                      <p className="text-[10px] text-teal-700 font-bold mt-1">
                        Selecionado: {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-400">Delimitador: ponto-e-vírgula (;)</p>
                    )}
                  </div>

                  {/* Template Download Button */}
                  <div className="bg-slate-55/10 rounded-xl p-3 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-semibold">Baixar planilha de modelo</span>
                    <button
                      type="button"
                      onClick={handleDownloadModeloCSV}
                      className="text-teal-700 hover:underline font-bold"
                    >
                      modelo_bazar.csv
                    </button>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => { setShowImportModal(false); setImportFile(null); }}
                      className="bg-white border border-slate-200 text-slate-600 font-semibold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={importing || !importFile}
                      className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1 disabled:opacity-50"
                    >
                      {importing && <Loader2 className="h-4 w-4 animate-spin" />}
                      Processar CSV
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Cadastrar Produto Unitário */}
          {showCreateProductModal && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 bg-slate-55/10 border-b border-slate-150 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800">Cadastrar Produto</h3>
                  <button onClick={() => setShowCreateProductModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={handleCreateProductSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Título do Produto</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Sapato Social Preto"
                      value={prodTitulo}
                      onChange={(e) => setProdTitulo(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-650"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Descrição</label>
                    <textarea
                      placeholder="Detalhes como tamanho, cor, estado..."
                      value={prodDescricao}
                      onChange={(e) => setProdDescricao(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-650"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Preço (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="0.00"
                        value={prodPreco}
                        onChange={(e) => setProdPreco(e.target.value)}
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-650"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Quantidade de Estoque</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={prodQuantidade}
                        onChange={(e) => setProdQuantidade(Math.max(1, parseInt(e.target.value, 10)))}
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-650"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Foto do Produto (Opcional)</label>
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-14 rounded-full overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                        {prodFotoUrl ? (
                          <img src={prodFotoUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <Package className="h-6 w-6 text-slate-300" />
                        )}
                      </div>
                      <label className="flex items-center gap-2 border border-slate-350 hover:bg-slate-50 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer">
                        Alterar Foto
                        <Upload className="h-4 w-4" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setProdFotoUrl(reader.result);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      {prodFotoUrl && (
                        <button
                          type="button"
                          onClick={() => setProdFotoUrl('')}
                          className="border border-red-200 text-red-650 bg-red-50 hover:bg-red-100/50 p-2 rounded-xl transition-all font-semibold"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateProductModal(false)}
                      className="bg-white border border-slate-200 text-slate-600 font-semibold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submittingProduct}
                      className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1"
                    >
                      {submittingProduct && <Loader2 className="h-4 w-4 animate-spin" />}
                      Salvar Cadastro
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Product Modal */}
          {showEditProductModal && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-250">
              <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 bg-slate-55/10 border-b border-slate-150 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800">Editar Produto</h3>
                  <button onClick={() => setShowEditProductModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={handleEditProduct} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Título do Produto</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Sapato Social Preto"
                      value={editProdTitulo}
                      onChange={(e) => setEditProdTitulo(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-650 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Descrição</label>
                    <textarea
                      placeholder="Detalhes como tamanho, cor, estado..."
                      value={editProdDescricao}
                      onChange={(e) => setEditProdDescricao(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-650 font-semibold"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Preço (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={editProdPreco}
                      onChange={(e) => setEditProdPreco(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-650 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Quantidade em Estoque</label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="Ex: 5"
                      value={editProdQuantidade}
                      onChange={(e) => setEditProdQuantidade(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-650 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Foto do Produto (Opcional)</label>
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-14 rounded-full overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                        {editProdFotoUrl ? (
                          <img src={editProdFotoUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <Package className="h-6 w-6 text-slate-300" />
                        )}
                      </div>
                      <label className="flex items-center gap-2 border border-slate-350 hover:bg-slate-50 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer">
                        Alterar Foto
                        <Upload className="h-4 w-4" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setEditProdFotoUrl(reader.result);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      {editProdFotoUrl && (
                        <button
                          type="button"
                          onClick={() => setEditProdFotoUrl('')}
                          className="border border-red-200 text-red-650 bg-red-50 hover:bg-red-100/50 p-2 rounded-xl transition-all font-semibold"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setShowEditProductModal(false)}
                      className="bg-white border border-slate-200 text-slate-600 font-semibold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Product Modal (Requires confirmation + Member logs history) */}
          {showDeleteProductModal && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 bg-rose-50 border-b border-rose-100 flex justify-between items-center">
                  <h3 className="font-bold text-rose-800">Excluir Produto</h3>
                  <button onClick={() => setShowDeleteProductModal(false)} className="text-rose-400 hover:text-rose-600">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={handleDeleteProduct} className="p-6 space-y-4">
                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 text-xs font-semibold text-rose-800 leading-relaxed">
                    <AlertCircle className="h-4 w-4 inline mr-1 text-rose-600 float-left mt-0.5" />
                    Atenção: Ao excluir o produto <span className="font-black">"{deleteProductTitle}"</span>, todos os seus respectivos códigos de barra e quantidades em estoque serão permanentemente removidos.
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Qual membro está realizando a exclusão?</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="Buscar membro por nome..."
                        value={deleteProductMembroBusca}
                        onChange={(e) => {
                          setDeleteProductMembroBusca(e.target.value)
                          if (e.target.value.trim() === '') {
                            setDeleteProductFilteredMembros([])
                          } else {
                            const q = e.target.value.toLowerCase()
                            setDeleteProductFilteredMembros(membros.filter(m => m.nomeCompleto.toLowerCase().includes(q)))
                          }
                        }}
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-650"
                      />
                      {deleteProductFilteredMembros.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto divide-y divide-slate-50">
                          {deleteProductFilteredMembros.map(m => (
                            <div
                              key={m.id}
                              onClick={() => {
                                setDeleteProductSelectedMembro(m)
                                setDeleteProductMembroBusca(m.nomeCompleto)
                                setDeleteProductFilteredMembros([])
                              }}
                              className="p-2.5 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer font-bold flex items-center gap-2"
                            >
                              <div className="h-6 w-6 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                                {m.fotoPerfilUrl ? <img src={m.fotoPerfilUrl} alt="" className="w-full h-full object-cover" /> : <div className="h-full w-full bg-teal-50" />}
                              </div>
                              {m.nomeCompleto}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setShowDeleteProductModal(false)}
                      className="bg-white border border-slate-200 text-slate-600 font-semibold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={!deleteProductSelectedMembro}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm disabled:opacity-50"
                    >
                      Excluir Produto
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Frente de Caixa (PDV Ágil) */}
          {showPDVModal && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-slate-50 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col h-[90vh]">
                
                {/* Header */}
                <div className="p-6 bg-teal-800 text-white flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="h-6 w-6" />
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base">Frente de Caixa (PDV)</h3>
                      <p className="text-[10px] text-teal-100">Registre vendas rápidas adicionando múltiplos códigos de barra.</p>
                    </div>
                  </div>
                  <button onClick={() => setShowPDVModal(false)} className="text-teal-200 hover:text-white bg-teal-700/50 p-2 rounded-full transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* PDV Main Body */}
                <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
                  
                  {/* Left Column: Cart items and Scanner input */}
                  <div className="flex-grow p-6 flex flex-col space-y-4 overflow-y-auto min-w-0">
                    
                    {/* Scanner Input */}
                    <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs space-y-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Digitar ou Escanear Código de Barras (Foco Automático)
                      </label>
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault()
                          if (!serialInput.trim()) return
                          
                          setPdvError(null)
                          const rawSerial = serialInput.trim()
                          setSerialNumberInput('')

                          // Check if already in checkout cart
                          const existsBySerial = carrinho.find(c => c.serialNumber === rawSerial)
                          if (existsBySerial) {
                            setCarrinho(prev => prev.map(item => item.serialNumber === rawSerial ? { ...item, quantidade: Math.min(item.quantidade + 1, item.maxEstoque) } : item))
                            return
                          }

                          // Query catalog product item details
                          try {
                            const res = await fetch(`/api/balcao-vendas/produtos/pesquisa?bazarId=${selectedBazar.id}&codigoBarras=${encodeURIComponent(rawSerial)}`)
                            if (res.ok) {
                              const list = await res.json()
                              if (list.length > 0) {
                                const prod = list[0]
                                setCarrinho(prev => {
                                  const totalAvail = prod.totalEstoque - prod.totalVendido
                                  const existing = prev.find(item => item.produtoId === prod.id)
                                  if (existing) {
                                    const nextQty = Math.min(existing.quantidade + 1, totalAvail)
                                    return prev.map(item => item.produtoId === prod.id ? { ...item, quantidade: nextQty } : item)
                                  }
                                  return [
                                    ...prev,
                                    {
                                      serialNumber: rawSerial,
                                      produtoId: prod.id,
                                      titulo: prod.titulo,
                                      preco: prod.preco,
                                      quantidade: 1,
                                      maxEstoque: totalAvail,
                                      needsSerialResolve: false
                                    }
                                  ]
                                })
                                return
                              }
                              setPdvError(`Código de barras não localizado ou produto não cadastrado neste evento.`)
                            }
                          } catch (err) {
                            setPdvError('Falha ao localizar código de barras no estoque.')
                          }
                        }}
                        className="flex gap-2"
                      >
                        <input
                          type="text"
                          ref={serialInputRef}
                          placeholder="Clique aqui e use o leitor de código de barras ou digite o código..."
                          value={serialInput}
                          onChange={(e) => setSerialNumberInput(e.target.value)}
                          className="w-full border border-slate-350 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-teal-700 bg-slate-55/10 focus:bg-white"
                        />
                        <button type="submit" className="bg-teal-700 text-white px-5 rounded-xl font-bold text-xs hover:bg-teal-800 transition-colors">
                          Adicionar
                        </button>
                      </form>
                      {pdvError && (
                        <p className="text-[10px] text-rose-600 font-bold flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          {pdvError}
                        </p>
                      )}
                    </div>

                    {/* Cart Items List */}
                    <div className="flex-grow bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between overflow-y-auto max-h-[350px]">
                      <div className="space-y-3">
                        <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">Itens Adicionados ({carrinho.length})</span>
                        
                        {carrinho.length > 0 ? (
                          <div className="space-y-3 divide-y divide-slate-100 max-h-[250px] overflow-y-auto pr-1">
                            {carrinho.map((item, idx) => {
                              const subtotalItem = item.preco * (item.quantidade || 1)
                              return (
                                <div key={idx} className="flex items-center justify-between pt-3 first:pt-0">
                                  <div className="space-y-0.5 max-w-[45%]">
                                    <h4 className="text-xs font-bold text-slate-800 truncate" title={item.titulo}>{item.titulo}</h4>
                                    <span className="text-[9px] text-slate-500 font-mono font-bold block truncate">
                                      {item.needsSerialResolve ? 'Alocação automática' : `Código: ${item.serialNumber}`}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-1.5 py-0.5 bg-slate-50">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newQty = Math.max(1, (item.quantidade || 1) - 1)
                                        setCarrinho(prev => prev.map((c, i) => i === idx ? { ...c, quantidade: newQty } : c))
                                      }}
                                      className="text-slate-550 hover:text-slate-900 font-black text-xs px-1"
                                    >
                                      -
                                    </button>
                                    <span className="text-[11px] font-black text-slate-850 min-w-[14px] text-center">
                                      {item.quantidade || 1}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newQty = Math.min(item.maxEstoque || 999, (item.quantidade || 1) + 1)
                                        setCarrinho(prev => prev.map((c, i) => i === idx ? { ...c, quantidade: newQty } : c))
                                      }}
                                      className="text-slate-550 hover:text-slate-900 font-black text-xs px-1"
                                    >
                                      +
                                    </button>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-xs font-black text-slate-900">
                                      R$ {subtotalItem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                    <button
                                      onClick={() => setCarrinho(carrinho.filter((_, i) => i !== idx))}
                                      className="text-rose-600 hover:text-rose-800 p-1 hover:bg-rose-50 rounded-lg"
                                    >
                                      <Trash className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <div className="py-12 text-center text-slate-400 italic text-xs">
                            O carrinho de compras está vazio. Digite ou escaneie o código de barras ou selecione itens disponíveis na vitrine.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Checkout details */}
                  <div className="w-full md:w-80 bg-white border-t md:border-t-0 md:border-l border-slate-200 p-6 flex flex-col justify-between shrink-0">
                    <div className="space-y-6">
                      <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">Resumo da Venda</span>
                      
                      {/* Total */}
                      <div className="space-y-1">
                        <span className="text-xs text-slate-500 font-bold">Total Geral</span>
                        <div className="text-3xl font-black text-teal-800">
                          R$ {carrinho.reduce((acc, c) => acc + (c.preco * (c.quantidade || 1)), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>

                      {/* Payment Methods */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Forma de Pagamento</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['PIX', 'DINHEIRO', 'CARTAO'].map((method) => (
                            <button
                              key={method}
                              type="button"
                              onClick={() => setFormaPagamento(method)}
                              className={`py-2 rounded-xl text-[10px] font-black tracking-wider transition-all border ${
                                formaPagamento === method
                                  ? 'bg-teal-700 border-teal-700 text-white shadow-xs'
                                  : 'bg-slate-55/10 border-slate-200 text-slate-650 hover:bg-slate-100'
                              }`}
                            >
                              {method}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 space-y-2">
                      <button
                        onClick={async () => {
                          if (carrinho.length === 0) return
                          setSubmittingVenda(true)
                          
                          const finalSerials = []
                          try {
                            for (let item of carrinho) {
                              const qty = item.quantidade || 1
                              if (item.needsSerialResolve) {
                                const serRes = await fetch(`/api/balcao-vendas/produtos/${item.produtoId}/serial-disponivel?limit=${qty}`)
                                if (serRes.ok) {
                                  const data = await serRes.json()
                                  const resolved = data.seriais || []
                                  if (resolved.length < qty) {
                                    throw new Error(`Estoque insuficiente para ${item.titulo}. Disponível: ${resolved.length}`)
                                  }
                                  finalSerials.push(...resolved)
                                } else {
                                  throw new Error(`Sem estoque disponível para ${item.titulo}`)
                                }
                              } else {
                                finalSerials.push(item.serialNumber)
                                if (qty > 1) {
                                  const serRes = await fetch(`/api/balcao-vendas/produtos/${item.produtoId}/serial-disponivel?limit=${qty * 2}`)
                                  if (serRes.ok) {
                                    const data = await serRes.json()
                                    const resolved = (data.seriais || []).filter(s => s !== item.serialNumber)
                                    const needed = qty - 1
                                    if (resolved.length < needed) {
                                      throw new Error(`Estoque insuficiente para ${item.titulo}. Disponível: ${resolved.length + 1}`)
                                    }
                                    finalSerials.push(...resolved.slice(0, needed))
                                  } else {
                                    throw new Error(`Sem estoque adicional disponível para ${item.titulo}`)
                                  }
                                }
                              }
                            }

                            const checkoutRes = await fetch('/api/balcao-vendas/vendas/confirmar', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                bazarId: selectedBazar.id,
                                seriais: finalSerials,
                                formaPagamento: formaPagamento
                              })
                            })

                            if (checkoutRes.ok) {
                              triggerToast('Venda registrada com sucesso!')
                              setCarrinho([])
                              setShowPDVModal(false)
                              loadDashboard(selectedBazar.id)
                              loadProdutos(selectedBazar.id)
                            } else {
                              const errData = await checkoutRes.json()
                              triggerToast(errData.detail || 'Erro ao processar venda', true)
                            }
                          } catch (err) {
                            triggerToast(err.message || 'Erro ao processar venda', true)
                          } finally {
                            setSubmittingVenda(false)
                          }
                        }}
                        disabled={carrinho.length === 0 || submittingVenda}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-xs py-3 rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5"
                      >
                        {submittingVenda ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        Finalizar Venda
                      </button>
                      <button
                        onClick={() => setShowPDVModal(false)}
                        className="w-full bg-white border border-slate-200 text-slate-600 font-bold text-xs py-2.5 rounded-2xl hover:bg-slate-50 transition-colors"
                      >
                        Fechar Caixa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal: Conclude / Reopen Event */}
          {showEventStateModal && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 bg-slate-55/10 border-b border-slate-150 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800">
                    {eventStateAction === 'CONCLUIR' ? 'Encerrar Evento de Vendas' : 'Reabrir Evento de Vendas'}
                  </h3>
                  <button onClick={() => setShowEventStateModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={handleEventStateAction} className="p-6 space-y-4">
                  <div className="text-xs font-semibold text-slate-600 leading-relaxed">
                    {eventStateAction === 'CONCLUIR' 
                      ? 'Ao encerrar este evento de vendas, nenhuma nova venda poderá ser registrada. Os produtos em estoque continuarão cadastrados para fins de consulta e faturamento isolado.'
                      : 'Ao reabrir este evento de vendas, a equipe responsável poderá realizar novas transações no Frente de Caixa (PDV).'
                    }
                  </div>

                  {responsaveis.length === 0 ? (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 text-xs font-bold leading-normal">
                      Por favor, cadastre membros na Equipe Responsável antes de realizar esta ação.
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Quem é o responsável efetuando a ação?</label>
                      <select
                        required
                        value={stateActionSelectedMembroId}
                        onChange={(e) => setStateActionSelectedMembroId(e.target.value)}
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-650 bg-white"
                      >
                        <option value="">Selecione um organizador...</option>
                        {responsaveis.map(r => (
                          <option key={r.id} value={r.membroId}>{r.nomeMembro}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setShowEventStateModal(false)}
                      className="bg-white border border-slate-200 text-slate-600 font-semibold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={responsaveis.length === 0 || !stateActionSelectedMembroId}
                      className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm disabled:opacity-50"
                    >
                      {eventStateAction === 'CONCLUIR' ? 'Confirmar Encerramento' : 'Reabrir Evento'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Estorno de Item de Venda */}
          {showEstornoModal && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 bg-slate-55/10 border-b border-slate-150 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="h-5 w-5 text-teal-700" />
                    <h3 className="font-bold text-slate-800">Estornar Item de Venda</h3>
                  </div>
                  <button onClick={() => setShowEstornoModal(false)} className="text-slate-400 hover:text-slate-600 bg-white border border-slate-200 p-1.5 rounded-lg">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <form onSubmit={handleEstornoSubmit} className="p-6 space-y-4">
                  <div className="text-xs text-slate-500 leading-normal">
                    Informe o código de barras do item vendido. Ao confirmar, o valor arrecadado será reduzido e o item retornará automaticamente ao estoque com status <strong>Disponível</strong>.
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Código de Barras</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: CB3E8D9F"
                      value={estornoBarcode}
                      onChange={(e) => setEstornoBarcode(e.target.value)}
                      className="w-full border border-slate-350 rounded-xl px-3 py-2.5 text-sm font-mono font-bold uppercase focus:outline-none focus:border-teal-650 bg-slate-55/5 focus:bg-white"
                    />
                  </div>

                  {responsaveis.length === 0 ? (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 text-xs font-bold leading-normal">
                      Por favor, cadastre membros na Equipe Responsável antes de realizar um estorno.
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Autorizado por (Organizador)</label>
                      <select
                        required
                        value={estornoSelectedMembroId}
                        onChange={(e) => setEstornoSelectedMembroId(e.target.value)}
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-650 bg-white"
                      >
                        <option value="">Selecione um organizador...</option>
                        {responsaveis.map(r => (
                          <option key={r.id} value={r.membroId}>{r.nomeMembro}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setShowEstornoModal(false)}
                      className="bg-white border border-slate-200 text-slate-600 font-semibold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={responsaveis.length === 0 || !estornoBarcode.trim() || !estornoSelectedMembroId}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm disabled:opacity-50"
                    >
                      Confirmar Estorno
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Prévia de Etiquetas */}
          {showLabelsPrintModal && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 no-print-backdrop">
              <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] print-visible">
                
                <style dangerouslySetInnerHTML={{ __html: `
                  @media print {
                    body { background: white !important; color: black !important; }
                    .no-print, header, nav, aside, button, .no-print-backdrop {
                      display: none !important;
                    }
                    .overflow-y-auto, .flex-grow {
                      overflow: visible !important;
                      height: auto !important;
                      max-height: none !important;
                    }
                    .print-visible {
                      position: absolute !important;
                      left: 0 !important;
                      top: 0 !important;
                      width: 100% !important;
                      height: auto !important;
                      display: block !important;
                    }
                  }
                ` }} />

                <div className="p-6 bg-slate-55/10 border-b border-slate-150 flex justify-between items-center shrink-0 no-print">
                  <div className="flex items-center gap-2">
                    <Printer className="h-5 w-5 text-teal-700" />
                    <h3 className="font-extrabold text-slate-800">Prévia de Etiquetas de Código de Barras</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.print()}
                      className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <Printer className="h-4 w-4" />
                      Imprimir Etiquetas ({labelsToPrint.length})
                    </button>
                    <button 
                      onClick={() => {
                        setShowLabelsPrintModal(false)
                        setSelectedLabelProductIds([])
                      }} 
                      className="text-slate-400 hover:text-slate-600 bg-white border border-slate-200 p-2 rounded-xl"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-grow overflow-y-auto p-8 space-y-6">
                  <div className="no-print bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-semibold text-slate-500 mb-6 leading-relaxed">
                    Abaixo está a prévia das etiquetas térmicas. Ao clicar no botão <strong>Imprimir Etiquetas</strong>, a janela nativa de impressão será exibida configurada para ocultar o resto do sistema. Ajuste a margem e escala do seu navegador se necessário.
                  </div>

                  <div id="printable-labels-container" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 justify-items-center">
                    {labelsToPrint.map((item) => (
                      <div key={item.id} className="label-card border border-slate-200 p-4 w-[180px] h-[180px] flex flex-col justify-between items-center bg-white rounded-xl shadow-xs">
                        <div className="text-[10px] font-black text-slate-800 uppercase tracking-tight text-center line-clamp-2 w-full leading-normal">
                          {item.produtoTitulo}
                        </div>

                        <div className="my-2 flex items-center justify-center">
                          <img 
                            src={`https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(item.serialNumber)}&scale=2&rotate=N&includetext=false`} 
                            alt={item.serialNumber} 
                            className="h-10 w-auto object-contain" 
                          />
                        </div>

                        <div className="text-[9px] font-mono font-bold text-slate-500 tracking-wider">
                          {item.serialNumber}
                        </div>

                        <div className="text-xs font-black text-slate-900 border-t border-slate-100 pt-1 w-full text-center">
                          R$ {item.preco?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
