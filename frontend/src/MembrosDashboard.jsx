import { useState, useEffect } from 'react'
import {
  Users, Award, ShieldCheck, PieChart, BarChart3,
  RefreshCw, AlertCircle, Cake, Sparkles, UserCheck, Calendar, ChevronDown
} from 'lucide-react'

export default function MembrosDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Selected years for admissions filter (max 2 selected)
  const [selectedYears, setSelectedYears] = useState([new Date().getFullYear()])
  const [showYearDropdown, setShowYearDropdown] = useState(false)

  const selectedAno = selectedYears[0] || new Date().getFullYear()
  const compararAno = selectedYears[1] || ''

  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/membros/dashboard')
      if (res.ok) {
        const json = await res.json()
        setData(json)
      } else {
        const errObj = await res.json()
        setError(errObj.detail || 'Erro ao carregar dados do dashboard de membros.')
      }
    } catch (err) {
      setError('Erro de conexão ao carregar os dados.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500 font-sans">
        <RefreshCw className="h-8 w-8 animate-spin text-emerald-700 mb-3" />
        <p className="text-sm font-semibold">Carregando painel analítico...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-800 flex flex-col items-center gap-3 max-w-md mx-auto my-12 font-sans">
        <AlertCircle className="h-10 w-10 text-red-600" />
        <h3 className="font-bold text-base">Falha na Inicialização</h3>
        <p className="text-xs leading-relaxed text-red-700">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-2 bg-red-600 hover:bg-red-750 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    )
  }

  if (!data) return null

  // Extract years from admissions history for year selector filter
  const anosDisponiveis = Array.from(
    new Set((data.historicoAdmissoes || []).map((x) => x.ano))
  ).sort((a, b) => b - a)

  // Calculate year totals for comparison quickcards
  const totalPorAno = (data.historicoAdmissoes || []).reduce((acc, curr) => {
    acc[curr.ano] = (acc[curr.ano] || 0) + curr.quantidade
    return acc;
  }, {})

  const yearsToCompare = [selectedAno]
  if (compararAno) {
    yearsToCompare.push(compararAno)
  }

  const maxQtdAdmissoes = Math.max(
    ...(data.historicoAdmissoes || [])
      .filter((x) => yearsToCompare.includes(x.ano))
      .map((x) => x.quantidade),
    1
  )

  const getBarHeight = (qtd) => {
    const pct = (qtd / maxQtdAdmissoes) * 80
    return `${Math.max(4, pct)}%`
  }

  const nomesMeses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']

  // Get active members count with birthday today
  const aniversariantesHoje = (data.aniversariantesMes || []).filter(
    (x) => x.isAniversarianteDoDia
  )

  // Helper to format percentage values nicely
  const formatPct = (val) => {
    return (val || 0).toFixed(1).replace('.0', '')
  }

  // Helper for initials
  const getInitials = (name) => {
    if (!name) return '?'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return parts[0].slice(0, 2).toUpperCase()
  }

  // Visual helper for ministry activity index color badge
  const getBadgeStyle = (pct) => {
    if (pct < 50.0) {
      return {
        bg: 'bg-red-50 text-red-700 border-red-200',
        text: 'Crítico',
        colorBar: 'bg-red-500'
      }
    } else if (pct < 75.0) {
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        text: 'Moderado',
        colorBar: 'bg-amber-500'
      }
    } else {
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-250',
        text: 'Excelente',
        colorBar: 'bg-emerald-600'
      }
    }
  }

  return (
    <div className="space-y-8 font-sans antialiased text-slate-800">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Dashboard de Membros</h2>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Análise consolidada de engajamento, demografia e atividade eclesiástica
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 bg-white border border-slate-200 shadow-xs hover:bg-slate-50 text-slate-700 font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-all active:scale-97 shrink-0"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Atualizar Dados
        </button>
      </div>

      {/* MACRO INDICATORS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        
        {/* TOTAL ACTIVE */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-sm transition-shadow">
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Membros Ativos</span>
            <span className="text-2xl font-bold text-slate-800">{data.totalMembrosAtivos}</span>
          </div>
        </div>

        {/* DIACONOS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-sm transition-shadow">
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Diáconos Ativos</span>
            <span className="text-2xl font-bold text-slate-800">{data.totalDiaconos}</span>
          </div>
        </div>

        {/* PRESBITEROS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-sm transition-shadow">
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Presbíteros Ativos</span>
            <span className="text-2xl font-bold text-slate-800">{data.totalPresbiteros}</span>
          </div>
        </div>

        {/* SOCIEDADE INTERNA INTEGRATION */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-sm transition-shadow">
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sociedades Internas</span>
            <span className="text-2xl font-bold text-slate-800">{formatPct(data.percentualSociedadeInterna)}%</span>
          </div>
        </div>

        {/* MINISTERIOS ENGAGEMENT */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-sm transition-shadow">
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Taxa de Ministérios</span>
            <span className="text-2xl font-bold text-slate-800">{formatPct(data.percentualMinisterio)}%</span>
          </div>
        </div>

      </div>

      {/* CHARTS ROW (ADMISSIONS + DEMOGRAPHIC) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ADMISSIONS HISTORICAL CHART (2 COLS ON LARGE) */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Histórico de Admissões</h3>
              <p className="text-[10px] font-medium text-slate-400">Novas inclusões de membros consolidadas mensalmente</p>
            </div>
            
            {/* DUAL YEAR SELECTORS */}
            {/* SINGLE MULTI-SELECT YEAR SELECTOR */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowYearDropdown(!showYearDropdown)}
                className="border border-slate-250 bg-white text-slate-800 rounded-xl px-3 py-2 text-xs font-bold hover:bg-slate-50 focus:outline-none transition-colors shadow-2xs flex items-center gap-2 select-none"
              >
                <span>{selectedYears.length === 1 ? `Ano ${selectedYears[0]}` : `Anos ${selectedYears.join(' e ')}`}</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>
              
              {showYearDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowYearDropdown(false)} />
                  <div className="absolute right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 p-2 min-w-[210px] max-h-60 overflow-y-auto space-y-1 animate-in fade-in duration-150">
                    <div className="px-2 py-1 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 mb-1">
                      Selecione até 2 anos:
                    </div>
                    {anosDisponiveis.map((y) => {
                      const isChecked = selectedYears.includes(y)
                      const isDisabled = !isChecked && selectedYears.length >= 2
                      return (
                        <label
                          key={y}
                          className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors select-none ${
                            isDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-55/40 text-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={isDisabled}
                            onChange={() => {
                              if (isChecked) {
                                if (selectedYears.length > 1) {
                                  setSelectedYears(selectedYears.filter(x => x !== y))
                                }
                              } else {
                                if (selectedYears.length < 2) {
                                  setSelectedYears([...selectedYears, y].sort((a, b) => b - a))
                                }
                              }
                            }}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
                          />
                          <span>
                            {y} <span className="text-[10px] text-slate-400 font-medium">({totalPorAno[y] || 0} novos)</span>
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* HISTORICAL CHART BAR GRAPHS */}
          <div className="pt-4 overflow-x-auto -mx-6 px-6 scrollbar-thin">
            <div className="min-w-[480px] flex gap-4 pt-2">
              {/* Y Axis Grid Label */}
              <div className="flex flex-col justify-between text-[10px] font-bold text-slate-400 h-44 pb-7 font-mono shrink-0 w-8 text-right select-none">
                <span>{maxQtdAdmissoes}</span>
                <span>{Math.round(maxQtdAdmissoes * 0.5)}</span>
                <span>0</span>
              </div>

              {/* Chart Grid Lines */}
              <div className="flex-grow relative h-44 border-b border-l border-slate-200">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  <div className="w-full border-t border-slate-100"></div>
                  <div className="w-full border-t border-slate-100"></div>
                  <div className="w-full"></div>
                </div>

                {/* Bars */}
                <div className="absolute inset-0 flex items-end px-2" style={{ justifyContent: 'space-around' }}>
                  {Array.from({ length: 12 }, (_, i) => {
                    const m = i + 1
                    const labelMes = nomesMeses[m - 1]
                    const priVal = (data.historicoAdmissoes || []).find(x => x.ano === selectedAno && x.mes === m)?.quantidade || 0
                    const compVal = compararAno ? ((data.historicoAdmissoes || []).find(x => x.ano === compararAno && x.mes === m)?.quantidade || 0) : 0

                    return (
                      <div key={m} className="flex flex-col items-center gap-1 flex-1 relative group">
                        <div className="flex items-end justify-center w-full h-32 gap-1">
                          {/* Primary Year Bar */}
                          <div
                            className="bg-emerald-600 w-3 sm:w-4 rounded-t transition-all hover:bg-emerald-500 relative cursor-pointer group/pri"
                            style={{ height: getBarHeight(priVal) }}
                          >
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-800 text-white text-[9px] font-bold py-1 px-1.5 rounded-md shadow-sm opacity-0 group-hover/pri:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-10">
                              {selectedAno}: {priVal} {priVal === 1 ? 'membro' : 'membros'}
                            </div>
                          </div>

                          {/* Comparison Year Bar */}
                          {compararAno && (
                            <div
                              className="bg-blue-500 w-3 sm:w-4 rounded-t transition-all hover:bg-blue-400 relative cursor-pointer group/comp"
                              style={{ height: getBarHeight(compVal) }}
                            >
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-800 text-white text-[9px] font-bold py-1 px-1.5 rounded-md shadow-sm opacity-0 group-hover/comp:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-10">
                                {compararAno}: {compVal} {compVal === 1 ? 'membro' : 'membros'}
                              </div>
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 select-none font-mono">
                          {labelMes}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Color Legend (only if comparison is active) */}
          {compararAno && (
            <div className="flex gap-4 justify-center text-xs font-semibold pb-2 border-t border-slate-50 pt-3 select-none">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 bg-emerald-600 rounded"></div>
                <span className="text-slate-650">Ano {selectedAno}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 bg-blue-500 rounded"></div>
                <span className="text-slate-650">Ano {compararAno}</span>
              </div>
            </div>
          )}
        </div>

        {/* DEMOGRAPHIC DISTRIBUTION */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 space-y-4">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Distribuição por Idade</h3>
            <p className="text-[10px] font-medium text-slate-400">Breakdown demográfico da membresia ativa</p>
          </div>

          <div className="space-y-4 pt-2">
            {(data.distribuicaoFaixaEtaria || []).map((f, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-600">{f.faixa}</span>
                  <span className="font-bold text-slate-800">{f.quantidade} ({formatPct(f.percentual)}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${f.percentual}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* MINISTRY ACTIVITY & BIRTHDAYS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* MINISTRY INDEX OF ACTIVITY (2 COLS) */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 lg:col-span-2 space-y-4">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Atividade por Ministério</h3>
            <p className="text-[10px] font-medium text-slate-400">
              Taxa de presença em escalas nos últimos 90 dias (membros ativos / membros do grupo)
            </p>
          </div>

          {(data.atividadeMinisterios || []).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-150 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-2.5 pl-1">Ministério / Grupo</th>
                    <th className="py-2.5 text-center">Membros</th>
                    <th className="py-2.5 text-center">Ativos no Período</th>
                    <th className="py-2.5 text-center">Índice</th>
                    <th className="py-2.5 text-right pr-1">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {(data.atividadeMinisterios || []).map((m, idx) => {
                    const badge = getBadgeStyle(m.indiceAtividade)
                    return (
                      <tr key={idx} className="hover:bg-slate-50/55 transition-colors">
                        <td className="py-3 pl-1 font-bold text-slate-900">{m.nomeGrupo}</td>
                        <td className="py-3 text-center text-slate-650">{m.totalMembros}</td>
                        <td className="py-3 text-center text-slate-650">{m.membrosAtivos}</td>
                        <td className="py-3 text-center w-36">
                          <div className="flex items-center justify-center gap-2">
                            <span className="w-8 text-right font-mono font-bold">{formatPct(m.indiceAtividade)}%</span>
                            <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`${badge.colorBar} h-1.5 rounded-full`}
                                style={{ width: `${m.indiceAtividade}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-right pr-1">
                          <span className={`inline-block border rounded-full px-2.5 py-0.5 text-[10px] font-bold ${badge.bg}`}>
                            {badge.text}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Nenhum ministério ou grupo cadastrado no sistema.
            </div>
          )}
        </div>

        {/* BIRTHDAYS OF THE MONTH */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 space-y-4 flex flex-col max-h-[380px] lg:max-h-none">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Aniversariantes do Mês</h3>
              {aniversariantesHoje.length > 0 && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full animate-pulse">
                  <Sparkles className="h-3 w-3" />
                  Hoje!
                </span>
              )}
            </div>
            <p className="text-[10px] font-medium text-slate-400 mt-0.5">Membros com aniversário no mês corrente</p>
          </div>

          <div className="overflow-y-auto flex-grow -mx-6 px-6 divide-y divide-slate-100 scrollbar-thin">
            {(data.aniversariantesMes || []).length > 0 ? (
              (data.aniversariantesMes || []).map((m, idx) => (
                <div
                  key={idx}
                  className={`py-3.5 flex items-center justify-between gap-3 ${
                    m.isAniversarianteDoDia ? 'bg-amber-50/30 rounded-xl px-2 border-l-2 border-amber-400 -mx-2 my-1' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* AVATAR OR INITIALS */}
                    {m.fotoPerfilUrl ? (
                      <img
                        src={m.fotoPerfilUrl}
                        alt={m.nomeCompleto}
                        className={`h-9 w-9 rounded-full object-cover shrink-0 ${
                          m.isAniversarianteDoDia ? 'ring-2 ring-amber-450 ring-offset-1' : 'border border-slate-200'
                        }`}
                      />
                    ) : (
                      <div
                        className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          m.isAniversarianteDoDia
                            ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-450 ring-offset-1'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {getInitials(m.nomeCompleto)}
                      </div>
                    )}

                    {/* NAME */}
                    <div className="min-w-0">
                      <span
                        className={`block text-xs font-bold truncate ${
                          m.isAniversarianteDoDia ? 'text-amber-900 font-extrabold' : 'text-slate-800'
                        }`}
                      >
                        {m.nomeCompleto}
                      </span>
                      {m.isAniversarianteDoDia ? (
                        <span className="flex items-center gap-1 text-[9px] font-bold text-amber-700 mt-0.5">
                          <Cake className="h-3.5 w-3.5 text-amber-500 animate-bounce" />
                          Parabéns!
                        </span>
                      ) : (
                        <span className="block text-[9px] font-bold text-slate-400 mt-0.5">
                          Aniversário
                        </span>
                      )}
                    </div>
                  </div>

                  {/* BIRTHDAY DAY BADGE */}
                  <span
                    className={`font-mono text-xs font-bold px-2 py-1 rounded-lg select-none shrink-0 ${
                      m.isAniversarianteDoDia
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Dia {String(m.dia).padStart(2, '0')}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                Sem aniversariantes neste mês.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  )
}
