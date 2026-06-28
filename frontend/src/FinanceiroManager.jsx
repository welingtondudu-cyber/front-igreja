import { useState, useEffect } from 'react'
import {
  PieChart, BarChart3, ListFilter, Plus, Download, Trash2,
  Lock, Unlock, FileText, Printer, ArrowLeft, Phone, Users,
  AlertCircle, CheckCircle2, Loader2, Calendar, DollarSign,
  TrendingUp, TrendingDown, Check, X, FileSpreadsheet, ShieldAlert,
  History
} from 'lucide-react'

export default function FinanceiroManager({ initialTab }) {
  // Navigation tabs: 'dashboard' | 'extrato' (which represents the 'Analítico' view now)
  const [activeTab, setActiveTab] = useState(initialTab === 'dashboard' ? 'dashboard' : 'extrato')

  // Sync tab with props
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab === 'dashboard' ? 'dashboard' : 'extrato')
    }
  }, [initialTab])

  // Selected Month/Year state (common to all screens)
  // mes = 0 represents the entire year consolidations
  const [selectedAno, setSelectedAno] = useState(2026)
  const [selectedMes, setSelectedMes] = useState(6) // Junho

  // Data States
  const [dashboardData, setDashboardData] = useState(null)
  const [extratoData, setExtratoData] = useState([])
  const [fechamentosList, setFechamentosList] = useState([])
  const [reaberturasList, setReaberturasList] = useState([])
  const [categorias, setCategorias] = useState([])
  const [membros, setMembros] = useState([])

  // UI Loading/Error States
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  // Selected item checkboxes for batch delete
  const [selectedIds, setSelectedIds] = useState([])

  // Modal States
  const [showLancamentoModal, setShowLancamentoModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showFechamentoConfirmModal, setShowFechamentoConfirmModal] = useState(false)
  const [showReabrirModal, setShowReabrirModal] = useState(false)
  const [showHistoricoModal, setShowHistoricoModal] = useState(false)
  const [showRelatorioModal, setShowRelatorioModal] = useState(false)

  // New Lancamento Form State
  const [lancamentoFormData, setLancamentoFormData] = useState({
    descricao: '',
    valor: '',
    data: '',
    tipoFluxo: 'ENTRADA',
    categoriaId: '',
    membroDizimistaId: ''
  })
  const [formError, setFormError] = useState(null)
  const [formLoading, setFormLoading] = useState(false)

  // CSV Import State
  const [csvFile, setCsvFile] = useState(null)
  const [importLoading, setImportLoading] = useState(false)
  const [importError, setImportError] = useState(null)

  // Re-open period form state
  const [motivoReabertura, setMotivoReabertura] = useState('')
  const [reabrirLoading, setReabrirLoading] = useState(false)
  const [reabrirError, setReabrirError] = useState(null)

  // Get start and end date for the selected period
  const getPeriodoDatas = (ano, mes) => {
    if (mes === 0) {
      // Entire year range
      return { dataInicio: `${ano}-01-01`, dataFim: `${ano}-12-31` }
    }
    const dataInicio = `${ano}-${String(mes).padStart(2, '0')}-01`
    const ultimoDia = new Date(ano, mes, 0).getDate()
    const dataFim = `${ano}-${String(mes).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`
    return { dataInicio, dataFim }
  }

  // Load lists on mount
  useEffect(() => {
    fetchCategorias()
    fetchMembros()
    fetchFechamentos()
    fetchReaberturas()
  }, [])

  // Reload dashboard and ledger when month/year changes
  useEffect(() => {
    if (selectedAno && selectedMes !== undefined) {
      fetchDashboardAndExtrato()
    }
  }, [selectedAno, selectedMes])

  const fetchCategorias = async () => {
    try {
      const res = await fetch('/api/financeiro/categorias')
      if (res.ok) {
        const data = await res.json()
        setCategorias(data)
      }
    } catch (err) {
      console.error('Erro ao carregar categorias:', err)
    }
  }

  const fetchMembros = async () => {
    try {
      // Endpoint dedicado retorna apenas {id, nomeCompleto} dos membros ativos
      const res = await fetch('/api/financeiro/membros-ativos')
      if (res.ok) {
        const data = await res.json()
        setMembros(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error('Erro ao carregar membros:', err)
    }
  }

  const fetchFechamentos = async () => {
    try {
      const res = await fetch('/api/financeiro/fechamentos')
      if (res.ok) {
        const data = await res.json()
        setFechamentosList(data)
      }
    } catch (err) {
      console.error('Erro ao buscar fechamentos:', err)
    }
  }

  const fetchReaberturas = async () => {
    try {
      const res = await fetch('/api/financeiro/fechamentos/reaberturas')
      if (res.ok) {
        const data = await res.json()
        setReaberturasList(data)
      }
    } catch (err) {
      console.error('Erro ao carregar histórico de reaberturas:', err)
    }
  }

  const fetchDashboardAndExtrato = async () => {
    setLoading(true)
    setError(null)
    const { dataInicio, dataFim } = getPeriodoDatas(selectedAno, selectedMes)

    try {
      // Carrega Dashboard
      const dashRes = await fetch(`/api/financeiro/dashboard?dataInicio=${dataInicio}&dataFim=${dataFim}`)
      if (dashRes.ok) {
        const dashData = await dashRes.json()
        setDashboardData(dashData)
      } else {
        const errObj = await dashRes.json()
        setError(errObj.detail || 'Erro ao carregar dados do dashboard.')
      }

      // Carrega Extrato
      const extRes = await fetch(`/api/financeiro/extrato?dataInicio=${dataInicio}&dataFim=${dataFim}`)
      if (extRes.ok) {
        const extData = await extRes.json()
        setExtratoData(extData)
      }

      // Limpa checkboxes de exclusão
      setSelectedIds([])
    } catch (err) {
      setError('Falha de conexão com o servidor.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Format currency
  const formatBRL = (val) => {
    if (val === undefined || val === null) return 'R$ 0,00'
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  // Helper to check if current selected competence is locked
  const isCompetenciaTrancada = () => {
    return fechamentosList.some(f => f.ano === selectedAno && f.mes === selectedMes)
  }

  // Handle Lancamento Submit
  const handleSaveLancamento = async (e) => {
    e.preventDefault()
    setFormError(null)
    setFormLoading(true)

    if (!lancamentoFormData.descricao) {
      setFormError('A descrição é obrigatória')
      setFormLoading(false)
      return
    }
    if (!lancamentoFormData.valor || parseFloat(lancamentoFormData.valor) <= 0) {
      setFormError('O valor deve ser positivo')
      setFormLoading(false)
      return
    }
    if (!lancamentoFormData.data) {
      setFormError('A data é obrigatória')
      setFormLoading(false)
      return
    }
    if (!lancamentoFormData.categoriaId) {
      setFormError('Selecione uma categoria')
      setFormLoading(false)
      return
    }

    try {
      const membroId = lancamentoFormData.membroDizimistaId
        ? parseInt(lancamentoFormData.membroDizimistaId, 10)
        : null
      const payload = {
        descricao: lancamentoFormData.descricao,
        valor: parseFloat(lancamentoFormData.valor),
        data: lancamentoFormData.data,
        tipoFluxo: lancamentoFormData.tipoFluxo,
        categoriaId: parseInt(lancamentoFormData.categoriaId, 10),
        membroDizimistaId: membroId
      }

      const res = await fetch('/api/financeiro/extrato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        showSuccess('Lançamento cadastrado com sucesso!')
        setShowLancamentoModal(false)
        setLancamentoFormData({
          descricao: '',
          valor: '',
          data: '',
          tipoFluxo: 'ENTRADA',
          categoriaId: '',
          membroDizimistaId: ''
        })
        fetchDashboardAndExtrato()
      } else {
        const errObj = await res.json()
        setFormError(errObj.detail || 'Erro ao salvar lançamento. Verifique se o período não está encerrado.')
      }
    } catch (err) {
      setFormError('Falha ao se conectar ao servidor.')
    } finally {
      setFormLoading(false)
    }
  }

  // Handle CSV Import Submit
  const handleImportCsv = async (e) => {
    e.preventDefault()
    setImportError(null)
    setImportLoading(true)

    if (!csvFile) {
      setImportError('Selecione o arquivo CSV antes')
      setImportLoading(false)
      return
    }

    const formData = new FormData()
    formData.append('file', csvFile)

    try {
      const res = await fetch('/api/financeiro/extrato/importar', {
        method: 'POST',
        body: formData
      })

      if (res.ok) {
        showSuccess('Extrato importado com sucesso!')
        setShowImportModal(false)
        setCsvFile(null)
        fetchDashboardAndExtrato()
      } else {
        const errObj = await res.json()
        setImportError(errObj.detail || 'Falha ao processar o extrato bancário.')
      }
    } catch (err) {
      setImportError('Erro ao enviar arquivo para o servidor.')
    } finally {
      setImportLoading(false)
    }
  }

  // Handle Batch Delete
  const handleExcluirLote = async () => {
    if (selectedIds.length === 0) return
    if (!window.confirm(`Deseja realmente excluir as ${selectedIds.length} transações selecionadas?`)) return

    setLoading(true)
    try {
      const res = await fetch('/api/financeiro/extrato', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      })

      if (res.ok) {
        showSuccess('Transações excluídas com sucesso!')
        fetchDashboardAndExtrato()
      } else {
        const errObj = await res.json()
        alert(errObj.detail || 'Falha ao excluir transações. Uma ou mais competências podem estar encerradas.')
        fetchDashboardAndExtrato()
      }
    } catch (err) {
      alert('Erro de conexão ao remover lançamentos.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Close Competence (Monthly or Annual)
  const handleEncerrarCompetencia = async () => {
    setShowFechamentoConfirmModal(false)
    setLoading(true)

    try {
      const res = await fetch(`/api/financeiro/fechamentos/encerrar?ano=${selectedAno}&mes=${selectedMes}`, {
        method: 'POST'
      })

      if (res.ok) {
        const periodName = selectedMes === 0 ? `Ano de ${selectedAno}` : `${String(selectedMes).padStart(2, '0')}/${selectedAno}`
        showSuccess(`Competência ${periodName} encerrada e trancada com sucesso!`)
        fetchFechamentos()
        fetchDashboardAndExtrato()
      } else {
        const errObj = await res.json()
        alert(errObj.detail || 'Erro ao fechar competência.')
      }
    } catch (err) {
      alert('Falha na comunicação com o servidor.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Reopen Competence
  const handleReabrirCompetencia = async (e) => {
    e.preventDefault()
    setReabrirError(null)
    setReabrirLoading(true)

    if (!motivoReabertura.trim()) {
      setReabrirError('Informe um motivo para justificar a reabertura do período.')
      setReabrirLoading(false)
      return
    }

    try {
      const res = await fetch(`/api/financeiro/fechamentos/reabrir?ano=${selectedAno}&mes=${selectedMes}&motivo=${encodeURIComponent(motivoReabertura)}`, {
        method: 'POST'
      })

      if (res.ok) {
        const periodName = selectedMes === 0 ? `Ano de ${selectedAno}` : `${String(selectedMes).padStart(2, '0')}/${selectedAno}`
        showSuccess(`Competência ${periodName} reaberta com sucesso!`)
        setShowReabrirModal(false)
        setMotivoReabertura('')
        fetchFechamentos()
        fetchReaberturas()
        fetchDashboardAndExtrato()
      } else {
        const errObj = await res.json()
        setReabrirError(errObj.detail || 'Falha ao reabrir competência.')
      }
    } catch (err) {
      setReabrirError('Erro de conexão ao reabrir o período.')
    } finally {
      setReabrirLoading(false)
    }
  }

  const handlePrint = (tipo) => {
    const originalTitle = document.title
    const mesLabel = selectedMes === 0 ? 'Anual' : String(selectedMes).padStart(2, '0')
    const periodo = `${mesLabel}-${selectedAno}`
    
    if (tipo === 'dashboard') {
      document.title = `dashboard financeiro ${periodo}`
    } else {
      document.title = `relatorio auditoria ${periodo}`
    }
    
    window.print()
    
    setTimeout(() => {
      document.title = originalTitle
    }, 1000)
  }

  const triggerDashboardPrint = () => {
    handlePrint('dashboard')
  }

  const Long = (val) => {
    if (!val) return null
    return parseInt(val, 10)
  }

  const showSuccess = (msg) => {
    setSuccessMessage(msg)
    setTimeout(() => setSuccessMessage(null), 5000)
  }

  const filteredCategorias = categorias.filter(c => c.tipoFluxo === lancamentoFormData.tipoFluxo)

  const meses = [
    { value: 0, label: 'Ano Completo (Consolidado)' },
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' }
  ]

  // Dynamic titles depending on active view
  const getTituloTela = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboards Financeiros'
      case 'extrato':
        return 'Analítico Financeiro'
      default:
        return 'Financeiro Analítico'
    }
  }

  const renderSelectorPeriodo = () => {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-2.5 shadow-sm">
          <Calendar className="h-4 w-4 text-emerald-700 shrink-0" />
          <select
            value={selectedMes}
            onChange={(e) => setSelectedMes(parseInt(e.target.value))}
            className="bg-transparent font-bold text-slate-800 text-sm focus:outline-none border-none cursor-pointer"
          >
            {meses.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <div className="w-[1px] h-4 bg-slate-200"></div>
          <select
            value={selectedAno}
            onChange={(e) => setSelectedAno(parseInt(e.target.value))}
            className="bg-transparent font-bold text-slate-800 text-sm focus:outline-none border-none cursor-pointer"
          >
            {(() => {
              const anoAtual = new Date().getFullYear()
              return [anoAtual - 2, anoAtual - 1, anoAtual, anoAtual + 1].map(a => (
                <option key={a} value={a}>{a}</option>
              ))
            })()}
          </select>
        </div>
        {/* Botão Histórico ao lado do filtro de período */}
        <button
          onClick={() => setShowHistoricoModal(true)}
          title="Ver Histórico de Auditoria e Fechamentos"
          className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl shadow-sm transition-all"
        >
          <History className="h-4 w-4" />
        </button>
      </div>
    )
  }

  const handleCheckboxToggle = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedIds.length === extratoData.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(extratoData.map(l => l.id))
    }
  }

  // --- MACROS   // Cards de macro dados — usados em dashboard e analítico
  const renderMacroCards = () => {
    if (!dashboardData) return null

    const {
      receitaOperacional, receitaTendenciaPercentual,
      despesasConsolidadas, despesasTendenciaPercentual,
      saldoDoMes,
      dizimistasAtivosPercentual, dizimistasAtivosTendenciaPercentual
    } = dashboardData

    // Calcula número absoluto de dizimistas a partir da %
    const totalMembrosAtivos = dashboardData.totalMembrosAtivos

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print-grid">
        {/* Receitas */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm print:border-slate-300 print:p-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block print:text-[9px]">Receitas Consolidadas</span>
          <span className="text-2xl font-bold text-slate-800 block mt-1 print:text-lg print:text-slate-950 print:font-extrabold">{formatBRL(receitaOperacional)}</span>
          {receitaTendenciaPercentual !== null && receitaTendenciaPercentual !== undefined ? (
            <span className={`text-xs font-semibold mt-1.5 flex items-center gap-1 print:hidden ${
              receitaTendenciaPercentual >= 0 ? 'text-emerald-600' : 'text-red-500'
            }`}>
              {receitaTendenciaPercentual >= 0 ? (
                <><TrendingUp className="h-3 w-3" /> ▲ +{receitaTendenciaPercentual.toFixed(1)}% vs anterior</>
              ) : (
                <><TrendingDown className="h-3 w-3" /> ▼ {receitaTendenciaPercentual.toFixed(1)}% vs anterior</>
              )}
            </span>
          ) : null}
        </div>

        {/* Despesas */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm print:border-slate-300 print:p-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block print:text-[9px]">Despesas Consolidadas</span>
          <span className="text-2xl font-bold text-slate-800 block mt-1 print:text-lg print:text-slate-950 print:font-extrabold">{formatBRL(despesasConsolidadas)}</span>
          {despesasTendenciaPercentual !== null && despesasTendenciaPercentual !== undefined ? (
            <span className={`text-xs font-semibold mt-1.5 flex items-center gap-1 print:hidden ${
              despesasTendenciaPercentual <= 0 ? 'text-emerald-600' : 'text-red-500'
            }`}>
              {despesasTendenciaPercentual <= 0 ? (
                <><TrendingDown className="h-3 w-3" /> ▼ {despesasTendenciaPercentual.toFixed(1)}% vs anterior</>
              ) : (
                <><TrendingUp className="h-3 w-3" /> ▲ +{despesasTendenciaPercentual.toFixed(1)}% vs anterior</>
              )}
            </span>
          ) : null}
        </div>

        {/* Saldo */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm print:border-slate-300 print:p-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block print:text-[9px]">Saldo Líquido</span>
          <span className={`text-2xl font-bold block mt-1 print:text-lg print:text-slate-950 print:font-extrabold ${saldoDoMes >= 0 ? 'text-emerald-800' : 'text-red-800'}`}>
            {formatBRL(saldoDoMes)}
          </span>
        </div>

        {/* Dizimistas */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm print:border-slate-300 print:p-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block print:text-[9px]">Dizimistas</span>
          <span className="text-2xl font-bold text-emerald-800 block mt-1 print:text-lg print:text-emerald-950 print:font-extrabold">
            {dizimistasAtivosPercentual.toFixed(0)}%
          </span>
          <span className="text-[10px] text-slate-400 font-semibold block mt-0.5 print:text-[8px]">dos membros ativos</span>
          {dizimistasAtivosTendenciaPercentual !== null && dizimistasAtivosTendenciaPercentual !== undefined ? (
            <span className={`text-xs font-semibold mt-1 flex items-center gap-1 print:hidden ${
              dizimistasAtivosTendenciaPercentual >= 0 ? 'text-emerald-600' : 'text-red-500'
            }`}>
              {dizimistasAtivosTendenciaPercentual >= 0 ? (
                <><TrendingUp className="h-3 w-3" /> ▲ +{dizimistasAtivosTendenciaPercentual.toFixed(0)}pp vs anterior</>
              ) : (
                <><TrendingDown className="h-3 w-3" /> ▼ {dizimistasAtivosTendenciaPercentual.toFixed(0)}pp vs anterior</>
              )}
            </span>
          ) : null}
        </div>
      </div>
    )
  }

  // --- SUB VIEW 1: DASHBOARD ---
  const renderDashboard = () => {
    if (!dashboardData) return (
      <div className="p-16 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-2xl shadow-sm">
        <BarChart3 className="h-12 w-12 text-slate-200 mb-3" />
        <span className="text-sm font-semibold text-slate-400">Nenhum dado financeiro para o período selecionado.</span>
        <span className="text-xs text-slate-300 mt-1">Cadastre lançamentos no Analítico Financeiro para visualizar o dashboard.</span>
      </div>
    )

    const {
      distribuicaoEntradas, distribuicaoSaidas,
      historicoSaldos
    } = dashboardData

    const ultimosMeses = [...historicoSaldos]
      .filter(f => (f.entradasDoMes > 0 || f.saidasDoMes > 0))

    const maxValHistorico = ultimosMeses.reduce((acc, curr) => {
      const valEntradas = curr.entradasDoMes || 0
      const valSaidas = curr.saidasDoMes || 0
      return Math.max(acc, valEntradas, valSaidas)
    }, 1000)

    const getBarHeightPercent = (val) => {
      if (!val || val <= 0) return '0%'
      const pct = (val / maxValHistorico) * 85
      return `${Math.max(5, pct)}%`
    }

    const formatCompact = (val) => {
      if (!val || val <= 0) return ''
      if (val >= 1000) {
        return `R$ ${(val / 1000).toFixed(1)}K`.replace('.', ',').replace(',0K', 'K')
      }
      return `R$ ${Math.round(val)}`
    }

    return (
      <div id="secao-imprimivel" className="space-y-6 print:p-0 print:border-none print:shadow-none print:w-[100%] print:max-w-[100%]">
        
        {/* Identidade Visual do Dashboard de Impressão */}
        <div className="hidden print:flex items-center justify-between border-b border-slate-350 pb-4 mb-4 select-none">
          <div className="flex gap-4 items-center">
            <img
              src="/logo.png"
              alt="Logo da Igreja"
              className="w-20 h-20 object-contain"
            />
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Igreja Presbiteriana do Ipês</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dashboards Financeiros Consolidado</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Competência</span>
            <span className="text-xs font-bold text-slate-700">{selectedMes === 0 ? `Ano Completo / ${selectedAno}` : `${meses.find(m => m.value === selectedMes)?.label} / ${selectedAno}`}</span>
          </div>
        </div>

        {/* Cards de Macro Dados */}
        {renderMacroCards()}

        {/* Charts & Graphs */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Histórico */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4 print:border-slate-300 print:p-4 print:space-y-2">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 print:pb-1.5 print:border-slate-200">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider print:text-[9px]">Histórico de Entradas vs Saídas ({selectedAno})</h3>
            </div>

            {ultimosMeses.length > 0 ? (
              <>
                <div className="flex gap-4 pt-4 print:pt-1 select-none">
                  <div className="flex flex-col justify-between text-[9px] text-slate-400 h-44 pb-6 print:h-28 print:pb-4 font-mono">
                    <span className="print:hidden">{formatBRL(maxValHistorico)}</span>
                    <span className="print:hidden">{formatBRL(maxValHistorico * 0.5)}</span>
                    <span className="hidden print:block">{formatCompact(maxValHistorico)}</span>
                    <span className="hidden print:block">{formatCompact(maxValHistorico * 0.5)}</span>
                    <span>R$ 0</span>
                  </div>

                  <div className="flex-grow relative h-44 print:h-28 border-b border-l border-slate-200 print:border-slate-300">
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                      <div className="w-full border-t border-slate-100 print:border-slate-200"></div>
                      <div className="w-full border-t border-slate-100 print:border-slate-200"></div>
                      <div className="w-full"></div>
                    </div>

                    <div className="absolute inset-0 flex items-end justify-around px-2">
                      {ultimosMeses.map((f, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-1.5 w-[7%] relative">
                          <div className="flex items-end gap-0.5 h-32 print:h-24">
                            <div
                              className="bg-emerald-600 w-1.5 sm:w-2.5 rounded-t transition-all hover:bg-emerald-500 relative group"
                              style={{ height: getBarHeightPercent(f.entradasDoMes) }}
                            >
                              {f.entradasDoMes > 0 && (
                                <span className="hidden print:block absolute bottom-full left-1/2 -translate-x-1/2 mb-0.5 text-[7px] font-bold text-emerald-800 whitespace-nowrap">
                                  {formatCompact(f.entradasDoMes)}
                                </span>
                              )}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-800 text-white text-[9px] font-mono py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                                {formatBRL(f.entradasDoMes)}
                              </div>
                            </div>
                            <div
                              className="bg-amber-500 w-1.5 sm:w-2.5 rounded-t transition-all hover:bg-amber-400 relative group"
                              style={{ height: getBarHeightPercent(f.saidasDoMes) }}
                            >
                              {f.saidasDoMes > 0 && (
                                <span className="hidden print:block absolute bottom-full left-1/2 -translate-x-1/2 mb-0.5 text-[7px] font-bold text-amber-700 whitespace-nowrap">
                                  {formatCompact(f.saidasDoMes)}
                                </span>
                              )}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-800 text-white text-[9px] font-mono py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                                {formatBRL(f.saidasDoMes)}
                              </div>
                            </div>
                          </div>
                          <span className="text-[8px] font-bold text-slate-500 mt-1 select-none">
                            {f.mes === 0 ? 'Ano' : meses.find(m => m.value === f.mes)?.label.slice(0, 3)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-center gap-4 text-xs font-semibold pt-2 print:pt-1 print:text-[9px]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-emerald-600 rounded"></div>
                    <span className="text-slate-600">Receitas</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-amber-500 rounded"></div>
                    <span className="text-slate-600">Despesas</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-44 print:h-28 flex flex-col items-center justify-center text-slate-400 text-xs">
                <ShieldAlert className="h-8 w-8 text-slate-300 mb-1" />
                Nenhum lançamento financeiro para o ano.
              </div>
            )}
          </div>

          {/* Categorias e distribuicoes */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 print:gap-4">
            {/* Entradas */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4 print:border-slate-300 print:p-4 print:space-y-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 print:pb-1 print:text-[9px] print:border-slate-200">Origem das Receitas</h3>
              {distribuicaoEntradas.length > 0 ? (
                <div className="space-y-3.5 print:space-y-2">
                  {distribuicaoEntradas.slice(0, 5).map((e, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-center text-xs print:text-[9px]">
                        <span className="font-semibold text-slate-600 truncate max-w-[70%]">{e.nome}</span>
                        <span className="font-bold text-slate-850">{e.percentualQueRepresenta.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 print:h-1">
                        <div
                          className="bg-emerald-600 h-1.5 print:h-1 rounded-full"
                          style={{ width: `${e.percentualQueRepresenta}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">Sem receitas no período.</div>
              )}
            </div>

            {/* Saídas */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4 print:border-slate-300 print:p-4 print:space-y-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 print:pb-1 print:text-[9px] print:border-slate-200">Destinação das Saídas</h3>
              {distribuicaoSaidas.length > 0 ? (
                <div className="space-y-3.5 print:space-y-2">
                  {distribuicaoSaidas.slice(0, 5).map((s, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-center text-xs print:text-[9px]">
                        <span className="font-semibold text-slate-600 truncate max-w-[70%]">{s.nome}</span>
                        <span className="font-bold text-slate-850">{s.percentualQueRepresenta.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 print:h-1">
                        <div
                          className="bg-amber-500 h-1.5 print:h-1 rounded-full"
                          style={{ width: `${s.percentualQueRepresenta}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">Sem despesas no período.</div>
              )}
            </div>
          </div>
        </div>

        {/* Print button on Dashboard */}
        <div className="print:hidden flex justify-end">
          <button
            onClick={triggerDashboardPrint}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Printer className="h-4 w-4" />
            Imprimir
          </button>
        </div>
      </div>
    )
  }

  // --- SUB VIEW 2: ANALÍTICO (EXTRATO COM FECHAMENTO E MACROS DADOS) ---
  const renderAnalitico = () => {
    const trancado = isCompetenciaTrancada()
    const periodName = selectedMes === 0 ? `Ano de ${selectedAno}` : `${meses.find(m => m.value === selectedMes)?.label} de ${selectedAno}`

    return (
      <div className="space-y-6">
        {/* 1. Macros dados consolidados (Cards) */}
        {renderMacroCards()}

        {/* 2. Painel de Fechamento de Auditoria integrado */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
          <div className="md:col-span-2 space-y-1.5">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-800">
                Fechamento de Auditoria: {periodName}
              </h3>
              {trancado ? (
                <span className="flex items-center gap-1 px-2.5 py-0.5 bg-red-50 border border-red-250 text-red-800 text-[10px] font-extrabold rounded-full uppercase tracking-wider animate-pulse">
                  <Lock className="h-3 w-3" />
                  Trancada
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 border border-emerald-250 text-emerald-800 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                  <Unlock className="h-3 w-3" />
                  Aberta
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Trancar a competência consolida os saldos e impede edições retroativas. Reabrir requer justificativa para futuras auditorias regimentais.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row md:flex-col justify-center items-stretch md:items-end gap-2.5">
            {trancado ? (
              <button
                onClick={() => setShowReabrirModal(true)}
                className="flex-1 md:w-full flex items-center justify-center gap-2 border border-amber-300 hover:bg-amber-50 text-amber-800 rounded-xl py-1.5 px-3 text-xs font-bold transition-all"
              >
                <Unlock className="h-3 w-3.5 text-amber-600" />
                Reabrir Período
              </button>
            ) : (
              <button
                onClick={() => setShowFechamentoConfirmModal(true)}
                className="flex-1 md:w-full flex items-center justify-center gap-1.5 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl py-1.5 px-3 text-[11px] font-bold transition-all shadow-sm"
              >
                <Lock className="h-3 w-3.5 text-red-600" />
                Encerrar Competência
              </button>
            )}
          </div>
        </div>

        {/* 3. Tabela do Analítico com Botões de Ações */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center bg-white p-4 border border-slate-200 rounded-2xl shadow-sm">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest pl-1">Lançamentos no Período</span>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {selectedIds.length > 0 && !trancado && (
                <button
                  onClick={handleExcluirLote}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-250 rounded-xl text-xs font-bold transition-all w-full sm:w-auto shadow-sm"
                >
                  <Trash2 className="h-4 w-4 shrink-0 text-red-650" />
                  Remover ({selectedIds.length})
                </button>
              )}
              
              {/* Botão de emissão de relatório na própria tela */}
              <button
                onClick={() => setShowRelatorioModal(true)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                <FileText className="h-4 w-4 shrink-0 text-emerald-700" />
                Emitir Relatório de Auditoria
              </button>

              {!trancado && (
                <>
                  <button
                    onClick={() => setShowImportModal(true)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all"
                  >
                    <FileSpreadsheet className="h-4 w-4 shrink-0 text-emerald-700" />
                    Importar Extrato PJ
                  </button>
                  <button
                    onClick={() => setShowLancamentoModal(true)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow"
                  >
                    <Plus className="h-4.5 w-4.5 shrink-0" />
                    Novo Lançamento
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100 select-none">
                    {!trancado && (
                      <th className="px-6 py-4 w-12 text-center">
                        <input
                          type="checkbox"
                          checked={extratoData.length > 0 && selectedIds.length === extratoData.length}
                          onChange={handleSelectAll}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer w-4 h-4"
                        />
                      </th>
                    )}
                    <th className="px-6 py-4">Data</th>
                    <th className="px-6 py-4">Descrição</th>
                    <th className="px-6 py-4">Categoria</th>
                    <th className="px-6 py-4">Fluxo</th>
                    <th className="px-6 py-4">Valor</th>
                    <th className="px-6 py-4">Contribuinte</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {extratoData.length > 0 ? (
                    extratoData.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                        {!trancado && (
                          <td className="px-6 py-4 text-center">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(row.id)}
                              onChange={() => handleCheckboxToggle(row.id)}
                              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer w-4 h-4"
                            />
                          </td>
                        )}
                        <td className="px-6 py-4 font-semibold text-slate-400 font-mono whitespace-nowrap">
                          {new Date(row.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800 truncate max-w-[200px]" title={row.descricao}>
                          {row.descricao}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                            {row.nomeCategoria}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold whitespace-nowrap">
                          <span className={row.tipoFluxo === 'ENTRADA' ? 'text-emerald-700' : 'text-amber-600'}>
                            {row.tipoFluxo === 'ENTRADA' ? 'Receita' : 'Despesa'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold whitespace-nowrap">
                          {formatBRL(row.valor)}
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-semibold truncate max-w-[150px]" title={row.nomeMembroDizimista}>
                          {row.nomeMembroDizimista || '-'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={trancado ? 6 : 7} className="px-6 py-12 text-center text-slate-400">
                        <DollarSign className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                        Nenhum lançamento financeiro registrado para este período.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estilos CSS Dinâmicos de Impressão (Fundo colorido das barras e zoom de 1 folha A4 no dash) */}
      <style>{`
        @media print {
          /* Force color adjust in printing background bars */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          body * {
            visibility: hidden;
          }
          
          #secao-imprimivel, #secao-imprimivel * {
            visibility: visible;
          }
          
          #secao-imprimivel {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
          
          /* Special scale and layout force for A4 landscape dashboard */
          ${activeTab === 'dashboard' ? `
            #secao-imprimivel {
              transform: scale(0.95);
              transform-origin: top left;
              width: 105% !important;
            }
            #secao-imprimivel .grid {
              display: grid !important;
            }
            #secao-imprimivel .grid-cols-2,
            #secao-imprimivel .print-grid {
              grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
            }
            #secao-imprimivel .grid-cols-1 {
              grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
            }
            #secao-imprimivel .lg\\:col-span-2 {
              grid-column: span 2 / span 2 !important;
            }
            #secao-imprimivel .lg\\:col-span-2 .grid {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }
          ` : ''}
          
          @page {
            size: ${activeTab === 'dashboard' ? 'A4 landscape' : 'A4 portrait'};
            margin: 0.4cm;
          }
        }
      `}</style>

      {/* SUCCESS ALERTS */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300 z-50 text-sm font-semibold">
          <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0" />
          {successMessage}
        </div>
      )}

      {/* HEADER BAR (Hidden in print) */}
      <div className="print:hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{getTituloTela()}</h1>
          <p className="text-sm text-slate-500 mt-1">Gestão de dízimos, despesas e auditoria de competências mensais ou anuais.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {renderSelectorPeriodo()}
        </div>
      </div>

      {/* CONTENT SWITCHER */}
      <div className="print:block">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-2xl shadow-sm">
            <Loader2 className="h-10 w-10 text-emerald-700 animate-spin mb-2" />
            <span className="text-sm font-medium text-slate-600">Buscando dados financeiros...</span>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 text-red-700 border border-red-200 rounded-2xl flex gap-3 items-center">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'extrato' && renderAnalitico()}
          </>
        )}
      </div>

      {/* MODAL 1: CADASTRO MANUAL (Hidden in print) */}
      {showLancamentoModal && (
        <div className="print:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center bg-slate-50 px-6 py-4 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Novo Lançamento Financeiro</h3>
              <button
                onClick={() => {
                  setShowLancamentoModal(false)
                  setFormError(null)
                }}
                className="p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-lg transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLancamento} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 text-red-700 text-xs font-semibold p-3 border border-red-200 rounded-xl flex gap-2 items-center">
                  <AlertCircle className="h-4.5 w-4.5 text-red-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Descrição</label>
                <input
                  type="text"
                  placeholder="Ex: Pagamento Neonergia..."
                  value={lancamentoFormData.descricao}
                  onChange={(e) => setLancamentoFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={lancamentoFormData.valor}
                    onChange={(e) => setLancamentoFormData(prev => ({ ...prev, valor: e.target.value }))}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Data</label>
                  <input
                    type="date"
                    value={lancamentoFormData.data}
                    onChange={(e) => setLancamentoFormData(prev => ({ ...prev, data: e.target.value }))}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Fluxo</label>
                  <select
                    value={lancamentoFormData.tipoFluxo}
                    onChange={(e) => setLancamentoFormData(prev => ({ ...prev, tipoFluxo: e.target.value, categoriaId: '' }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white"
                  >
                    <option value="ENTRADA">Receita (Entrada)</option>
                    <option value="SAIDA">Despesa (Saída)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Categoria</label>
                  <select
                    value={lancamentoFormData.categoriaId}
                    onChange={(e) => setLancamentoFormData(prev => ({ ...prev, categoriaId: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white"
                  >
                    <option value="">Selecione...</option>
                    {filteredCategorias.map(c => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              {lancamentoFormData.tipoFluxo === 'ENTRADA' && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Membro Contribuinte (Opcional)</label>
                  <select
                    value={lancamentoFormData.membroDizimistaId}
                    onChange={(e) => setLancamentoFormData(prev => ({ ...prev, membroDizimistaId: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white"
                  >
                    <option value="">Nenhum</option>
                    {membros.map(m => (
                      <option key={m.id} value={m.id}>{m.nomeCompleto}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowLancamentoModal(false)
                    setFormError(null)
                  }}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Salvando...
                    </>
                  ) : 'Salvar Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: IMPORTAÇÃO CSV (Hidden in print) */}
      {showImportModal && (
        <div className="print:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center bg-slate-50 px-6 py-4 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Importar Extrato Bradesco PJ</h3>
              <button
                onClick={() => {
                  setShowImportModal(false)
                  setImportError(null)
                  setCsvFile(null)
                }}
                className="p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-lg transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleImportCsv} className="p-6 space-y-4">
              {importError && (
                <div className="bg-red-50 text-red-700 text-xs font-semibold p-3 border border-red-200 rounded-xl flex gap-2 items-center">
                  <AlertCircle className="h-4.5 w-4.5 text-red-600 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50 hover:bg-slate-100/50 transition-all relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <FileSpreadsheet className="h-10 w-10 text-emerald-600 mx-auto mb-2" />
                <span className="text-xs text-slate-500 font-bold block">
                  {csvFile ? csvFile.name : 'Selecione o extrato .csv'}
                </span>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowImportModal(false)
                    setImportError(null)
                    setCsvFile(null)
                  }}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={importLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {importLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Importando...
                    </>
                  ) : 'Processar Extrato'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CONFIRMAÇÃO DE FECHAMENTO (Hidden in print) */}
      {showFechamentoConfirmModal && dashboardData && (
        <div className="print:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center bg-red-50 px-6 py-4 border-b border-red-100">
              <h3 className="font-extrabold text-red-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="h-4.5 w-4.5 text-red-700" />
                Confirmar Fechamento
              </h3>
              <button
                onClick={() => setShowFechamentoConfirmModal(false)}
                className="p-1 text-red-400 hover:bg-red-100 hover:text-red-700 rounded-lg transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-left">
              <div className="space-y-1.5 bg-slate-50 p-4 border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Resumo Consolidação</span>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="text-slate-600 font-semibold">Total Receitas:</div>
                  <div className="text-emerald-700 font-bold text-right">{formatBRL(dashboardData.receitaOperacional)}</div>
                  <div className="text-slate-600 font-semibold">Total Despesas:</div>
                  <div className="text-red-600 font-bold text-right">{formatBRL(dashboardData.despesasConsolidadas)}</div>
                  <div className="text-slate-600 font-semibold border-t border-slate-200 pt-1.5">Resultado Líquido:</div>
                  <div className={`font-extrabold text-right border-t border-slate-200 pt-1.5 ${
                    dashboardData.saldoDoMes >= 0 ? 'text-emerald-800' : 'text-red-700'
                  }`}>{formatBRL(dashboardData.saldoDoMes)}</div>
                </div>
              </div>

              <div className="text-xs text-red-700 leading-relaxed bg-red-50/50 p-3 border border-red-200/50 rounded-xl flex gap-2.5 items-start">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <span>
                  Trancar esse período ({selectedMes === 0 ? `Ano ${selectedAno}` : `${meses.find(m => m.value === selectedMes)?.label}/${selectedAno}`}) consolida os saldos de caixa e impede qualquer alteração retroativa de transações.
                </span>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  onClick={() => setShowFechamentoConfirmModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEncerrarCompetencia}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-xs shadow-sm"
                >
                  Confirmar Encerramento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: REABERTURA DE PERÍODO (Hidden in print) */}
      {showReabrirModal && (
        <div className="print:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center bg-amber-50 px-6 py-4 border-b border-amber-100">
              <h3 className="font-extrabold text-amber-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Unlock className="h-4.5 w-4.5 text-amber-700" />
                Reabrir Competência Trancada
              </h3>
              <button
                onClick={() => {
                  setShowReabrirModal(false)
                  setReabrirError(null)
                  setMotivoReabertura('')
                }}
                className="p-1 text-amber-400 hover:bg-amber-100 hover:text-amber-700 rounded-lg transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleReabrirCompetencia} className="p-6 space-y-4 text-left">
              {reabrirError && (
                <div className="bg-red-50 text-red-700 text-xs font-semibold p-3 border border-red-200 rounded-xl flex gap-2 items-center">
                  <AlertCircle className="h-4.5 w-4.5 text-red-600 shrink-0" />
                  <span>{reabrirError}</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Justificativa / Motivo da Reabertura</label>
                <textarea
                  placeholder="Descreva detalhadamente o motivo da reabertura..."
                  value={motivoReabertura}
                  onChange={(e) => setMotivoReabertura(e.target.value)}
                  rows="3"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 bg-white"
                ></textarea>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowReabrirModal(false)
                    setReabrirError(null)
                    setMotivoReabertura('')
                  }}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={reabrirLoading}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-xs shadow-sm flex items-center justify-center gap-1.5"
                >
                  {reabrirLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Reabrindo...
                    </>
                  ) : 'Reabrir Período'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: DISCRETA DE HISTÓRICO DE AUDITORIA (FECHAMENTOS E REABERTURAS) */}
      {showHistoricoModal && (
        <div className="print:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center bg-slate-50 px-6 py-4 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <History className="h-4.5 w-4.5 text-slate-600" />
                Histórico de Auditoria & Competências
              </h3>
              <button
                onClick={() => setShowHistoricoModal(false)}
                className="p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-lg transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Fechamentos */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider pl-1">Períodos Trancados</h4>
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 text-[8px] font-bold uppercase tracking-wider border-b border-slate-100 select-none">
                        <th className="px-4 py-2.5">Período</th>
                        <th className="px-4 py-2.5">Saldo Inicial</th>
                        <th className="px-4 py-2.5">Receitas</th>
                        <th className="px-4 py-2.5">Despesas</th>
                        <th className="px-4 py-2.5">Saldo Final</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {fechamentosList.length > 0 ? (
                        fechamentosList.map((f) => (
                          <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-2.5 font-bold text-slate-800">
                              {f.mes === 0 ? `Ano ${f.ano}` : `${meses.find(m => m.value === f.mes)?.label} de ${f.ano}`}
                            </td>
                            <td className="px-4 py-2.5 font-mono text-slate-400">{formatBRL(f.saldoInicial)}</td>
                            <td className="px-4 py-2.5 font-mono text-emerald-700 font-semibold">{formatBRL(f.entradasDoMes)}</td>
                            <td className="px-4 py-2.5 font-mono text-amber-600 font-semibold">{formatBRL(f.saidasDoMes)}</td>
                            <td className="px-4 py-2.5 font-mono font-bold text-emerald-800">{formatBRL(f.saldoFinal)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-4 py-6 text-center text-slate-400 italic">Sem registros.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Reaberturas */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider pl-1">Histórico de Reaberturas</h4>
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
                  {reaberturasList.length > 0 ? (
                    reaberturasList.map((log) => (
                      <div key={log.id} className="border-l-2 border-amber-400 pl-3 py-1 space-y-0.5 text-xs">
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                          <span>{log.mes === 0 ? `Ano ${log.ano}` : `${String(log.mes).padStart(2, '0')}/${log.ano}`}</span>
                          <span>{new Date(log.dataReabertura).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <p className="font-bold text-slate-700">
                          "{log.motivo}"
                        </p>
                        <span className="text-[9px] text-slate-400 uppercase font-semibold">Auditor: Admin (ID: {log.usuarioId})</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-slate-400 italic text-xs">
                      Nenhuma reabertura de período registrada.
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50">
              <button
                onClick={() => setShowHistoricoModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl text-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: EMISSÃO E VISUALIZAÇÃO DO RELATÓRIO DE AUDITORIA A4 (CONCENTRADO NO ANALÍTICO) */}
      {showRelatorioModal && dashboardData && (
        <div className="print:block fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-[23cm] overflow-hidden animate-in zoom-in-95 duration-300 print:border-none print:shadow-none print:w-auto print:max-w-none print:overflow-visible">
            
            {/* Control Header on Modal (Hidden in print) */}
            <div className="print:hidden flex justify-between items-center bg-slate-55 px-6 py-4 border-b border-slate-100 select-none">
              <span className="font-extrabold text-slate-700 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="h-4.5 w-4.5 text-emerald-700" />
                Visualizar Relatório de Auditoria
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePrint('relatorio')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  <Printer className="h-4 w-4" />
                  Imprimir Documento
                </button>
                <button
                  onClick={() => setShowRelatorioModal(false)}
                  className="p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-650 rounded-lg transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* A4 Document Content */}
            <div className="p-6 bg-slate-100 max-h-[80vh] overflow-y-auto print:p-0 print:bg-white print:max-h-none print:overflow-visible">
              <div id="secao-imprimivel" className="bg-white border border-slate-300 rounded-none shadow-md max-w-[21cm] min-h-[29.7cm] mx-auto p-12 print:p-0 print:border-none print:shadow-none flex flex-col justify-between font-sans text-slate-800">
                
                <div className="space-y-6">
                  {/* Header Area (Com logo proporcional) */}
                  <div className="flex justify-between items-center border-b-2 border-slate-300 pb-5">
                    <div className="flex gap-4 items-center">
                      <img
                        src="/logo.png"
                        alt="Logo da Igreja"
                        className="w-24 h-24 object-contain"
                      />
                      <div>
                        <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Relatório de Auditoria Financeira</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Balancete Regimental Consolidado</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Competência</span>
                      <span className="text-xs font-bold text-slate-700">{selectedMes === 0 ? `Ano Completo / ${selectedAno}` : `${meses.find(m => m.value === selectedMes)?.label} / ${selectedAno}`}</span>
                    </div>
                  </div>

                  {/* Quadro de saldos */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">Demostrativo de Saldos de Caixa</h4>
                    <div className="grid grid-cols-4 gap-1 text-center border border-slate-200">
                      <div className="bg-slate-50 p-2.5 border-r border-slate-200">
                        <span className="text-[9px] text-slate-400 uppercase font-bold block">Saldo Anterior</span>
                        <span className="text-xs font-mono font-bold text-slate-700 mt-1 block">
                          {formatBRL(fechamentosList.find(f => f.ano === selectedAno && f.mes === selectedMes)?.saldoInicial || 0.0)}
                        </span>
                      </div>
                      <div className="p-2.5 border-r border-slate-200">
                        <span className="text-[9px] text-slate-400 uppercase font-bold block">Total Entradas</span>
                        <span className="text-xs font-mono font-extrabold text-emerald-700 mt-1 block">+{formatBRL(dashboardData.receitaOperacional)}</span>
                      </div>
                      <div className="p-2.5 border-r border-slate-200">
                        <span className="text-[9px] text-slate-400 uppercase font-bold block">Total Saídas</span>
                        <span className="text-xs font-mono font-extrabold text-red-600 mt-1 block">-{formatBRL(dashboardData.despesasConsolidadas)}</span>
                      </div>
                      <div className="bg-emerald-50/50 p-2.5">
                        <span className="text-[9px] text-slate-555 uppercase font-bold block">Saldo Final</span>
                        <span className="text-xs font-mono font-extrabold text-emerald-800 mt-1 block">
                          {formatBRL(fechamentosList.find(f => f.ano === selectedAno && f.mes === selectedMes)?.saldoFinal || (dashboardData.receitaOperacional - dashboardData.despesasConsolidadas))}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Origem e Destinação agrupada */}
                  <div className="grid grid-cols-2 gap-8 pt-2">
                    {/* Entradas */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider border-b border-slate-200 pb-1.5 flex justify-between">
                        <span>Origem das Receitas</span>
                        <span className="text-emerald-700">{formatBRL(dashboardData.receitaOperacional)}</span>
                      </h4>
                      {dashboardData.distribuicaoEntradas.length > 0 ? (
                        <div className="space-y-2">
                          {dashboardData.distribuicaoEntradas.map((item, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between items-center text-[9px] font-semibold text-slate-600">
                                <span className="truncate max-w-[65%]">{item.nome}</span>
                                <span>{formatBRL(item.valorTotal)} ({item.percentualQueRepresenta.toFixed(0)}%)</span>
                              </div>
                              <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                                <div className="bg-emerald-600 h-1 rounded-full" style={{ width: `${item.percentualQueRepresenta}%` }}></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[9px] text-slate-400 italic">Sem registros.</p>
                      )}
                    </div>

                    {/* Saídas */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider border-b border-slate-200 pb-1.5 flex justify-between">
                        <span>Destinação das Despesas</span>
                        <span className="text-red-600">{formatBRL(dashboardData.despesasConsolidadas)}</span>
                      </h4>
                      {dashboardData.distribuicaoSaidas.length > 0 ? (
                        <div className="space-y-2">
                          {dashboardData.distribuicaoSaidas.map((item, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between items-center text-[9px] font-semibold text-slate-600">
                                <span className="truncate max-w-[65%]">{item.nome}</span>
                                <span>{formatBRL(item.valorTotal)} ({item.percentualQueRepresenta.toFixed(0)}%)</span>
                              </div>
                              <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                                <div className="bg-amber-500 h-1 rounded-full" style={{ width: `${item.percentualQueRepresenta}%` }}></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[9px] text-slate-400 italic">Sem despesas.</p>
                      )}
                    </div>
                  </div>

                  {/* Extrato Detalhado de Transações por Auditoria (SEM A COLUNA CONTRIBUINTE) */}
                  <div className="space-y-2 pt-4">
                    <h4 className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider border-b border-slate-200 pb-1.5">
                      Extrato Analítico por Lançamento
                    </h4>
                    <table className="w-full text-left text-[9px] border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 font-bold uppercase select-none border-b border-slate-200">
                          <th className="px-3 py-1.5 w-16">Data</th>
                          <th className="px-3 py-1.5">Descrição</th>
                          <th className="px-3 py-1.5">Categoria</th>
                          <th className="px-3 py-1.5 w-14 text-center">Tipo</th>
                          <th className="px-3 py-1.5 w-24 text-right">Valor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {extratoData.length > 0 ? (
                          extratoData.map((row) => (
                            <tr key={row.id}>
                              <td className="px-3 py-1.5 font-mono whitespace-nowrap">
                                {new Date(row.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                              </td>
                              <td className="px-3 py-1.5 font-bold truncate max-w-[200px]">{row.descricao}</td>
                              <td className="px-3 py-1.5 whitespace-nowrap">{row.nomeCategoria}</td>
                              <td className={`px-3 py-1.5 text-center font-bold whitespace-nowrap ${row.tipoFluxo === 'ENTRADA' ? 'text-emerald-700' : 'text-amber-600'}`}>
                                {row.tipoFluxo === 'ENTRADA' ? 'Entrada' : 'Saída'}
                              </td>
                              <td className="px-3 py-1.5 font-mono font-bold text-right whitespace-nowrap">
                                {formatBRL(row.valor)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-3 py-4 text-center text-slate-400 italic">Sem lançamentos no período.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Signatures Area */}
                <div className="space-y-6 pt-8 select-none">
                  <p className="text-[9px] text-slate-400 text-center italic">
                    Este relatório reflete fielmente os lançamentos da tesouraria local na competência declarada, sem exibir dados pessoais em conformidade com as diretivas eclesiásticas.
                  </p>
                  <div className="grid grid-cols-2 gap-12 text-center pt-6 border-t border-slate-200/50">
                    <div className="space-y-1">
                      <div className="w-4/5 mx-auto border-t border-slate-400"></div>
                      <span className="text-[10px] font-bold text-slate-700 block mt-1">Assinatura do Tesoureiro</span>
                      <span className="text-[8px] text-slate-400 uppercase tracking-widest block font-semibold">Igreja Presbiteriana do Ipês</span>
                    </div>
                    <div className="space-y-1">
                      <div className="w-4/5 mx-auto border-t border-slate-400"></div>
                      <span className="text-[10px] font-bold text-slate-700 block mt-1">Assinatura do Presidente do Conselho</span>
                      <span className="text-[8px] text-slate-400 uppercase tracking-widest block font-semibold">Pastor Regente Titular</span>
                    </div>
                  </div>
                </div>
                
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
