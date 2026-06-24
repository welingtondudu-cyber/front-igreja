import { useState, useEffect } from 'react'
import { RefreshCw, CheckCircle2, AlertTriangle, Users, Award, ChevronLeft, Loader2, UserCheck, Eye, EyeOff, Lock } from 'lucide-react'

// Set API URL (Vite proxies /api to backend, so we can use empty string or relative path)
const API_URL = ''

function Apuracao({ onBackToVote }) {
  const [votacoes, setVotacoes] = useState([])
  const [selectedVotacaoId, setSelectedVotacaoId] = useState('')
  const [selectedVotacaoTitle, setSelectedVotacaoTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showResults, setShowResults] = useState(true)
  
  // Real-time results state
  const [apuracaoData, setApuracaoData] = useState({
    totalAptos: 0,
    totalVotaram: 0,
    percentualParticipacao: 0.0,
    resultados: []
  })

  // Simulated mockup data for fallbacks
  const mockApuracao = {
    totalAptos: 150,
    totalVotaram: 68,
    percentualParticipacao: 45.33,
    resultados: [
      {
        opcaoId: 1,
        tituloOpcao: 'Opção Chapa A - Renovação e Ação',
        membroId: 10,
        fotoUrl: '/api/membros/foto/membro10.jpg',
        totalVotos: 34,
        percentual: 50.0
      },
      {
        opcaoId: 2,
        tituloOpcao: 'Opção Chapa B - Missões e Compromisso',
        membroId: 11,
        fotoUrl: null,
        totalVotos: 22,
        percentual: 32.35
      },
      {
        opcaoId: 3,
        tituloOpcao: 'Votos em Branco',
        membroId: null,
        fotoUrl: null,
        totalVotos: 12,
        percentual: 17.65
      }
    ]
  }

  // Fetch active elections to populate the dropdown selection
  useEffect(() => {
    async function loadVotacoes() {
      try {
        const response = await fetch('/api/public/votacoes/ativas')
        if (response.ok) {
          const data = await response.json()
          setVotacoes(data)
          if (data.length > 0) {
            setSelectedVotacaoId(data[0].id.toString())
            setSelectedVotacaoTitle(data[0].titulo)
          }
        }
      } catch (err) {
        console.error('Falha ao carregar votações para apuração:', err)
      }
    }
    loadVotacoes()
  }, [])

  // Load results whenever the selected election changes
  useEffect(() => {
    if (selectedVotacaoId) {
      fetchApuracao(selectedVotacaoId)
      const selected = votacoes.find(v => v.id.toString() === selectedVotacaoId)
      if (selected) {
        setSelectedVotacaoTitle(selected.titulo)
      }
    }
  }, [selectedVotacaoId, votacoes])

  // Fetch current results from endpoint
  const fetchApuracao = async (votacaoId) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/admin/votacoes/${votacaoId}/apuracao`)
      if (response.ok) {
        const data = await response.json()
        setApuracaoData(data)
      } else {
        // Fallback to mockup data in case of error or dev/empty database
        setApuracaoData(mockApuracao)
        setError('Nota: Mostrando dados simulados (a votação selecionada pode não possuir votos registrados ou está vazia).')
      }
    } catch (err) {
      console.error('Erro ao conectar com API de Apuração:', err)
      setApuracaoData(mockApuracao)
      setError('Erro de conexão. Exibindo dados simulados de apuração.')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    if (selectedVotacaoId) {
      fetchApuracao(selectedVotacaoId)
    }
  }

  // Get initials helper for fallback
  const getInitials = (name) => {
    if (!name) return '?'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return parts[0].slice(0, 2).toUpperCase()
  }

  // Handle broken images by replacing with initials fallback
  const handleImageError = (e) => {
    e.target.style.display = 'none'
    e.target.nextSibling.style.display = 'flex'
  }

  // Prepare ordered list: when results are hidden, sort by option ID to prevent ranking spoiling. When revealed, sort by vote count.
  const sortedResultados = showResults
    ? [...apuracaoData.resultados].sort((a, b) => b.totalVotos - a.totalVotos)
    : [...apuracaoData.resultados].sort((a, b) => a.opcaoId - b.opcaoId)

  // Quorum condition (33.33% or 1/3)
  const isQuorumReached = apuracaoData.percentualParticipacao >= 33.333

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased">
      {/* HEADER LOGO */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 flex justify-between items-center w-full px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBackToVote}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-700 focus:outline-none"
            title="Voltar para Fluxo de Votos"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <img
            src="/logo.png"
            alt="Logotipo Oficial da Igreja"
            className="h-10 w-auto max-w-[150px] object-contain"
          />
        </div>
        <div className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full uppercase tracking-wider">
          Apuração Eleição
        </div>
      </header>

      {/* MAIN CONTENT CONTAINER */}
      <main className="flex-grow max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* SECTION 1: CABEÇALHO DO RESULTADO */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest block">
                Apuração em Tempo Real
              </span>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {selectedVotacaoTitle || 'Selecione uma Assembleia'}
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={selectedVotacaoId}
                onChange={(e) => setSelectedVotacaoId(e.target.value)}
                className="border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-700 text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors cursor-pointer font-medium"
              >
                {votacoes.length === 0 ? (
                  <option value="">Nenhuma votação ativa</option>
                ) : (
                  votacoes.map((v) => (
                    <option key={v.id} value={v.id}>
                      Assembleia ID: {v.id}
                    </option>
                  ))
                )}
              </select>

              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-xl text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
              >
                <RefreshCw className={`h-4 w-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Atualizar Apuração</span>
              </button>
            </div>
          </div>

          {/* Dinamic Quorum Tag/Badge */}
          <div className="pt-2">
            {isQuorumReached ? (
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <span>Quórum Alcançado (Assembleia Válida)</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 border border-amber-200 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                <span>Quórum Mínimo de 1/3 Não Atingido (Assembleia Inválida)</span>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-blue-50 text-blue-700 border border-blue-100 p-3 rounded-xl text-xs leading-relaxed">
              {error}
            </div>
          )}
        </div>

        {/* SECTION 2: GRÁFICO E DETALHAMENTO DE QUÓRUM */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Users className="h-5 w-5 text-emerald-700" />
            <h2 className="text-lg font-bold text-slate-900">Quórum e Participação da Assembleia</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Numeric Indicators */}
            <div className="space-y-4 md:col-span-1 flex flex-col justify-center">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Membros Aptos a Votar
                </span>
                <span className="text-2xl font-bold text-slate-800">
                  {apuracaoData.totalAptos}
                </span>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Votos Computados / Presentes
                </span>
                <span className="text-2xl font-bold text-slate-800">
                  {apuracaoData.totalVotaram}
                </span>
              </div>
            </div>

            {/* Progress Visualization */}
            <div className="md:col-span-2 space-y-4 flex flex-col justify-center">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Quórum Atual
                  </span>
                  <span className="text-3xl font-black text-emerald-700">
                    {apuracaoData.percentualParticipacao.toFixed(2)}%
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-400 block">Meta Estaturária (1/3)</span>
                  <span className="text-sm font-bold text-amber-600">33.33%</span>
                </div>
              </div>

              {/* Pure CSS Progress Bar with Marker */}
              <div className="relative pt-1">
                <div className="overflow-hidden h-6 text-xs flex rounded-full bg-slate-100 border border-slate-200">
                  <div
                    style={{ width: `${Math.min(apuracaoData.percentualParticipacao, 100)}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-700 transition-all duration-500 rounded-full"
                  />
                </div>
                {/* 1/3 (33.33%) Marker Line */}
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-amber-500 z-10 flex flex-col items-center"
                  style={{ left: '33.333%' }}
                >
                  <div className="h-6 w-[2px] bg-amber-500" />
                  <span className="text-[10px] font-bold text-amber-600 bg-white px-1.5 border border-amber-200 rounded-full mt-1 shadow-sm whitespace-nowrap">
                    Meta 1/3
                  </span>
                </div>
              </div>
              <div className="pt-2 text-xs text-slate-500 leading-normal">
                A assembleia necessita de pelo menos um terço dos membros elegíveis ativos presentes para que as decisões votadas tenham validade jurídica perante o estatuto.
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: RANKING E ORDEM DOS GANHADORES */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-700" />
              <h2 className="text-lg font-bold text-slate-900">Resultado das Opções / Candidatos</h2>
            </div>

            <button
              onClick={() => setShowResults(!showResults)}
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors uppercase tracking-wider bg-transparent border-0 p-1 cursor-pointer focus:outline-none"
              title={showResults ? "Ocultar Resultados" : "Mostrar Resultados"}
            >
              {showResults ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  <span>Ocultar Resultados</span>
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  <span>Mostrar Resultados</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {sortedResultados.map((candidato, index) => {
              const rank = index + 1
              const totalVotosGerais = apuracaoData.resultados.reduce((acc, c) => acc + c.totalVotos, 0)
              
              // Handle relative percentage against total cast votes, or fallback to the percentual from backend
              const percentage = totalVotosGerais > 0 
                ? (candidato.totalVotos / totalVotosGerais) * 100 
                : candidato.percentual

              return (
                <div 
                  key={candidato.opcaoId}
                  className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow transition-shadow p-5 flex flex-col sm:flex-row items-center gap-4 relative overflow-hidden"
                >
                  {/* Position Badge */}
                  <div className="text-lg font-black text-emerald-700 sm:w-16 text-center shrink-0 flex items-center justify-center gap-1 sm:flex-col">
                    <span className="text-xs text-slate-400 font-semibold uppercase sm:block">Posição</span>
                    {showResults ? (
                      <span className="text-2xl">{rank}º</span>
                    ) : (
                      <span className="text-2xl text-slate-300 font-normal">?</span>
                    )}
                  </div>

                  {/* Profile Picture / Initials Fallback */}
                  <div className="relative h-14 w-14 shrink-0 rounded-full overflow-hidden border border-slate-200 shadow-sm bg-slate-100 flex items-center justify-center">
                    {showResults ? (
                      <>
                        {candidato.fotoUrl ? (
                          <img
                            src={`${API_URL}${candidato.fotoUrl}`}
                            alt={candidato.tituloOpcao}
                            onError={handleImageError}
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                        {/* Fallback element shown if no photo or image errors out */}
                        <div 
                          className="absolute inset-0 bg-emerald-50 text-emerald-700 font-bold text-lg flex items-center justify-center uppercase"
                          style={{ display: candidato.fotoUrl ? 'none' : 'flex' }}
                        >
                          {getInitials(candidato.nomeMembro || candidato.tituloOpcao)}
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 bg-slate-100 text-slate-400 flex items-center justify-center">
                        <Lock className="h-5 w-5" />
                      </div>
                    )}
                  </div>

                  {/* Candidate / Option Name and Progress Bar */}
                  <div className="flex-grow w-full space-y-2.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-900 text-base leading-tight">
                          {showResults
                            ? (candidato.nomeMembro || candidato.tituloOpcao)
                            : "Candidato / Opção Ocultada"}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium">
                          {showResults 
                            ? (candidato.membroMatricula
                                ? `Matrícula: ${candidato.membroMatricula}`
                                : 'Opção Geral')
                            : 'Identidade Oculta'}
                        </p>
                      </div>
                      
                      <div className="text-right shrink-0">
                        <span className="text-sm font-bold text-slate-900 block">
                          {showResults ? (
                            `${candidato.totalVotos} ${candidato.totalVotos === 1 ? 'voto' : 'votos'}`
                          ) : (
                            <span className="text-slate-300 select-none font-mono">••••</span>
                          )}
                        </span>
                        <span className="text-xs font-semibold text-emerald-700 block bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full mt-1">
                          {showResults ? `${percentage.toFixed(1)}%` : '•••%'}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar Proportion */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/50">
                      <div 
                        className="bg-emerald-700 h-full rounded-full transition-all duration-500"
                        style={{ width: `${showResults ? percentage : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>

      {/* FOOTER METADATA */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-center text-xs text-slate-400">
        <p className="font-semibold text-slate-500">Igreja Presbiteriana dos Ipês</p>
        <p className="mt-1">Sistema Integrado de Gestão e Apuração de Assembleias © 2026</p>
      </footer>
    </div>
  )
}

export default Apuracao
