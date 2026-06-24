import { useState, useEffect } from 'react'
import {
  Menu, X, CheckCircle2, AlertCircle, Loader2, User, Check,
  ShieldCheck, LogOut, Users, Award, ShieldAlert, CalendarRange,
  DollarSign, Vote, ArrowRight, Settings, LayoutDashboard, UserCheck,
  Newspaper, Calendar, PieChart, BarChart3, ListFilter, BookOpen, AlertTriangle,
  ChevronLeft, PlayCircle
} from 'lucide-react'
import Apuracao from './Apuracao'
import CadastroEleicao from './CadastroEleicao'
import MembrosManager from './MembrosManager'
import OrganogramaView from './OrganogramaView'
import RestricoesManager from './RestricoesManager'

function App() {
  // Navigation & View States
  const [currentView, setCurrentView] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    const view = params.get('view')
    if (view && ['feed', 'calendario', 'membros', 'organograma', 'restricoes', 'apuracao', 'cadastro', 'dashboards', 'analitico'].includes(view)) {
      return view
    }
    if (window.location.pathname === '/apuracao') return 'apuracao'
    if (window.location.pathname === '/cadastro') return 'cadastro'
    return 'feed'
  })

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [organogramaFilter, setOrganogramaFilter] = useState(null)
  const [step, setStep] = useState(1) // 1: Login, 2: Ballot, 3: Success
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Admin Auth States
  const [adminPassword, setAdminPassword] = useState('')
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return sessionStorage.getItem('isAdminAuthenticated') === 'true'
  })
  const [adminError, setAdminError] = useState(null)

  // Step 1: Login States
  const [votacoes, setVotacoes] = useState([])
  const [selectedVotacaoId, setSelectedVotacaoId] = useState('')
  const [cpf, setCpf] = useState('')
  const [anoNascimento, setAnoNascimento] = useState('')

  // Member & Election Info (loaded from login/ballot API)
  const [membroId, setMembroId] = useState(null)
  const [nomeMembro, setNomeMembro] = useState('')
  const [cedula, setCedula] = useState(null)

  // Step 2: Ballot States
  const [selectedOpcoes, setSelectedOpcoes] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [estudosFilter, setEstudosFilter] = useState('Todos')

  // Step 3: Success States
  const [codigoAuditoria, setCodigoAuditoria] = useState('')

  // Load Active Elections on Mount
  useEffect(() => {
    async function loadVotacoes() {
      try {
        const response = await fetch('/api/public/votacoes/ativas')
        if (response.ok) {
          const data = await response.json()
          setVotacoes(data)
          if (data.length > 0) {
            setSelectedVotacaoId(data[0].id.toString())
          }
        }
      } catch (err) {
        console.error('Falha ao carregar votações:', err)
      }
    }
    loadVotacoes()
  }, [])

  // Sync URL with View
  const navigateTo = (viewName) => {
    setCurrentView(viewName)
    setSidebarOpen(false)
    const newUrl = viewName === 'feed' ? '/' : `/?view=${viewName}`
    window.history.pushState({}, '', newUrl)
  }

  const handleAdminAuth = (e) => {
    e.preventDefault()
    if (adminPassword === 'Ipes@2026#Admin!') {
      sessionStorage.setItem('isAdminAuthenticated', 'true')
      setIsAdminAuthenticated(true)
      setAdminError(null)
      setAdminPassword('')
      navigateTo('feed') // Redirect to feed portal of communication after login
    } else {
      setAdminError('Senha administrativa incorreta.')
    }
  }

  const handleAdminLogout = () => {
    sessionStorage.removeItem('isAdminAuthenticated')
    setIsAdminAuthenticated(false)
    navigateTo('voting')
  }

  // Helper: Format CPF on Type
  const handleCpfChange = (e) => {
    const rawVal = e.target.value.replace(/\D/g, '')
    if (rawVal.length <= 11) {
      let formatted = rawVal
      if (rawVal.length > 9) {
        formatted = `${rawVal.slice(0, 3)}.${rawVal.slice(3, 6)}.${rawVal.slice(6, 9)}-${rawVal.slice(9)}`
      } else if (rawVal.length > 6) {
        formatted = `${rawVal.slice(0, 3)}.${rawVal.slice(3, 6)}.${rawVal.slice(6)}`
      } else if (rawVal.length > 3) {
        formatted = `${rawVal.slice(0, 3)}.${rawVal.slice(3)}`
      }
      setCpf(formatted)
    }
  }

  // Helper: Get initials for photo fallback
  const getInitials = (name) => {
    if (!name) return '?'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return parts[0].slice(0, 2).toUpperCase()
  }

  // Handle Logout / Clear Session of voter
  const handleVoterLogout = () => {
    setStep(1)
    setCpf('')
    setAnoNascimento('')
    setMembroId(null)
    setNomeMembro('')
    setCedula(null)
    setSelectedOpcoes([])
    setError(null)
  }

  // Handle Login Form Submit (voter)
  const handleLogin = async (e) => {
    e.preventDefault()
    if (!selectedVotacaoId) {
      setError('Por favor, selecione uma assembleia/votação.')
      return
    }
    if (cpf.length !== 14) {
      setError('Por favor, digite um CPF válido.')
      return
    }
    if (anoNascimento.length !== 4) {
      setError('Por favor, digite um ano de nascimento com 4 dígitos.')
      return
    }

    setLoading(true)
    setError(null)

    const rawCpf = cpf.replace(/\D/g, '')

    try {
      // 1. Verificar Elegibilidade
      const elegibilidadeRes = await fetch('/api/public/votacoes/verificar-elegibilidade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          votacaoId: parseInt(selectedVotacaoId),
          cpf: rawCpf,
          anoNascimento: parseInt(anoNascimento)
        })
      })

      if (!elegibilidadeRes.ok) {
        const problem = await elegibilidadeRes.json()
        setError(problem.detail || 'Ocorreu um erro ao verificar sua elegibilidade.')
        setLoading(false)
        return
      }

      const elegibilidadeData = await elegibilidadeRes.json()
      setMembroId(elegibilidadeData.membroId)
      setNomeMembro(elegibilidadeData.nomeMembro)

      // 2. Buscar Cédula de Votação
      const cedulaRes = await fetch(`/api/public/votacoes/${selectedVotacaoId}/cedula`)
      if (!cedulaRes.ok) {
        const problem = await cedulaRes.json()
        setError(problem.detail || 'Não foi possível carregar a cédula de votação.')
        setLoading(false)
        return
      }

      const cedulaData = await cedulaRes.json()
      setCedula(cedulaData)
      setSelectedOpcoes([])
      setStep(2) // Avança para a cédula
    } catch (err) {
      setError('Falha de conexão com o servidor. Tente novamente mais tarde.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectOption = (opcaoId) => {
    if (!cedula) return
    const { limiteVotos } = cedula

    if (selectedOpcoes.includes(opcaoId)) {
      setSelectedOpcoes(selectedOpcoes.filter(id => id !== opcaoId))
    } else {
      if (selectedOpcoes.length < limiteVotos) {
        setSelectedOpcoes([...selectedOpcoes, opcaoId])
      } else {
        setSelectedOpcoes([...selectedOpcoes.slice(1), opcaoId])
      }
    }
  }

  const handleConfirmVote = async () => {
    setShowModal(false)
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/public/votacoes/votar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          votacaoId: cedula.votacaoId,
          membroId: membroId,
          opcoesIds: selectedOpcoes
        })
      })

      if (!response.ok) {
        const problem = await response.json()
        setError(problem.detail || 'Falha ao computar seu voto.')
        setLoading(false)
        setStep(1)
        return
      }

      const auditCode = await response.text()
      setCodigoAuditoria(auditCode)
      setStep(3)
    } catch (err) {
      setError('Falha ao enviar seu voto. Verifique sua conexão.')
      setStep(1)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Views requiring administrator pass check
  const isAdminView = currentView !== 'voting'

  const getViewTitle = (view) => {
    switch (view) {
      case 'feed': return 'Feed de Notícias'
      case 'calendario': return 'Calendário'
      case 'estudos': return 'Estudos Bíblicos'
      case 'membros': return 'Gestão de Membros'
      case 'organograma': return 'Organograma'
      case 'restricoes': return 'Restrição de Votos'
      case 'apuracao': return 'Apuração Eleição'
      case 'cadastro': return 'Cadastrar Eleição'
      case 'dashboards': return 'Financeiro / Dashboards'
      case 'analitico': return 'Financeiro / Analítico'
      case 'voting': return 'Assembleia / Votar'
      default: return ''
    }
  }

  const renderContent = () => {
    switch (currentView) {
      case 'feed':
        return renderFeed()
      case 'calendario':
        return renderCalendario()
      case 'estudos':
        return renderEstudos()
      case 'membros':
        return (
          <MembrosManager
            onViewOrganograma={(filter) => {
              setOrganogramaFilter(filter)
              navigateTo('organograma')
            }}
          />
        )
      case 'organograma':
        return (
          <OrganogramaView
            preFilter={organogramaFilter}
            onBack={() => {
              setOrganogramaFilter(null)
              navigateTo('membros')
            }}
          />
        )
      case 'restricoes':
        return <RestricoesManager onClose={() => navigateTo('apuracao')} />
      case 'apuracao':
        return <Apuracao onBackToVote={() => navigateTo('voting')} />
      case 'cadastro':
        return <CadastroEleicao onBack={() => navigateTo('apuracao')} />
      case 'dashboards':
        return renderFinanceiroDashboards()
      case 'analitico':
        return renderFinanceiroAnalitico()
      case 'voting':
        return renderUrna()
      default:
        return renderFeed()
    }
  }

  // 1. HIGH FIDELITY FEED VIEW
  const renderFeed = () => {
    const posts = [
      {
        id: 1,
        title: "Inscrições Abertas: Encontro de Casais 2026",
        category: "Eventos",
        date: "24 Jun, 2026",
        desc: "Estão abertas as inscrições para o nosso retiro anual de casais com o tema 'Edificados sobre a Rocha'. Vagas limitadas para hospedagem no chalé institucional. Garanta sua vaga com a liderança.",
        image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=60"
      },
      {
        id: 2,
        title: "Escala Geral de Ministérios - Julho 2026",
        category: "Escalas",
        date: "22 Jun, 2026",
        desc: "A escala integrada de Diaconato, Recepção, Mídia e Louvor para o próximo mês já está consolidada. Verifique suas datas e, em caso de necessidade de substituição, informe seu líder direto.",
        image: null
      },
      {
        id: 3,
        title: "Culto Especial de Missões e Envio Missionário",
        category: "Missões",
        date: "18 Jun, 2026",
        desc: "No próximo domingo teremos nosso culto focado em missões mundiais com o relato do projeto no Leste Europeu. Contamos com a sua presença e contribuição especial para a junta de missões.",
        image: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&auto=format&fit=crop&q=60"
      }
    ]

    return (
      <div className="space-y-6">
        <div className="relative bg-emerald-800 text-white rounded-3xl p-6 sm:p-8 overflow-hidden shadow-lg flex flex-col justify-center min-h-[160px]">
          <div className="absolute right-0 top-0 opacity-10 translate-x-12 -translate-y-12 select-none pointer-events-none">
            <BookOpen className="h-64 w-64" />
          </div>
          <span className="text-xs font-bold bg-emerald-700/50 uppercase tracking-widest px-3 py-1 rounded-full w-fit">Igreja Presbiteriana dos Ipês</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">Bem-vindo ao Portal de Comunicação</h1>
          <p className="text-sm text-emerald-100 mt-2 max-w-xl">Mantenha-se informado sobre notícias, pautas de oração, escalas e eventos da nossa comunidade.</p>
        </div>

        {/* BIBLE VERSE */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-center gap-4">
          <div className="bg-emerald-50 p-3 rounded-full shrink-0">
            <BookOpen className="h-6 w-6 text-emerald-700" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Versículo do Dia</span>
            <p className="text-sm font-medium text-slate-700 italic mt-0.5">"Lâmpada para os meus pés é tua palavra, e luz para o meu caminho."</p>
            <span className="text-xs text-emerald-700 font-semibold block mt-1">Salmo 119:105</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
              {post.image && (
                <img src={post.image} alt={post.title} className="w-full h-44 object-cover" />
              )}
              <div className="p-5 flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400 mb-2">
                    <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full">{post.category}</span>
                    <span>{post.date}</span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-base leading-snug hover:text-emerald-700 transition-colors cursor-pointer">{post.title}</h3>
                  <p className="text-slate-500 text-xs mt-2.5 leading-relaxed">{post.desc}</p>
                </div>
                <button className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors uppercase tracking-wider mt-5 pt-3 border-t border-slate-100 w-full text-left">
                  Ler matéria completa
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 2. HIGH FIDELITY CALENDAR VIEW
  const renderCalendario = () => {
    const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
    const events = [
      { day: 7, title: "Culto de Santa Ceia", time: "19:00" },
      { day: 14, title: "Assembleia Geral Extraordinária", time: "10:00" },
      { day: 21, title: "EBD Especial", time: "09:00" },
      { day: 28, title: "Culto de Missões", time: "19:00" }
    ]

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Agenda Eclesiástica</h1>
            <p className="text-sm text-slate-500 mt-1">Veja a programação de cultos, reuniões e eventos oficiais.</p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3.5 py-2 rounded-xl border border-emerald-100 text-xs font-semibold">
            <Calendar className="h-4.5 w-4.5 text-emerald-700" />
            Junho 2026
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <div className="grid grid-cols-7 gap-2 mb-4 text-center">
              {daysOfWeek.map((day) => (
                <div key={day} className="text-xs font-bold text-slate-400 uppercase tracking-widest">{day}</div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {/* Empty days for June 2026 (Starts on Monday) */}
              <div className="bg-slate-50/50 border border-slate-100 rounded-xl min-h-[70px] p-2 text-slate-300 text-xs">31</div>
              
              {/* Month days */}
              {[...Array(30)].map((_, index) => {
                const dayNum = index + 1
                const hasEvent = events.find(e => e.day === dayNum)
                
                return (
                  <div key={dayNum} className={`border rounded-xl min-h-[75px] p-2 flex flex-col justify-between transition-colors relative hover:bg-slate-50 cursor-pointer ${
                    hasEvent ? 'border-emerald-600 bg-emerald-50/10' : 'border-slate-200 bg-white'
                  }`}>
                    <span className={`text-xs font-bold ${hasEvent ? 'text-emerald-800' : 'text-slate-500'}`}>{dayNum}</span>
                    {hasEvent && (
                      <span className="text-[9px] leading-tight font-bold bg-emerald-700 text-white px-1.5 py-0.5 rounded block truncate" title={hasEvent.title}>
                        {hasEvent.title}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Event list */}
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Eventos de Junho</h3>
            <div className="space-y-3">
              {events.map((ev, idx) => (
                <div key={idx} className="flex gap-3 items-start p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl transition-colors border border-slate-100">
                  <div className="bg-emerald-700 text-white font-mono font-bold text-sm px-2.5 py-1.5 rounded-lg flex flex-col items-center">
                    <span>{ev.day}</span>
                    <span className="text-[8px] uppercase tracking-wider font-sans">JUN</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">{ev.title}</h4>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{ev.time} • Templo Principal</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 3. HIGH FIDELITY FINANCEIRO DASHBOARDS
  const renderFinanceiroDashboards = () => {
    return (
      <div className="space-y-6">
        {/* BREADCRUMB */}
        <div className="flex items-center gap-3 mb-2 animate-in fade-in duration-200">
          <button 
            onClick={() => navigateTo('analitico')}
            className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-600 focus:outline-none border border-slate-200 bg-white"
            title="Voltar"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="text-sm font-semibold text-slate-500">
            Grupo Financeiro / <span className="text-slate-800 font-bold">Dashboards</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard Financeiro</h1>
            <p className="text-sm text-slate-500 mt-1">Acompanhamento consolidado de dízimos, ofertas e despesas da igreja.</p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3.5 py-2 rounded-xl border border-emerald-100 text-xs font-semibold">
            <PieChart className="h-4.5 w-4.5 text-emerald-700" />
            Consolidação Junho 2026
          </div>
        </div>

        {/* Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Receita Operacional</span>
            <span className="text-2xl font-bold text-slate-800 block mt-1">R$ 45.230,00</span>
            <span className="text-xs text-emerald-600 font-semibold mt-1 block">▲ +12% vs mês anterior</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Despesas Consolidadas</span>
            <span className="text-2xl font-bold text-slate-800 block mt-1">R$ 31.840,00</span>
            <span className="text-xs text-red-500 font-semibold mt-1 block">▼ -4% vs mês anterior</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Saldo do Mês</span>
            <span className="text-2xl font-bold text-emerald-800 block mt-1">R$ 13.390,00</span>
            <span className="text-xs text-slate-400 font-medium mt-1 block">Aporte em poupança</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Dizimistas Ativos</span>
            <span className="text-2xl font-bold text-emerald-800 block mt-1">78%</span>
            <span className="text-xs text-emerald-600 font-semibold mt-1 block">▲ +3% vs mês anterior</span>
          </div>
        </div>

        {/* Charts & Graphs mockup */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Histórico de Entradas vs Saídas</h3>
              <BarChart3 className="h-4 w-4 text-emerald-700" />
            </div>
            
            {/* Visual HTML vertical bar chart with axis labels and grid lines */}
            <div className="flex gap-4 pt-4">
              {/* Y-Axis Labels */}
              <div className="flex flex-col justify-between text-[10px] text-slate-400 h-44 pb-6 select-none font-mono">
                <span>R$ 50k</span>
                <span>R$ 37.5k</span>
                <span>R$ 25k</span>
                <span>R$ 12.5k</span>
                <span>R$ 0</span>
              </div>
              
              {/* Grid & Bars Container */}
              <div className="flex-grow relative h-44 border-b border-l border-slate-200">
                {/* Horizontal Gridlines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  <div className="w-full border-t border-slate-100"></div>
                  <div className="w-full border-t border-slate-100"></div>
                  <div className="w-full border-t border-slate-100"></div>
                  <div className="w-full border-t border-slate-100"></div>
                  <div className="w-full"></div> {/* Bottom line */}
                </div>
                
                {/* Bars */}
                <div className="absolute inset-0 flex items-end justify-around px-2">
                  {/* Março */}
                  <div className="flex flex-col items-center gap-1.5 w-1/5 group/bar relative">
                    <div className="flex items-end gap-1 sm:gap-1.5 h-32">
                      <div className="bg-emerald-600 w-3 sm:w-5 rounded-t transition-all hover:bg-emerald-500 relative group/val" style={{ height: '76%' }}>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-800 text-white text-[9px] font-mono py-0.5 px-1.5 rounded opacity-0 group-hover/val:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-sm z-20">
                          R$ 38.000
                        </div>
                      </div>
                      <div className="bg-amber-500 w-3 sm:w-5 rounded-t transition-all hover:bg-amber-400 relative group/val" style={{ height: '67%' }}>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-800 text-white text-[9px] font-mono py-0.5 px-1.5 rounded opacity-0 group-hover/val:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-sm z-20">
                          R$ 33.600
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 mt-1">Março</span>
                  </div>
                  
                  {/* Abril */}
                  <div className="flex flex-col items-center gap-1.5 w-1/5 group/bar relative">
                    <div className="flex items-end gap-1 sm:gap-1.5 h-32">
                      <div className="bg-emerald-600 w-3 sm:w-5 rounded-t transition-all hover:bg-emerald-500 relative group/val" style={{ height: '84%' }}>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-800 text-white text-[9px] font-mono py-0.5 px-1.5 rounded opacity-0 group-hover/val:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-sm z-20">
                          R$ 42.000
                        </div>
                      </div>
                      <div className="bg-amber-500 w-3 sm:w-5 rounded-t transition-all hover:bg-amber-400 relative group/val" style={{ height: '71%' }}>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-800 text-white text-[9px] font-mono py-0.5 px-1.5 rounded opacity-0 group-hover/val:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-sm z-20">
                          R$ 35.700
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 mt-1">Abril</span>
                  </div>
                  
                  {/* Maio */}
                  <div className="flex flex-col items-center gap-1.5 w-1/5 group/bar relative">
                    <div className="flex items-end gap-1 sm:gap-1.5 h-32">
                      <div className="bg-emerald-600 w-3 sm:w-5 rounded-t transition-all hover:bg-emerald-500 relative group/val" style={{ height: '81%' }}>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-800 text-white text-[9px] font-mono py-0.5 px-1.5 rounded opacity-0 group-hover/val:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-sm z-20">
                          R$ 40.500
                        </div>
                      </div>
                      <div className="bg-amber-500 w-3 sm:w-5 rounded-t transition-all hover:bg-amber-400 relative group/val" style={{ height: '66%' }}>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-800 text-white text-[9px] font-mono py-0.5 px-1.5 rounded opacity-0 group-hover/val:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-sm z-20">
                          R$ 33.100
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 mt-1">Maio</span>
                  </div>
                  
                  {/* Junho */}
                  <div className="flex flex-col items-center gap-1.5 w-1/5 group/bar relative">
                    <div className="flex items-end gap-1 sm:gap-1.5 h-32">
                      <div className="bg-emerald-700 w-3 sm:w-5 rounded-t transition-all hover:bg-emerald-600 relative group/val" style={{ height: '90%' }}>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-800 text-white text-[9px] font-mono py-0.5 px-1.5 rounded opacity-0 group-hover/val:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-sm z-20">
                          R$ 45.230
                        </div>
                      </div>
                      <div className="bg-amber-600 w-3 sm:w-5 rounded-t transition-all hover:bg-amber-500 relative group/val" style={{ height: '64%' }}>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-800 text-white text-[9px] font-mono py-0.5 px-1.5 rounded opacity-0 group-hover/val:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-sm z-20">
                          R$ 31.840
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-800 mt-1">Junho</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-4 text-xs font-semibold pt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-emerald-700 rounded"></div>
                <span className="text-slate-600">Entradas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-amber-600 rounded"></div>
                <span className="text-slate-600">Saídas</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Origem das Entradas</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-600">Dízimos</span>
                <span className="font-bold text-slate-800">65%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-700 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
              
              <div className="flex justify-between items-center text-xs pt-1">
                <span className="font-semibold text-slate-600">Ofertas Voluntárias</span>
                <span className="font-bold text-slate-800">20%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '20%' }}></div>
              </div>

              <div className="flex justify-between items-center text-xs pt-1">
                <span className="font-semibold text-slate-600">Ofertas Especiais</span>
                <span className="font-bold text-slate-800">10%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-teal-600 h-2 rounded-full" style={{ width: '10%' }}></div>
              </div>

              <div className="flex justify-between items-center text-xs pt-1">
                <span className="font-semibold text-slate-600">Outras Receitas</span>
                <span className="font-bold text-slate-800">5%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-slate-400 h-2 rounded-full" style={{ width: '5%' }}></div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Destinação das Saídas</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-600">Aluguel e Manutenção</span>
                <span className="font-bold text-slate-800">40%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-700 h-2 rounded-full" style={{ width: '40%' }}></div>
              </div>
              
              <div className="flex justify-between items-center text-xs pt-1">
                <span className="font-semibold text-slate-600">Missões e Ação Social</span>
                <span className="font-bold text-slate-800">30%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '30%' }}></div>
              </div>

              <div className="flex justify-between items-center text-xs pt-1">
                <span className="font-semibold text-slate-600">Congregações e Educação</span>
                <span className="font-bold text-slate-800">20%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-teal-600 h-2 rounded-full" style={{ width: '20%' }}></div>
              </div>

              <div className="flex justify-between items-center text-xs pt-1">
                <span className="font-semibold text-slate-600">Eventos e Festividades</span>
                <span className="font-bold text-slate-800">10%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-slate-400 h-2 rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 4. HIGH FIDELITY FINANCEIRO ANALITICO VIEW
  const renderFinanceiroAnalitico = () => {
    const rows = [
      { date: "22/06", desc: "Dízimo Consolidado Culto Manhã", cat: "Dízimo", type: "Entrada", val: "R$ 4.500,00", status: "Conciliado" },
      { date: "21/06", desc: "Manutenção Ar Condicionado Central", cat: "Manutenção", type: "Saída", val: "R$ 1.200,00", status: "Conciliado" },
      { date: "18/06", desc: "Oferta Missionária Especial", cat: "Oferta", type: "Entrada", val: "R$ 2.450,00", status: "Conciliado" },
      { date: "15/06", desc: "Pagamento Conta Energia (Neoenergia)", cat: "Utilidades", type: "Saída", val: "R$ 870,00", status: "Pendente" },
      { date: "10/06", desc: "Ajuda de Custo Missionário Sustentado", cat: "Missões", type: "Saída", val: "R$ 3.000,00", status: "Conciliado" }
    ]

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Extrato Analítico</h1>
            <p className="text-sm text-slate-500 mt-1">Listagem detalhada das transações financeiras consolidadas.</p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3.5 py-2 rounded-xl border border-emerald-100 text-xs font-semibold">
            <ListFilter className="h-4.5 w-4.5 text-emerald-700" />
            Extrato de Junho
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Descrição</th>
                  <th className="px-6 py-4">Categoria</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4">Valor</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-500">{row.date}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">{row.desc}</td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                        {row.cat}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${row.type === 'Entrada' ? 'text-emerald-700' : 'text-amber-600'}`}>
                        {row.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold">{row.val}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          row.status === 'Conciliado' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                        }`}>
                          {row.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // 5. HIGH FIDELITY BIBLE STUDIES VIEW
  const renderEstudos = () => {
    const studies = [
      {
        id: 1,
        title: "Série Efésios: Vivendo a Unidade no Espírito",
        category: "Pregação",
        speaker: "Rev. Marcos Aurelio",
        date: "21 Jun, 2026",
        desc: "Uma análise expositiva do capítulo 4 de Efésios. Como a maturidade cristã e a diversidade de dons servem para a edificação do corpo de Cristo na igreja local.",
        videoUrl: "https://www.youtube.com/watch?v=mock",
        duration: "45 min",
        grouping: "Epístolas"
      },
      {
        id: 2,
        title: "A Justificação pela Fé Somente (Sola Fide)",
        category: "Estudo Bíblico",
        speaker: "Sem. Lucas Silva",
        date: "14 Jun, 2026",
        desc: "Um estudo sistemático da Carta aos Romanos, focando na herança teológica da Reforma e a suficiência do sacrifício de Cristo para nossa salvação.",
        videoUrl: null,
        duration: "15 min leitura",
        grouping: "Teologia"
      },
      {
        id: 3,
        title: "Parábolas do Reino: O Trigo e o Joio",
        category: "Vídeo Aula",
        speaker: "Rev. Marcos Aurelio",
        date: "07 Jun, 2026",
        desc: "Aula expositiva sobre os mistérios do Reino dos Céus. O discernimento cristão, a paciência divina e a consumação dos séculos nas parábolas de Mateus 13.",
        videoUrl: "https://www.youtube.com/watch?v=mock2",
        duration: "30 min",
        grouping: "Teologia"
      }
    ]

    const filteredStudies = estudosFilter === 'Todos'
      ? studies
      : studies.filter(item => item.grouping === estudosFilter)

    return (
      <div className="space-y-6">
        {/* Banner */}
        <div className="relative bg-teal-800 text-white rounded-3xl p-6 sm:p-8 overflow-hidden shadow-lg flex flex-col justify-center min-h-[160px]">
          <div className="absolute right-0 top-0 opacity-10 translate-x-12 -translate-y-12 select-none pointer-events-none">
            <BookOpen className="h-64 w-64" />
          </div>
          <span className="text-xs font-bold bg-teal-700/50 uppercase tracking-widest px-3 py-1 rounded-full w-fit">Escola Bíblica e Discipulado</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">Estudos & Pregações</h1>
          <p className="text-sm text-teal-100 mt-2 max-w-xl">Aprofunde seu conhecimento nas Escrituras através de sermões dominicais, estudos teológicos e videoaulas pastorais.</p>
        </div>

        {/* Filter Categories Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
          {['Todos', 'Epístolas', 'Teologia'].map(category => (
            <button
              key={category}
              onClick={() => setEstudosFilter(category)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 border ${
                estudosFilter === category
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Grid List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredStudies.map((item) => (
            <div key={item.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div>
                {/* Visual Video Thumbnail Placeholder */}
                {item.videoUrl ? (
                  <div className="relative h-44 bg-slate-900 flex items-center justify-center text-slate-400 group cursor-pointer">
                    <div className="absolute inset-0 bg-emerald-950/20 group-hover:bg-emerald-950/40 transition-colors" />
                    <PlayCircle className="h-12 w-12 text-white/80 group-hover:text-white group-hover:scale-110 transition-all z-10" />
                    <span className="absolute bottom-2 right-2 bg-slate-950/70 text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold">{item.duration}</span>
                  </div>
                ) : (
                  <div className="relative h-44 bg-emerald-50 flex items-center justify-center text-emerald-700">
                    <BookOpen className="h-12 w-12 opacity-60" />
                    <span className="absolute bottom-2 right-2 bg-emerald-800/10 text-emerald-800 text-[10px] font-mono px-2 py-0.5 rounded font-bold">{item.duration}</span>
                  </div>
                )}

                <div className="p-5 space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                    <div className="flex gap-1.5 items-center">
                      <span className="bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider">{item.category}</span>
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full uppercase tracking-wider">{item.grouping}</span>
                    </div>
                    <span>{item.date}</span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-base leading-snug hover:text-emerald-700 transition-colors cursor-pointer">{item.title}</h3>
                  <p className="text-xs text-slate-400 font-semibold">Ministrado por: {item.speaker}</p>
                  <p className="text-slate-500 text-xs leading-relaxed pt-1.5">{item.desc}</p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors uppercase tracking-wider mt-4 pt-3 border-t border-slate-100 w-full text-left">
                  {item.videoUrl ? 'Assistir Transmissão' : 'Ler Estudo Completo'}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderUrna = () => {
    return (
      <div className="w-full max-w-2xl mx-auto flex items-center justify-center p-4">
        {loading && step === 1 && (
          <div className="absolute inset-0 bg-slate-50/70 z-50 flex flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 text-emerald-700 animate-spin mb-2" />
            <span className="text-sm font-medium text-slate-600">Processando informações...</span>
          </div>
        )}

        {/* STEP 1: IDENTIFICATION (LOGIN) */}
        {step === 1 && (
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 animate-in fade-in duration-200">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Assembleia de Votação</h2>
              <p className="text-sm text-slate-500 mt-1">Identifique-se para verificar sua elegibilidade</p>
            </div>

            {error && (
              <div className="mb-5 bg-red-50 text-red-700 border border-red-200 p-4 rounded-xl text-sm flex gap-3 items-start">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block mb-0.5">Erro na validação</span>
                  {error}
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Assembleia / Votação
                </label>
                <select
                  value={selectedVotacaoId}
                  onChange={(e) => setSelectedVotacaoId(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 bg-white text-slate-800 text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors"
                >
                  {votacoes.length === 0 ? (
                    <option value="">Carregando eleições ativas...</option>
                  ) : (
                    votacoes.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.titulo}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  CPF
                </label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={handleCpfChange}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm bg-white text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Ano de Nascimento
                </label>
                <input
                  type="number"
                  placeholder="Ex: 1990"
                  value={anoNascimento}
                  onChange={(e) => setAnoNascimento(e.target.value.slice(0, 4))}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm bg-white text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors"
                  min="1900"
                  max="2026"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || votacoes.length === 0}
                className="w-full bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl hover:bg-emerald-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6 shadow-sm"
              >
                VERIFICAR ELEGIBILIDADE
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: BALLOT (CÉDULA) */}
        {step === 2 && cedula && (
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col md:my-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="text-sm font-semibold text-emerald-700 block mb-1">Área do Eleitor</span>
                  <h2 className="text-xl font-bold text-slate-900">Olá, {nomeMembro}!</h2>
                </div>
              </div>
              
              <div className="mt-4 bg-white border border-slate-200 p-4 rounded-xl">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pauta em Votação</span>
                <h3 className="text-lg font-bold text-slate-800 mt-0.5">{cedula.titulo}</h3>
                {cedula.descricao && (
                  <p className="text-sm text-slate-500 mt-1">{cedula.descricao}</p>
                )}
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-semibold">
                  <ShieldCheck className="h-4 w-4 text-emerald-700" />
                  Você pode escolher até {cedula.limiteVotos} {cedula.limiteVotos === 1 ? 'opção' : 'opções'}
                </div>
              </div>
            </div>

            {/* CANDIDATES GRID */}
            <div className="p-6 flex-grow">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Candidatos / Opções disponíveis</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cedula.opcoes.map((opcao) => {
                  const isSelected = selectedOpcoes.includes(opcao.opcaoId)

                  return (
                    <div
                      key={opcao.opcaoId}
                      onClick={() => handleSelectOption(opcao.opcaoId)}
                      className={`border rounded-xl p-4 transition-all flex items-center justify-between gap-3 select-none hover:border-slate-300 cursor-pointer ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/30 ring-1 ring-emerald-600'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {opcao.fotoUrl ? (
                          <img
                            src={opcao.fotoUrl}
                            alt={opcao.tituloOpcao}
                            className="w-12 h-12 rounded-full object-cover border border-slate-100 shrink-0"
                            onError={(e) => { e.target.style.display = 'none' }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 font-bold text-sm flex items-center justify-center shrink-0">
                            {getInitials(opcao.tituloOpcao)}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-800 text-sm leading-snug">{opcao.tituloOpcao}</p>
                        </div>
                      </div>

                      {/* Selection Indicator */}
                      <div className="shrink-0">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          isSelected ? 'border-emerald-700 bg-emerald-700' : 'border-slate-300'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-slate-100 p-4 bg-slate-50 flex justify-center items-center">
              <button
                onClick={() => setShowModal(true)}
                className={`w-full max-w-md font-semibold py-3 px-6 rounded-xl transition-all shadow-sm ${
                  selectedOpcoes.length > 0
                    ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                    : 'bg-amber-600 text-white hover:bg-amber-700'
                }`}
              >
                {selectedOpcoes.length > 0 
                  ? `CONFIRMAR VOTO (${selectedOpcoes.length}/${cedula.limiteVotos})` 
                  : 'VOTAR EM BRANCO / NULO'
                }
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS */}
        {step === 3 && (
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 text-center my-8 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-center mb-4">
              <div className="bg-emerald-50 p-3 rounded-full animate-bounce">
                <CheckCircle2 className="h-16 w-16 text-emerald-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Voto Registrado!</h2>
            <p className="text-sm text-slate-500 mt-1.5">Sua participação foi computada com sucesso.</p>

            <div className="border-2 border-emerald-600 bg-white p-5 my-6 rounded-2xl">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-1">
                Comprovante de Auditoria
              </span>
              <span className="text-3xl font-mono font-bold text-emerald-800 tracking-widest block py-2 select-all">
                {codigoAuditoria}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs text-slate-500 text-left space-y-2">
              <p className="font-semibold text-slate-600 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-700" /> Instruções Importantes:
              </p>
              <p>1. <strong>Salve esse código:</strong> Anote ou tire um print screen desta tela agora.</p>
              <p>2. <strong>Anonimato garantido:</strong> Esse código não está associado ao seu CPF na contagem.</p>
            </div>

            <button
              onClick={handleVoterLogout}
              className="w-full border border-slate-200 text-slate-600 font-semibold py-3 px-4 rounded-xl hover:bg-slate-50 transition-colors mt-6"
            >
              VOLTAR AO INÍCIO
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased relative">
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 flex justify-between items-center w-full px-6 py-4 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600 focus:outline-none"
            title="Menu Principal"
          >
            <Menu className="h-6 w-6" />
          </button>
          <img
            src="/logo.png"
            alt="Logotipo Oficial da Igreja"
            className="h-10 w-auto max-w-[150px] object-contain animate-in fade-in duration-200"
          />
          <div className="h-5 w-px bg-slate-200"></div>
          <span className="text-xs sm:text-sm font-bold text-slate-700 bg-slate-50 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg border border-slate-100 animate-in slide-in-from-left-2 duration-300 max-w-[120px] sm:max-w-none truncate">
            {getViewTitle(currentView)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isAdminAuthenticated && (
            <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-full text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Administrador
            </span>
          )}
          {step === 2 && currentView === 'voting' && (
            <button
              onClick={handleVoterLogout}
              className="text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors uppercase tracking-wider bg-transparent border-0 p-0 flex items-center gap-1.5 focus:outline-none"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          )}
        </div>
      </header>

      {/* SLIDING SIDEBAR DRAWER */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 shadow-2xl transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out flex flex-col`}>
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="h-8 w-auto object-contain" />
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Links */}
        <div className="p-5 flex-grow space-y-6 overflow-y-auto">
          {/* GROUP 1: PORTAL DA IGREJA */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Portal da Igreja</h4>
            <button
              onClick={() => navigateTo('feed')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                currentView === 'feed' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Newspaper className="h-5 w-5 text-emerald-700" />
              Feed de Notícias
            </button>
            <button
              onClick={() => navigateTo('calendario')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                currentView === 'calendario' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Calendar className="h-5 w-5 text-emerald-700" />
              Calendário
            </button>
            <button
              onClick={() => navigateTo('estudos')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                currentView === 'estudos' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="h-5 w-5 text-emerald-700" />
              Estudos Bíblicos
            </button>
          </div>

          {/* GROUP 2: ELEIÇÃO */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Eleição</h4>
            <button
              onClick={() => navigateTo('voting')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                currentView === 'voting' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Vote className="h-5 w-5 text-emerald-700" />
              Assembleia / Votar
            </button>
            <button
              onClick={() => navigateTo('apuracao')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                currentView === 'apuracao' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="h-5 w-5 text-emerald-700" />
              Apuração Eleição
            </button>
            <button
              onClick={() => navigateTo('cadastro')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                currentView === 'cadastro' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Settings className="h-5 w-5 text-emerald-700" />
              Cadastrar Eleição
            </button>
            <button
              onClick={() => navigateTo('restricoes')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                currentView === 'restricoes' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ShieldAlert className="h-5 w-5 text-emerald-700" />
              Restrição de Votos
            </button>
          </div>

          {/* GROUP 3: PAINEL ADMINISTRATIVO */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Painel Administrativo</h4>
            <button
              onClick={() => navigateTo('membros')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                currentView === 'membros' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <UserCheck className="h-5 w-5 text-emerald-700" />
              Cadastro de Membros
            </button>
            <button
              onClick={() => navigateTo('organograma')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                currentView === 'organograma' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Users className="h-5 w-5 text-emerald-700" />
              Organograma
            </button>
          </div>

          {/* GROUP 4: FINANCEIRO */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Grupo Financeiro</h4>
            <button
              onClick={() => navigateTo('dashboards')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                currentView === 'dashboards' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <PieChart className="h-5 w-5 text-emerald-700" />
              Dashboards
            </button>
            <button
              onClick={() => navigateTo('analitico')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                currentView === 'analitico' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <DollarSign className="h-5 w-5 text-emerald-700" />
              Analítico
            </button>
          </div>
        </div>

        {/* Signout */}
        {isAdminAuthenticated && (
          <div className="p-5 border-t border-slate-100">
            <button
              onClick={handleAdminLogout}
              className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-700 hover:bg-red-50 font-semibold py-2 rounded-xl transition-colors text-xs"
            >
              <LogOut className="h-4 w-4" />
              Sair do Painel
            </button>
          </div>
        )}
      </div>

      {/* OVERLAY */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-45 bg-slate-900/35 backdrop-blur-xs transition-opacity duration-300"
        />
      )}

      {/* MAIN CONTAINER */}
      <main className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full">
        {isAdminView && !isAdminAuthenticated ? (
          <div className="flex items-center justify-center p-4 min-h-[60vh] font-sans text-slate-800 antialiased">
            <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
              <div className="text-center mb-6">
                <div className="flex justify-center mb-3">
                  <div className="bg-emerald-50 p-3 rounded-full">
                    <ShieldCheck className="h-8 w-8 text-emerald-700" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Acesso Restrito</h2>
                <p className="text-sm text-slate-500 mt-1 font-medium">Esta área requer autenticação de administrador.</p>
              </div>

              {adminError && (
                <div className="mb-4 bg-red-50 text-red-700 border border-red-200 p-3 rounded-xl text-xs flex gap-2 items-center">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                  <span>{adminError}</span>
                </div>
              )}

              <form onSubmit={handleAdminAuth} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Senha Administrativa
                  </label>
                  <input
                    type="password"
                    placeholder="Digite a senha..."
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm bg-white text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors animate-none"
                    autoFocus
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => navigateTo('voting')}
                    className="w-1/2 border border-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-sm"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 bg-emerald-700 text-white font-semibold py-2.5 rounded-xl hover:bg-emerald-800 transition-colors text-sm shadow-sm"
                  >
                    Entrar
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          renderContent()
        )}
      </main>

      {/* DOUBLE CHECK MODAL FOR URNA */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 p-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-900">
              {selectedOpcoes.length > 0 ? 'Confirmar Envio do Voto?' : 'Confirmar Voto em Branco?'}
            </h3>
            <p className="text-sm text-slate-500 mt-2.5 leading-relaxed">
              {selectedOpcoes.length > 0 
                ? 'Esta ação é irreversível. Você não poderá alterar suas escolhas ou votar novamente depois de confirmar.'
                : 'Você está prestes a votar EM BRANCO (nenhuma opção selecionada). Esta ação é irreversível e contará como sua participação final.'
              }
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={handleConfirmVote}
                className="w-full bg-emerald-700 text-white font-semibold py-3 rounded-xl hover:bg-emerald-800 transition-colors shadow-sm"
              >
                Sim, Confirmar Voto
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="w-full text-slate-500 font-medium py-3 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Voltar e Corrigir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400 mt-12">
        <p className="font-semibold text-slate-500">Igreja Presbiteriana dos Ipês</p>
        <p className="mt-1">Sistema Integrado de Gestão Eclesiástica e Eleitoral © 2026</p>
      </footer>
    </div>
  )
}

export default App
