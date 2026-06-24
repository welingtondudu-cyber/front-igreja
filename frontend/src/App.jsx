import { useState, useEffect } from 'react'
import { CheckCircle2, AlertCircle, Loader2, User, Check, ShieldCheck, LogOut } from 'lucide-react'
import Apuracao from './Apuracao'
import CadastroEleicao from './CadastroEleicao'

function App() {
  // Navigation & View States
  const [currentView, setCurrentView] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('view') === 'apuracao' || window.location.pathname === '/apuracao') {
      return 'apuracao'
    }
    if (window.location.pathname === '/cadastro') {
      return 'cadastro'
    }
    return 'voting'
  })

  const [step, setStep] = useState(1) // 1: Login, 2: Ballot, 3: Success
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Admin Auth States
  const [adminPassword, setAdminPassword] = useState('')
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return sessionStorage.getItem('isAdminAuthenticated') === 'true'
  })
  const [adminError, setAdminError] = useState(null)

  const handleAdminAuth = (e) => {
    e.preventDefault()
    if (adminPassword === 'ipes2026') {
      sessionStorage.setItem('isAdminAuthenticated', 'true')
      setIsAdminAuthenticated(true)
      setAdminError(null)
    } else {
      setAdminError('Senha administrativa incorreta.')
    }
  }

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

  // Handle Logout / Clear Session
  const handleLogout = () => {
    setStep(1)
    setCpf('')
    setAnoNascimento('')
    setMembroId(null)
    setNomeMembro('')
    setCedula(null)
    setSelectedOpcoes([])
    setError(null)
  }

  // Handle Login Form Submit
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

  // Handle Option Selection
  const handleSelectOption = (opcaoId) => {
    if (!cedula) return

    const { limiteVotos } = cedula

    if (selectedOpcoes.includes(opcaoId)) {
      setSelectedOpcoes(selectedOpcoes.filter(id => id !== opcaoId))
    } else {
      if (selectedOpcoes.length < limiteVotos) {
        setSelectedOpcoes([...selectedOpcoes, opcaoId])
      } else {
        // Substitui a primeira selecionada (FIFO) para permitir alterar o voto no limite
        setSelectedOpcoes([...selectedOpcoes.slice(1), opcaoId])
      }
    }
  }

  // Submit Vote to Backend
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
        // Se der erro, volta para a etapa 1 para segurança ou exibe na cédula
        setStep(1)
        return
      }

      const auditCode = await response.text()
      setCodigoAuditoria(auditCode)
      setStep(3) // Avança para o sucesso
    } catch (err) {
      setError('Falha ao enviar seu voto. Verifique sua conexão.')
      setStep(1)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleBackToVoting = () => {
    setCurrentView('voting')
    window.history.pushState({}, '', '/')
  }

  if ((currentView === 'apuracao' || currentView === 'cadastro') && !isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-800 antialiased">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <div className="bg-emerald-50 p-3 rounded-full">
                <ShieldCheck className="h-8 w-8 text-emerald-700" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Acesso Restrito</h2>
            <p className="text-sm text-slate-500 mt-1">Esta área requer autenticação de administrador.</p>
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
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm bg-white text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors"
                autoFocus
                required
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleBackToVoting}
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
    )
  }

  if (currentView === 'apuracao') {
    return <Apuracao onBackToVote={handleBackToVoting} />
  }

  if (currentView === 'cadastro') {
    return <CadastroEleicao onBack={handleBackToVoting} />
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased">
      {/* HEADER LOGO & LOGOUT */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 flex justify-between items-center w-full px-6 py-4 shadow-sm">
        <img
          src="/logo.png"
          alt="Logotipo Oficial da Igreja"
          className="h-10 w-auto max-w-[150px] object-contain"
        />
        {step === 2 && (
          <button
            onClick={handleLogout}
            className="text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors uppercase tracking-wider bg-transparent border-0 p-0 flex items-center gap-1.5 focus:outline-none"
          >
            <LogOut className="h-4 w-4" />
            Sair da Votação
          </button>
        )}
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-grow flex items-center justify-center p-4">
        {loading && step === 1 && (
          <div className="absolute inset-0 bg-slate-50/70 z-50 flex flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 text-emerald-700 animate-spin mb-2" />
            <span className="text-sm font-medium text-slate-600">Processando informações...</span>
          </div>
        )}

        {/* STEP 1: IDENTIFICATION (LOGIN) */}
        {step === 1 && (
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
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
                        {/* Candidate Avatar */}
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

                      {/* Selection indicator */}
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

            {/* Bottom action bar */}
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

        {/* STEP 3: SUCCESS & AUDIT */}
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
              <p>
                1. <strong>Salve esse código:</strong> Anote ou tire um print screen desta tela agora.
              </p>
              <p>
                2. <strong>Anonimato garantido:</strong> Esse código não está associado ao seu CPF na contagem. Ele serve apenas para atestar que seu voto foi somado ao total.
              </p>
            </div>

            <button
              onClick={() => setStep(1)}
              className="w-full border border-slate-200 text-slate-600 font-semibold py-3 px-4 rounded-xl hover:bg-slate-50 transition-colors mt-6"
            >
              VOLTAR AO INÍCIO
            </button>
          </div>
        )}
      </main>

      {/* DOUBLE CHECK CONFIRMATION MODAL */}
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
    </div>
  )
}

export default App
