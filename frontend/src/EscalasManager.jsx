import { useState } from 'react'
import {
  Calendar, Users, User, Clock, Plus, Trash2, CheckCircle2,
  AlertCircle, X, Search, Filter, Mail, Check, AlertTriangle,
  HelpCircle, ChevronRight, UserPlus, Info
} from 'lucide-react'

export default function EscalasManager() {
  // Lista inicial simulada de escalas
  const [escalas, setEscalas] = useState([
    {
      id: 1,
      evento: 'Culto de Celebração - Domingo Noite',
      data: '2026-07-05',
      hora: '19:00',
      ministerio: 'Louvor & Adoração',
      observacoes: 'Passagem de som às 17:30. Oração com a equipe às 18:40.',
      voluntarios: [
        { funcao: 'Líder de Louvor / Violão', nome: 'Guilherme Santos', status: 'CONFIRMADO' },
        { funcao: 'Teclado', nome: 'Juliana Mendes', status: 'CONFIRMADO' },
        { funcao: 'Bateria', nome: 'Thiago Oliveira', status: 'PENDENTE' },
        { funcao: 'Backing Vocal', nome: 'Sarah Rocha', status: 'CONFIRMADO' },
        { funcao: 'Baixo', nome: 'Marcos Silva', status: 'RECUSADO', motivo: 'Viagem a trabalho' }
      ]
    },
    {
      id: 2,
      evento: 'Culto de Celebração - Domingo Manhã',
      data: '2026-07-05',
      hora: '09:00',
      ministerio: 'Mídia & Sonoplastia',
      observacoes: 'Ligar projetores e testar transmissão do YouTube às 08:20.',
      voluntarios: [
        { funcao: 'Operador de Som', nome: 'Lucas Ramos', status: 'CONFIRMADO' },
        { funcao: 'Transmissão / Câmera', nome: 'Gabriel Costa', status: 'PENDENTE' },
        { funcao: 'Projeção / Letras', nome: 'Mariana Lima', status: 'CONFIRMADO' }
      ]
    },
    {
      id: 3,
      evento: 'Culto de Doutrina - Quarta-Feira',
      data: '2026-07-08',
      hora: '19:30',
      ministerio: 'Recepção & Diaconato',
      observacoes: 'Organizar envelopes de dízimo nas poltronas. Chegar às 19:00.',
      voluntarios: [
        { funcao: 'Recepção Entrada Principal', nome: 'Carla Souza', status: 'CONFIRMADO' },
        { funcao: 'Apoio Nave / Galeria', nome: 'Roberto Alves', status: 'CONFIRMADO' },
        { funcao: 'Recepção Estacionamento', nome: 'Fernando Silva', status: 'RECUSADO', motivo: 'Consulta médica agendada' }
      ]
    },
    {
      id: 4,
      evento: 'Culto Infantil - Domingo Noite',
      data: '2026-07-05',
      hora: '19:00',
      ministerio: 'Ministério Infantil (Kids)',
      observacoes: 'Preparar material didático para a lição "A Arca de Noé".',
      voluntarios: [
        { funcao: 'Professora Juniores (9-12 anos)', nome: 'Beatriz Costa', status: 'CONFIRMADO' },
        { funcao: 'Auxiliar Maternal (0-3 anos)', nome: 'Larissa Santos', status: 'PENDENTE' },
        { funcao: 'Professor Primários (4-8 anos)', nome: 'Felipe Neves', status: 'CONFIRMADO' }
      ]
    }
  ])

  // Cadastro de nova escala
  const [showModal, setShowModal] = useState(false)
  const [evento, setEvento] = useState('')
  const [data, setData] = useState('')
  const [hora, setHora] = useState('')
  const [ministerio, setMinisterio] = useState('Louvor & Adoração')
  const [observacoes, setObservacoes] = useState('')
  const [voluntariosInput, setVoluntariosInput] = useState([
    { funcao: 'Função principal', nome: '', status: 'PENDENTE' }
  ])

  // Filtros ativos
  const [filtroMinisterio, setFiltroMinisterio] = useState('Todos')
  const [filtroStatus, setFiltroStatus] = useState('Todos')
  const [buscaNome, setBuscaNome] = useState('')

  // Mensagem de Feedback
  const [feedback, setFeedback] = useState(null)

  // Funções para gerenciar inputs de voluntários no formulário
  const handleAddVoluntarioField = () => {
    setVoluntariosInput(prev => [...prev, { funcao: '', nome: '', status: 'PENDENTE' }])
  }

  const handleRemoveVoluntarioField = (idx) => {
    setVoluntariosInput(prev => prev.filter((_, i) => i !== idx))
  }

  const handleVoluntarioFieldChange = (idx, field, value) => {
    setVoluntariosInput(prev =>
      prev.map((v, i) => (i === idx ? { ...v, [field]: value } : v))
    )
  }

  // Ações da escala
  const handleSaveEscala = (e) => {
    e.preventDefault()

    if (!evento || !data || !hora) {
      alert('Por favor, preencha os campos obrigatórios (Evento, Data e Hora).')
      return
    }

    const novosVoluntarios = voluntariosInput.filter(v => v.nome.trim() !== '')
    if (novosVoluntarios.length === 0) {
      alert('Por favor, adicione pelo menos um voluntário com nome para a escala.')
      return
    }

    const novaEscala = {
      id: Date.now(),
      evento,
      data,
      hora,
      ministerio,
      observacoes,
      voluntarios: novosVoluntarios
    }

    setEscalas(prev => [novaEscala, ...prev])
    setShowModal(false)

    // Reset Form
    setEvento('')
    setData('')
    setHora('')
    setMinisterio('Louvor & Adoração')
    setObservacoes('')
    setVoluntariosInput([{ funcao: 'Função principal', nome: '', status: 'PENDENTE' }])

    // Mensagem de sucesso
    setFeedback({ tipo: 'success', texto: 'Escala adicionada com sucesso para demonstração!' })
    setTimeout(() => setFeedback(null), 4000)
  }

  const handleDeleteEscala = (id) => {
    if (window.confirm('Deseja realmente remover esta escala da demonstração?')) {
      setEscalas(prev => prev.filter(e => e.id !== id))
      setFeedback({ tipo: 'info', texto: 'Escala removida.' })
      setTimeout(() => setFeedback(null), 3000)
    }
  }

  // Troca de status de confirmação rápido
  const handleToggleStatus = (escalaId, voluntarioNome, novoStatus) => {
    setEscalas(prev =>
      prev.map(esc => {
        if (esc.id === escalaId) {
          return {
            ...esc,
            voluntarios: esc.voluntarios.map(v =>
              v.nome === voluntarioNome ? { ...v, status: novoStatus, motivo: novoStatus === 'RECUSADO' ? 'Simulado via painel rápido' : undefined } : v
            )
          }
        }
        return esc
      })
    )
  }

  // Filtragem das escalas
  const escalasFiltradas = escalas.filter(esc => {
    const matchMin = filtroMinisterio === 'Todos' || esc.ministerio === filtroMinisterio
    
    // Filtro por voluntário envolvido
    const matchBusca = buscaNome === '' || 
      esc.evento.toLowerCase().includes(buscaNome.toLowerCase()) ||
      esc.voluntarios.some(v => v.nome.toLowerCase().includes(buscaNome.toLowerCase()))

    // Filtro por status
    const matchStatus = filtroStatus === 'Todos' ||
      esc.voluntarios.some(v => v.status === filtroStatus)

    return matchMin && matchBusca && matchStatus
  })

  // Dados consolidados do topo
  const totalEscalas = escalas.length
  const totalConfirmados = escalas.reduce((acc, curr) => acc + curr.voluntarios.filter(v => v.status === 'CONFIRMADO').length, 0)
  const totalPendentes = escalas.reduce((acc, curr) => acc + curr.voluntarios.filter(v => v.status === 'PENDENTE').length, 0)
  const totalRecusados = escalas.reduce((acc, curr) => acc + curr.voluntarios.filter(v => v.status === 'RECUSADO').length, 0)

  // Lista de ministérios únicos para filtro
  const ministerios = ['Louvor & Adoração', 'Mídia & Sonoplastia', 'Recepção & Diaconato', 'Ministério Infantil (Kids)', 'Apoio Social', 'Teatro & Dança']

  // Formatar data em PT-BR
  const formatarData = (dataStr) => {
    const parts = dataStr.split('-')
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`
    }
    return dataStr
  }

  return (
    <div className="space-y-6">
      {/* ALERTA DE FEEDBACK */}
      {feedback && (
        <div className={`fixed top-4 right-4 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300 z-50 text-sm font-semibold border ${
          feedback.tipo === 'success' ? 'bg-emerald-50 border-emerald-250 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}>
          {feedback.tipo === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0" />
          ) : (
            <Info className="h-5 w-5 text-slate-500 shrink-0" />
          )}
          {feedback.texto}
        </div>
      )}

      {/* HEADER DE COMANDO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-855 text-[10px] font-bold rounded-full uppercase tracking-wider">Módulo Administrativo</span>
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full uppercase tracking-wider">Protótipo Funcional</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">Escalas de Culto & Ministérios</h1>
          <p className="text-sm text-slate-500 mt-1">Gerencie a escala de voluntários, controle confirmações de presença e adicione novos serviços.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 active:bg-emerald-800 transition-all shadow-sm shrink-0"
        >
          <Plus className="h-5 w-5" />
          Nova Escala
        </button>
      </div>

      {/* CARDS DE RESUMOS E METRICAS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Serviços Escalados</span>
              <span className="text-2xl font-black text-slate-800">{totalEscalas}</span>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl text-slate-500 border border-slate-100">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <span className="text-[10px] text-slate-400 block mt-2.5">Total de escalas ativas na base</span>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-slate-250 rounded-2xl p-5 shadow-sm border-l-4 border-l-emerald-600">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Presenças Confirmadas</span>
              <span className="text-2xl font-black text-emerald-700">{totalConfirmados}</span>
            </div>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-700 border border-emerald-100">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-2.5">Voluntários que já aceitaram</span>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-slate-250 rounded-2xl p-5 shadow-sm border-l-4 border-l-amber-500">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Respostas Pendentes</span>
              <span className="text-2xl font-black text-amber-600">{totalPendentes}</span>
            </div>
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600 border border-amber-100">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <span className="text-[10px] text-amber-600 font-semibold block mt-2.5">Aguardando confirmação</span>
        </div>

        {/* Card 4 */}
        <div className="bg-white border border-slate-250 rounded-2xl p-5 shadow-sm border-l-4 border-l-red-500">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recusas / Necessidade</span>
              <span className="text-2xl font-black text-red-600">{totalRecusados}</span>
            </div>
            <div className="p-2 bg-red-50 rounded-xl text-red-600 border border-red-100">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <span className="text-[10px] text-red-600 font-semibold block mt-2.5">Requer substituto imediato</span>
        </div>
      </div>

      {/* BARRA DE FILTROS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Busca por texto */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-full md:w-64 focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600 transition-all">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Buscar por culto ou voluntário..."
              value={buscaNome}
              onChange={(e) => setBuscaNome(e.target.value)}
              className="bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none w-full font-medium"
            />
          </div>

          {/* Filtro por Ministério */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={filtroMinisterio}
              onChange={(e) => setFiltroMinisterio(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="Todos">Todos os Ministérios</option>
              {ministerios.map((min, idx) => (
                <option key={idx} value={min}>{min}</option>
              ))}
            </select>
          </div>

          {/* Filtro por Status do voluntário */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <Users className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="Todos">Todos os Status</option>
              <option value="CONFIRMADO">Confirmado</option>
              <option value="PENDENTE">Pendente</option>
              <option value="RECUSADO">Recusado</option>
            </select>
          </div>
        </div>

        {/* Informações rápidas */}
        <span className="text-xs text-slate-400 font-semibold">
          Mostrando <strong className="text-slate-700">{escalasFiltradas.length}</strong> escalas
        </span>
      </div>

      {/* GRID DE ESCALAS */}
      {escalasFiltradas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {escalasFiltradas.map((esc) => (
            <div
              key={esc.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-slate-350 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              {/* Topo do card da escala */}
              <div>
                <div className="flex justify-between items-start">
                  <span className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold rounded-full uppercase tracking-wider">
                    {esc.ministerio}
                  </span>
                  <button
                    onClick={() => handleDeleteEscala(esc.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Remover escala"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>

                <h3 className="font-extrabold text-slate-800 text-base mt-2.5">{esc.evento}</h3>

                {/* Data e hora */}
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-emerald-700" />
                    {formatarData(esc.data)}
                  </span>
                  <div className="w-[1px] h-3 bg-slate-200"></div>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-emerald-700" />
                    {esc.hora}h
                  </span>
                </div>

                {/* Observações da Escala */}
                {esc.observacoes && (
                  <div className="mt-3.5 bg-slate-50/50 border border-slate-200 border-dashed rounded-xl p-3 flex gap-2 items-start">
                    <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      {esc.observacoes}
                    </span>
                  </div>
                )}
              </div>

              {/* Lista de voluntários escalados */}
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Equipe Escalada</span>
                <div className="divide-y divide-slate-100">
                  {esc.voluntarios.map((vol, vIdx) => (
                    <div key={vIdx} className="flex justify-between items-center py-2 gap-2 text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          <span className="font-bold text-slate-800">{vol.nome}</span>
                        </div>
                        <span className="text-[10px] font-medium text-slate-400 block pl-5">{vol.funcao}</span>
                        {vol.motivo && (
                          <span className="text-[9px] text-red-500 font-bold block pl-5">Recusado: {vol.motivo}</span>
                        )}
                      </div>

                      {/* Status de Confirmação com Seletor Rápido */}
                      <div className="flex items-center gap-1.5 select-none">
                        {vol.status === 'CONFIRMADO' && (
                          <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[9px] rounded-full flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            Confirmado
                          </span>
                        )}
                        {vol.status === 'PENDENTE' && (
                          <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 font-bold text-[9px] rounded-full flex items-center gap-1">
                            <Clock className="h-3 w-3 animate-pulse" />
                            Pendente
                          </span>
                        )}
                        {vol.status === 'RECUSADO' && (
                          <span className="px-2 py-0.5 bg-red-50 border border-red-200 text-red-750 font-bold text-[9px] rounded-full flex items-center gap-1">
                            <X className="h-3 w-3" />
                            Substituir
                          </span>
                        )}

                        {/* Ações de simulação rápida */}
                        <div className="flex gap-1 border-l border-slate-100 pl-2">
                          <button
                            onClick={() => handleToggleStatus(esc.id, vol.nome, 'CONFIRMADO')}
                            className="p-1 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded transition-all"
                            title="Confirmar voluntário"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(esc.id, vol.nome, 'RECUSADO')}
                            className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-555 rounded transition-all"
                            title="Recusar voluntário"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-16 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-2xl shadow-sm text-center">
          <Calendar className="h-12 w-12 text-slate-200 mb-3" />
          <span className="text-sm font-semibold text-slate-400">Nenhuma escala atende aos filtros atuais.</span>
          <span className="text-xs text-slate-350 mt-1">Experimente alterar os filtros ou adicione uma nova escala no botão superior.</span>
        </div>
      )}

      {/* MODAL DE CADASTRO DE ESCALA */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-250 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            
            {/* Header do modal */}
            <div className="flex justify-between items-center bg-slate-50 px-6 py-4 border-b border-slate-200 shrink-0">
              <div className="space-y-0.5">
                <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Nova Escala de Voluntários</h3>
                <span className="text-[10px] text-slate-400 block font-semibold">Preencha os dados e a equipe escalada para demonstração.</span>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-lg transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Conteúdo do Formulário */}
            <form onSubmit={handleSaveEscala} className="p-6 space-y-4 overflow-y-auto flex-grow">
              
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Evento / Culto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Culto de Domingo Noite, Reunião de Casais..."
                  value={evento}
                  onChange={(e) => setEvento(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Data *</label>
                  <input
                    type="date"
                    required
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Hora do Culto *</label>
                  <input
                    type="time"
                    required
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Ministério / Área</label>
                  <select
                    value={ministerio}
                    onChange={(e) => setMinisterio(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white"
                  >
                    {ministerios.map((min, idx) => (
                      <option key={idx} value={min}>{min}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Observações da Escala</label>
                <textarea
                  placeholder="Ex: Passagem de som às 17h, oração no gabinete..."
                  rows={2}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              {/* Gerenciamento de Voluntários */}
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Equipe / Funções e Nomes</label>
                  <button
                    type="button"
                    onClick={handleAddVoluntarioField}
                    className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:text-emerald-600"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Adicionar Voluntário
                  </button>
                </div>

                <div className="space-y-3">
                  {voluntariosInput.map((vol, vIdx) => (
                    <div key={vIdx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Função (Ex: Teclado, Diácono)"
                        value={vol.funcao}
                        onChange={(e) => handleVoluntarioFieldChange(vIdx, 'funcao', e.target.value)}
                        className="w-1/2 px-3 py-1.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
                      />
                      <input
                        type="text"
                        placeholder="Nome do Voluntário"
                        value={vol.nome}
                        onChange={(e) => handleVoluntarioFieldChange(vIdx, 'nome', e.target.value)}
                        className="w-1/2 px-3 py-1.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
                      />
                      {voluntariosInput.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVoluntarioField(vIdx)}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded hover:bg-slate-100"
                        >
                          <X className="h-4.5 w-4.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Botões do Formulário */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-bold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all shadow-sm"
                >
                  Salvar Escala
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
