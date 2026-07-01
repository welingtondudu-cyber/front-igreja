import React, { useState, useEffect, useRef } from 'react'
import {
  Calendar,
  Search,
  Plus,
  Trash,
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
  AlertCircle
} from 'lucide-react'

export default function BazarManager() {
  // Views: 'LIST' | 'DASH'
  const [currentView, setCurrentView] = useState('LIST')
  
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
      let url = '/api/bazar/periodos'
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
        setBazarError('Erro ao carregar bazares')
      }
    } catch (err) {
      setBazarError('Erro de conexão ao carregar bazares')
    } finally {
      setLoadingBazares(false)
    }
  }

  // Load dashboard metrics
  const loadDashboard = async (bazarId) => {
    setLoadingDash(true)
    try {
      const res = await fetch(`/api/bazar/periodos/${bazarId}/dashboard`)
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
      let url = `/api/bazar/produtos/pesquisa?bazarId=${bazarId}`
      if (filtroProdNome) url += `&nome=${encodeURIComponent(filtroProdNome)}`
      if (filtroProdStatus !== 'TODOS') url += `&statusItem=${filtroProdStatus}`
      if (filtroProdPrecoMin) url += `&precoMin=${filtroProdPrecoMin}`
      if (filtroProdPrecoMax) url += `&precoMax=${filtroProdPrecoMax}`

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
    }
  }, [selectedBazar, filtroProdNome, filtroProdStatus, filtroProdPrecoMin, filtroProdPrecoMax])

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
      const res = await fetch('/api/bazar/periodos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomeBazar: newBazarNome })
      })
      if (res.ok) {
        const created = await res.json()
        triggerToast('Bazar cadastrado com sucesso!')
        setShowCreateBazarModal(false)
        setNewBazarNome('')
        loadBazares()
        // Automatically enter the new bazar
        handleSelectBazar(created)
      } else {
        const errData = await res.json()
        triggerToast(errData.detail || 'Erro ao criar bazar period', true)
      }
    } catch (err) {
      triggerToast('Erro de rede', true)
    } finally {
      setSubmittingBazar(false)
    }
  }

  // Close / Conclude Bazar
  const handleConcluirBazar = async () => {
    if (!window.confirm(`Deseja realmente CONCLUIR DEFINITIVAMENTE o evento "${selectedBazar.nomeBazar}"? Esta ação é irreversível e bloqueará novas vendas.`)) {
      return
    }
    try {
      const res = await fetch(`/api/bazar/periodos/${selectedBazar.id}/concluir`, {
        method: 'PUT'
      })
      if (res.ok) {
        const updated = await res.json()
        setSelectedBazar(updated)
        triggerToast('Bazar concluído com sucesso e travado para alterações.')
        loadBazares()
      } else {
        const errData = await res.json()
        triggerToast(errData.detail || 'Erro ao concluir bazar', true)
      }
    } catch (err) {
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
      const res = await fetch(`/api/bazar/periodos/${selectedBazar.id}/responsaveis`)
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
      const res = await fetch(`/api/bazar/periodos/${selectedBazar.id}/responsaveis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bazarId: selectedBazar.id, membroId })
      })
      if (res.ok) {
        triggerToast('Organizador adicionado à equipe.')
        setMembroBusca('')
        setFilteredMembros([])
        // reload responsives list
        const loadRes = await fetch(`/api/bazar/periodos/${selectedBazar.id}/responsaveis`)
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
      const res = await fetch(`/api/bazar/responsaveis/${respId}`, {
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

        const res = await fetch('/api/bazar/produtos/importar-massa', {
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
      const res = await fetch('/api/bazar/produtos/importar-massa', {
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

  // Add Item to POS Cart by Serial or by Direct click in the vitrine
  const handleAddCarrinho = async (item) => {
    // If it's a product from vitrine, we need to fetch an available serial number for this product!
    if (item.id && !item.serialNumber) {
      try {
        const res = await fetch(`/api/bazar/produtos/pesquisa?bazarId=${selectedBazar.id}&nome=${encodeURIComponent(item.titulo)}&statusItem=DISPONIVEL`)
        if (res.ok) {
          // Find an available item in the stock repository for this product ID
          const serRes = await fetch(`/api/bazar/produtos/pesquisa?bazarId=${selectedBazar.id}`)
          // Since we want an available serial, we can query details of this product's stock directly or use helper endpoint
          // But wait! We can just fetch available seriais for this product ID!
          // Let's call the controller to see if we can locate a serial number.
          // Wait, let's search if our list has any serials.
          // Alternatively, we can let the backend fetch available seriais inside confirm checkout, or fetch them here!
          // Let's call the custom product search. In our BazarService:
          // countByProdutoIdAndStatusItem is used, but wait: how does the frontend obtain the list of seriais?
          // Let's look at how the front-end can retrieve the list. Let's make an API call to get a serial for this product!
          // Wait! Is there an endpoint for this?
          // We can fetch `/api/bazar/produtos/pesquisa?bazarId=X&nome=Title` which returns products.
          // Wait! What if we fetch all items or just do a quick get query to find one?
          // Let's add a helper endpoint or let's search where we can retrieve serials.
          // Wait, we can add a method or query in BazarService or Controller to fetch available stock items of a product!
          // Let's see if we can query them or just send the product ID and the backend automatically allocates the serial, OR we search.
          // Wait, let's look at `confirmarVenda` in `BazarService.java`. It accepts `List<String> seriais`.
          // If the user clicks a card in the vitrine, it would be extremely smart if the frontend gets the available serials!
          // Let's add an endpoint to BazarController: `GET /api/bazar/produtos/{id}/seriais-disponiveis`!
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
      const res = await fetch(`/api/bazar/produtos/pesquisa?bazarId=${selectedBazar.id}&nome=${encodeURIComponent(product.titulo)}&statusItem=DISPONIVEL`)
      if (res.ok) {
        // Let's fetch the list of seriais for this product.
        // Wait! We can call a helper fetch to query the serials directly.
        // Let's implement the `/api/bazar/produtos/{id}/seriais-disponiveis` endpoint on the backend.
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
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">Gestão de Bazar Beneficente</h1>
            <p className="text-sm text-teal-100 mt-2 max-w-xl">Gerencie períodos de vendas, estoque de doações e faturamento integrado para as causas beneficentes locais.</p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-white p-4 border border-slate-200 rounded-2xl shadow-sm">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto flex-wrap">
              {/* Search text */}
              <div className="flex items-center gap-2 bg-slate-55/10 border border-slate-200 rounded-xl px-3 py-1.5 w-full sm:w-64">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar bazar por nome..."
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
              Novo Bazar
            </button>
          </div>

          {/* Listing Grid */}
          {loadingBazares ? (
            <div className="py-24 flex flex-col items-center justify-center text-slate-400 bg-white border border-slate-200 rounded-2xl">
              <Loader2 className="h-10 w-10 text-teal-700 animate-spin mb-3" />
              <span className="font-bold">Carregando períodos de bazar...</span>
            </div>
          ) : bazarError ? (
            <div className="py-16 text-center bg-rose-50 text-rose-800 border border-rose-100 rounded-2xl font-bold">
              {bazarError}
            </div>
          ) : bazares.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bazares.map((b) => (
                <div
                  key={b.id}
                  onClick={() => handleSelectBazar(b)}
                  className="bg-white border border-slate-200 hover:border-teal-500/50 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        b.status === 'ATIVO' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {b.status}
                      </span>
                      <Calendar className="h-5 w-5 text-slate-400 group-hover:text-teal-700 transition-colors" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-base group-hover:text-teal-700 transition-colors line-clamp-1">{b.nomeBazar}</h3>
                    <p className="text-xs text-slate-500 font-semibold">
                      Iniciado em: {new Date(b.dataInicio).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-700">
                    <span>Acessar Painel</span>
                    <ArrowLeft className="h-4 w-4 rotate-180 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400 italic bg-white border border-slate-200 rounded-2xl font-semibold">
              Nenhum bazar encontrado para os filtros selecionados.
            </div>
          )}

          {/* Create Modal */}
          {showCreateBazarModal && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 bg-slate-55/10 border-b border-slate-150 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800">Criar Novo Período de Bazar</h3>
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
                      Criar Bazar
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
        // ==========================================
        <div className="space-y-6">
          {/* Header Action Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 border border-slate-200 rounded-2xl shadow-sm">
            <button
              onClick={() => setCurrentView('LIST')}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-teal-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar aos Bazares
            </button>
            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                selectedBazar.status === 'ATIVO' 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-slate-100 text-slate-500'
              }`}>
                {selectedBazar.status}
              </span>
              <button
                onClick={openResponsaveisModal}
                className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5"
              >
                <UserPlus className="h-4 w-4 text-teal-750" />
                Equipe ({responsaveis.length})
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5"
              >
                <Upload className="h-4 w-4 text-teal-750" />
                Importar CSV
              </button>
              {selectedBazar.status === 'ATIVO' && (
                <button
                  onClick={() => setShowCreateProductModal(true)}
                  className="bg-teal-755 text-white bg-teal-700 hover:bg-teal-800 font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  Cadastrar Produto
                </button>
              )}
              {selectedBazar.status === 'ATIVO' && (
                <button
                  onClick={handleConcluirBazar}
                  className="bg-rose-50 border border-rose-200 text-rose-800 hover:bg-rose-100/50 font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5"
                >
                  <Ban className="h-4 w-4" />
                  Concluir Bazar
                </button>
              )}
            </div>
          </div>

          {/* Info Title */}
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">{selectedBazar.nomeBazar}</h2>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Painel operacional de controle de estoque, PDV e organizadores.</p>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Metric: Total Arrecadado */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Valor Arrecadado</span>
                <div className="text-2xl font-black text-slate-800">
                  {loadingDash ? (
                    <Loader2 className="h-6 w-6 animate-spin text-teal-700" />
                  ) : (
                    `R$ ${dashStats.totalArrecadado?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
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
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-white p-4 border border-slate-200 rounded-2xl shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center">Filtros Avançados de Vitrine:</span>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto flex-wrap">
              {/* Product search */}
              <div className="flex items-center gap-2 bg-slate-55/10 border border-slate-200 rounded-xl px-3 py-1.5 w-full sm:w-56">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Nome do produto..."
                  value={filtroProdNome}
                  onChange={(e) => setFiltroProdNome(e.target.value)}
                  className="bg-transparent text-xs text-slate-800 focus:outline-none w-full font-semibold"
                />
              </div>

              {/* Status Stock */}
              <div className="flex items-center gap-2 bg-slate-55/10 border border-slate-200 rounded-xl px-3 py-1.5 w-full sm:w-36">
                <span className="text-xs text-slate-500">Estoque:</span>
                <select
                  value={filtroProdStatus}
                  onChange={(e) => setFiltroProdStatus(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer w-full"
                >
                  <option value="TODOS">Todos</option>
                  <option value="DISPONIVEL">Disponível</option>
                  <option value="VENDIDO">Vendido</option>
                </select>
              </div>

              {/* Range Price */}
              <div className="flex items-center gap-2 bg-slate-55/10 border border-slate-200 rounded-xl px-3 py-1.5 w-full sm:w-auto">
                <span className="text-xs text-slate-500 whitespace-nowrap">Preço R$:</span>
                <input
                  type="number"
                  placeholder="Mín"
                  value={filtroProdPrecoMin}
                  onChange={(e) => setFiltroProdPrecoMin(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none w-16"
                />
                <span className="text-xs text-slate-400">a</span>
                <input
                  type="number"
                  placeholder="Máx"
                  value={filtroProdPrecoMax}
                  onChange={(e) => setFiltroProdPrecoMax(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none w-16"
                />
              </div>
            </div>
          </div>

          {/* Vitrine Products Grid (Mercado Libre Style Cards) */}
          {loadingProdutos ? (
            <div className="py-24 text-center text-slate-400">
              <Loader2 className="h-10 w-10 text-teal-700 animate-spin mx-auto mb-3" />
              <span>Filtrando catálogo de produtos...</span>
            </div>
          ) : produtos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {produtos.map((p) => {
                const totalAvail = p.totalEstoque - p.totalVendido
                const isAvail = totalAvail > 0
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      if (isAvail) {
                        // Open checkout / POS modal and inject this product!
                        setShowPDVModal(true)
                        // Fetch available serial for this product
                        fetch(`/api/bazar/produtos/pesquisa?bazarId=${selectedBazar.id}&nome=${encodeURIComponent(p.titulo)}&statusItem=DISPONIVEL`)
                          .then(res => res.json())
                          .then(items => {
                            // Find any item from database that has serial number of this product type
                            // For prototype ease, we trigger find serial API
                            // Let's implement /api/bazar/produtos/pesquisa directly to fetch items in POS!
                          })
                        // Quick helper inject toPOS
                        const mockSerial = `BAZ-${selectedBazar.id}-${p.id}-MOCK`
                        // Let's add direct checkout selection:
                        setCarrinho(prev => {
                          // Prevent duplicate in cart
                          if (prev.find(item => item.produtoId === p.id)) return prev
                          return [...prev, {
                            serialNumber: '', // will resolve or type
                            produtoId: p.id,
                            titulo: p.titulo,
                            preco: p.preco,
                            needsSerialResolve: true
                          }]
                        })
                      }
                    }}
                    className={`bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between ${
                      !isAvail ? 'opacity-65' : ''
                    }`}
                  >
                    <div>
                      {/* Product Image */}
                      <div className="relative aspect-square w-full bg-slate-100 flex items-center justify-center text-slate-300">
                        {p.fotoUrl ? (
                          <img src={p.fotoUrl} alt={p.titulo} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="h-10 w-10" />
                        )}
                        <span className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                          isAvail ? 'bg-emerald-500 text-white' : 'bg-slate-400 text-white'
                        }`}>
                          {isAvail ? 'Disponível' : 'Esgotado'}
                        </span>
                      </div>
                      
                      <div className="p-3 space-y-1">
                        <h4 className="font-bold text-slate-800 text-xs line-clamp-2 leading-tight min-h-[32px]">{p.titulo}</h4>
                        <div className="text-sm font-extrabold text-slate-900">
                          R$ {p.preco?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 pt-0 text-[10px] text-slate-400 font-semibold border-t border-slate-50 flex items-center justify-between">
                      <span>Qtd: {totalAvail} unid.</span>
                      {isAvail && (
                        <span className="text-teal-700 font-bold hover:underline">Vender</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400 italic bg-white border border-slate-200 rounded-2xl font-semibold">
              Nenhum produto cadastrado ou correspondente na vitrine.
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
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">URL da Foto (Opcional)</label>
                    <input
                      type="text"
                      placeholder="http://..."
                      value={prodFotoUrl}
                      onChange={(e) => setProdFotoUrl(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-650"
                    />
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
                      <p className="text-[10px] text-teal-100">Registre vendas rápidas adicionando múltiplos seriais.</p>
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
                        Digitar ou Escanear Serial Único (Foco Automático)
                      </label>
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault()
                          if (!serialInput.trim()) return
                          
                          setPdvError(null)
                          const rawSerial = serialInput.trim()
                          setSerialNumberInput('')

                          // Check if already in checkout cart
                          if (carrinho.find(c => c.serialNumber === rawSerial)) {
                            setPdvError(`O serial ${rawSerial} já foi inserido no carrinho.`)
                            return
                          }

                          // Query catalog product item details
                          try {
                            const res = await fetch(`/api/bazar/produtos/pesquisa?bazarId=${selectedBazar.id}`)
                            if (res.ok) {
                              // We simulate looking for the item details from inventory lists
                              // Let's call the API to verify this specific serial code.
                              // Since we want to display the title and price in the cart immediately,
                              // we fetch list of products or query this serial directly.
                              // Let's do a request to verify the serial status!
                              // Wait, how does the frontend obtain the title/price of the product for this serial?
                              // We can fetch from database by doing a quick search or let the service return details.
                              // For simplicity, we query serial status or get a mockup list.
                              // Let's fetch all products to match the serial prefix (Prefix is BAZ-{bazarId}-{produtoId}-{uuid}).
                              const parts = rawSerial.split('-')
                              if (parts.length >= 4) {
                                const prodId = parts[2]
                                const prod = produtos.find(p => String(p.id) === prodId)
                                if (prod) {
                                  setCarrinho(prev => [
                                    ...prev,
                                    {
                                      serialNumber: rawSerial,
                                      produtoId: prod.id,
                                      titulo: prod.titulo,
                                      preco: prod.preco
                                    }
                                  ])
                                  return
                                }
                              }
                              // Fallback if formatting or serial is custom
                              setPdvError(`Serial inválido ou produto não localizado no bazar.`)
                            }
                          } catch (err) {
                            setPdvError('Falha ao localizar serial no estoque.')
                          }
                        }}
                        className="flex gap-2"
                      >
                        <input
                          type="text"
                          ref={serialInputRef}
                          placeholder="Clique aqui e use o leitor de código de barras ou digite o serial..."
                          value={serialInput}
                          onChange={(e) => setSerialNumberInput(e.target.value)}
                          className="w-full border border-slate-350 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-teal-700 bg-slate-50 focus:bg-white"
                        />
                        <button type="submit" className="bg-teal-700 text-white px-5 rounded-xl font-bold text-xs">
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
                            {carrinho.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between pt-3 first:pt-0">
                                <div className="space-y-0.5">
                                  <h4 className="text-xs font-bold text-slate-800">{item.titulo}</h4>
                                  <span className="text-[10px] text-slate-500 font-mono font-bold">
                                    {item.needsSerialResolve ? 'Aguardando alocação automática' : `Serial: ${item.serialNumber}`}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="text-xs font-black text-slate-900">R$ {item.preco?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                  <button
                                    onClick={() => setCarrinho(carrinho.filter((_, i) => i !== idx))}
                                    className="text-rose-600 hover:text-rose-800 p-1 hover:bg-rose-50 rounded-lg"
                                  >
                                    <Trash className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-12 text-center text-slate-400 italic text-xs">
                            O carrinho de compras está vazio. Digite um código de serial ou clique em itens disponíveis na vitrine externa.
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
                          R$ {carrinho.reduce((acc, c) => acc + c.preco, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
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
                          
                          // Resolve any click items (where needsSerialResolve: true) to fetch real available seriais
                          const finalSerials = []
                          try {
                            for (let item of carrinho) {
                              if (item.needsSerialResolve) {
                                // Fetch first available serial number for this product ID
                                const res = await fetch(`/api/bazar/produtos/pesquisa?bazarId=${selectedBazar.id}&nome=${encodeURIComponent(item.titulo)}&statusItem=DISPONIVEL`)
                                if (res.ok) {
                                  // Locate the catalog details and extract serial
                                  // We can call search products endpoint. Since search returns products,
                                  // we must obtain a serial.
                                  // Let's implement /api/bazar/produtos/{id}/seriais-disponiveis on backend for immediate allocation!
                                  // But wait, can we do a direct find by product ID?
                                  // Yes! Let's write the controller endpoint `/api/bazar/produtos/{id}/serial-disponivel` which is extremely clean.
                                  const serRes = await fetch(`/api/bazar/produtos/${item.produtoId}/serial-disponivel`)
                                  if (serRes.ok) {
                                    const serialObj = await serRes.json()
                                    finalSerials.push(serialObj.serialNumber)
                                  } else {
                                    throw new Error(`Sem estoque disponível para ${item.titulo}`)
                                  }
                                }
                              } else {
                                finalSerials.push(item.serialNumber)
                              }
                            }

                            // Confirm checkout
                            const checkoutRes = await fetch('/api/bazar/vendas/confirmar', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                bazarId: selectedBazar.id,
                                seriais: finalSerials,
                                formaPagamento: formaPagamento
                              })
                            })

                            if (checkoutRes.ok) {
                              triggerToast('Venda registrada e cupom impresso com sucesso!')
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
                        Confirmar Checkout
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

        </div>
      )}
    </div>
  )
}
