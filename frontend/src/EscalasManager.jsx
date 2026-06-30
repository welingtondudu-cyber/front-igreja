import { useState, useEffect } from 'react'
import {
  Calendar, Users, User, Clock, Plus, Trash2, CheckCircle2,
  AlertCircle, X, Search, Filter, Mail, Check, AlertTriangle,
  HelpCircle, ChevronRight, ChevronLeft, UserPlus, Info, CalendarRange, Eye,
  Loader2, Pencil, ChevronDown, ChevronUp, Upload
} from 'lucide-react'

export default function EscalasManager() {
  // Dados do backend
  const [eventos, setEventos] = useState([])
  const [grupos, setGrupos] = useState([]) // Ministérios e Sociedades Internas
  const [membros, setMembros] = useState([]) // todos os membros
  const [membrosDoGrupo, setMembrosDoGrupo] = useState([]) // membros filtrados pelo grupo ativo
  
  // Controle de Abas locais
  const [activeSubTab, setActiveSubTab] = useState('geral') // 'geral' | 'culto' | 'minhas-escalas'
  const [selectedEventoId, setSelectedEventoId] = useState(null) // Para detalhamento de equipe por evento
  const [escalasDoEvento, setEscalasDoEvento] = useState([]) // Escalas do evento selecionado
  const [selectedCargoId, setSelectedCargoId] = useState(null) // Aba ativa do master-detail de ministérios

  // Formulário de Cadastro de Novo Evento / Culto
  const [showModal, setShowModal] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [data, setData] = useState('')
  const [hora, setHora] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [imagemUrl, setImagemUrl] = useState('')
  const [gruposSelecionados, setGruposSelecionados] = useState([]) // List of Grupo IDs

  // Relação de voluntários temporários ao editar escalas de um evento
  const [escalasEdit, setEscalasEdit] = useState([]) // List of { membroId, grupoId, funcaoEspecifica, statusConfirmacao }

  // Simular voluntário ativo logado
  const [membroLogadoId, setMembroLogadoId] = useState('')

  // Filtros ativos
  const [buscaNome, setBuscaNome] = useState('')

  // Modal de justificativa de recusa
  const [showRecusaModal, setShowRecusaModal] = useState(false)
  const [recusaEscalaId, setRecusaEscalaId] = useState(null)
  const [justificativaRecusa, setJustificativaRecusa] = useState('')

  // Novos estados para edição de culto, adição de voluntário e escalas expandidas
  const [selectedMembroIdToAdd, setSelectedMembroIdToAdd] = useState('')
  const [editingEventoId, setEditingEventoId] = useState(null)
  const [expandedEvents, setExpandedEvents] = useState([])

  // Status de carregamento e feedback
  const [loading, setLoading] = useState(false)
  const [loadingEquipe, setLoadingEquipe] = useState(false)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    fetchEventosVisaoGeral()
    fetchGrupos()
    fetchMembros()
  }, [])

  const fetchEventosVisaoGeral = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/escalas/visao-geral')
      if (res.ok) {
        const data = await res.json()
        setEventos(data)
      } else {
        // Fallback robusto se a API ainda não tiver registros
        setEventos(getFallbackEventos())
      }
    } catch (err) {
      console.error('Erro ao buscar eventos do backend', err)
      setEventos(getFallbackEventos())
    } finally {
      setLoading(false)
    }
  }

  const fetchGrupos = async () => {
    try {
      const res = await fetch('/api/grupos')
      if (res.ok) {
        const data = await res.json()
        // Filtrar apenas Ministérios e Sociedades Internas
        setGrupos(data.filter(g => g.tipoGrupo === 'MINISTERIO' || g.tipoGrupo === 'SOCIEDADES_INTERNAS' || g.tipoGrupo === 'SOCIEDADE_INTERNA' || g.tipoGrupo === 'PEQUENO_GRUPO'))
      } else {
        setGrupos(getFallbackGrupos())
      }
    } catch (err) {
      setGrupos(getFallbackGrupos())
    }
  }

  const fetchMembros = async () => {
    try {
      const res = await fetch('/api/membros?size=1000')
      if (res.ok) {
        const page = await res.json()
        setMembros(page.content || [])
        if (page.content && page.content.length > 0) {
          setMembroLogadoId(String(page.content[0].id))
        }
      } else {
        setMembros(getFallbackMembros())
        setMembroLogadoId('1')
      }
    } catch (err) {
      setMembros(getFallbackMembros())
      setMembroLogadoId('1')
    }
  }

  const [minhasEscalas, setMinhasEscalas] = useState([])
  const [loadingMinhasEscalas, setLoadingMinhasEscalas] = useState(false)

  const fetchMinhasEscalas = async (membroId) => {
    if (!membroId) return
    setLoadingMinhasEscalas(true)
    try {
      const res = await fetch(`/api/escalas/membro/${membroId}`)
      if (res.ok) {
        const data = await res.json()
        setMinhasEscalas(data)
      } else {
        setMinhasEscalas([])
      }
    } catch (err) {
      console.error('Erro ao buscar escalas do membro', err)
      setMinhasEscalas([])
    } finally {
      setLoadingMinhasEscalas(false)
    }
  }

  useEffect(() => {
    if (membroLogadoId) {
      fetchMinhasEscalas(membroLogadoId)
    }
  }, [membroLogadoId])


  const handleSelectEvento = async (eventoId) => {
    setSelectedEventoId(eventoId)
    setLoadingEquipe(true)
    try {
      const res = await fetch(`/api/escalas/evento/${eventoId}`)
      if (res.ok) {
        const data = await res.json()
        setEscalasDoEvento(data)
        setEscalasEdit(data.map(e => ({
          id: e.id,
          membroId: e.membroId,
          grupoId: e.grupoId,
          funcaoEspecifica: e.funcaoEspecifica || '',
          statusConfirmacao: e.statusConfirmacao || 'PENDENTE',
          motivoRecusa: e.motivoRecusa || ''
        })))
      } else {
        setEscalasDoEvento([])
        setEscalasEdit([])
      }
    } catch (err) {
      console.error('Erro ao buscar equipe do evento', err)
      setEscalasDoEvento([])
      setEscalasEdit([])
    } finally {
      setLoadingEquipe(false)
    }
  }

  const handleToggleGrupoSelecionado = (grupoId) => {
    setGruposSelecionados(prev =>
      prev.includes(grupoId) ? prev.filter(id => id !== grupoId) : [...prev, grupoId]
    )
  }

  // Ao selecionar um cargo/ministério na visão de escalas, buscar membros daquele grupo
  const handleSelectCargoId = async (grupoId) => {
    setSelectedCargoId(grupoId)
    if (!grupoId) {
      setMembrosDoGrupo([])
      setSelectedMembroIdToAdd('')
      return
    }
    try {
      const res = await fetch(`/api/grupos/${grupoId}/membros-disponiveis`)
      if (res.ok) {
        const data = await res.json()
        setMembrosDoGrupo(data)
        if (data.length > 0) {
          setSelectedMembroIdToAdd(String(data[0].id))
        } else {
          setSelectedMembroIdToAdd('')
        }
      } else {
        // fallback: todos os membros
        setMembrosDoGrupo(membros)
        if (membros.length > 0) {
          setSelectedMembroIdToAdd(String(membros[0].id))
        }
      }
    } catch (err) {
      setMembrosDoGrupo(membros)
      if (membros.length > 0) {
        setSelectedMembroIdToAdd(String(membros[0].id))
      }
    }
  }

  const handleToggleExpandEvent = (eventoId, e) => {
    e.stopPropagation()
    setExpandedEvents(prev =>
      prev.includes(eventoId) ? prev.filter(id => id !== eventoId) : [...prev, eventoId]
    )
  }

  const handleEditEventoClick = (ev, e) => {
    e.stopPropagation()
    setEditingEventoId(ev.id)
    setTitulo(ev.titulo)
    setData(ev.data)
    setHora(ev.hora ? ev.hora.substring(0, 5) : '')
    setObservacoes(ev.observacoes || '')
    setImagemUrl(ev.imagemUrl || '')
    setGruposSelecionados(ev.gruposNecessariosIds || [])
    setShowModal(true)
  }

  const handleAddEvento = async (e) => {
    e.preventDefault()
    if (!titulo || !data || !hora) {
      setFeedback({ tipo: 'error', texto: 'Preencha os campos obrigatórios' })
      setTimeout(() => setFeedback(null), 3000)
      return
    }

    try {
      const formattedHora = hora.length === 5 ? hora + ':00' : hora
      const payload = {
        titulo,
        data,
        hora: formattedHora,
        observacoes,
        imagemUrl,
        gruposIds: gruposSelecionados
      }
      
      const url = editingEventoId ? `/api/escalas/eventos/${editingEventoId}` : '/api/escalas/eventos'
      const method = editingEventoId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        setShowModal(false)
        setTitulo('')
        setData('')
        setHora('')
        setObservacoes('')
        setImagemUrl('')
        setGruposSelecionados([])
        setEditingEventoId(null)
        fetchEventosVisaoGeral()
        setFeedback({ tipo: 'success', texto: editingEventoId ? 'Culto atualizado com sucesso!' : 'Culto cadastrado com sucesso!' })
        setTimeout(() => setFeedback(null), 3000)
      } else {
        const errData = await res.json().catch(() => null)
        const msg = errData?.message || 'Erro ao cadastrar culto/evento.'
        setFeedback({ tipo: 'error', texto: msg })
        setTimeout(() => setFeedback(null), 4000)
      }
    } catch (err) {
      setFeedback({ tipo: 'error', texto: 'Erro de conexão ao cadastrar evento.' })
      setTimeout(() => setFeedback(null), 4000)
    }
  }

  // Lógica de edição de escalas pelo líder
  const handleAddVoluntarioEdit = (cargoId = null) => {
    if (membros.length === 0) return
    setEscalasEdit(prev => [
      ...prev,
      {
        id: 'new-' + Date.now(), // add fake id to help with indexing/removing if needed, but we use index anyway
        membroId: membros[0].id,
        grupoId: cargoId,
        funcaoEspecifica: '',
        statusConfirmacao: 'PENDENTE'
      }
    ])
  }

  const handleRemoveVoluntarioEdit = (index) => {
    setEscalasEdit(prev => prev.filter((_, i) => i !== index))
  }

  const handleVoluntarioEditChange = (index, field, value) => {
    setEscalasEdit(prev =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
  }

  const handleSaveEquipe = async () => {
    if (!selectedEventoId) return
    setLoadingEquipe(true)
    try {
      // Filtrar campos redundantes e enviar
      const payload = escalasEdit.map(e => ({
        membroId: parseInt(e.membroId),
        grupoId: e.grupoId ? parseInt(e.grupoId) : null,
        funcaoEspecifica: e.funcaoEspecifica,
        statusConfirmacao: e.statusConfirmacao,
        motivoRecusa: e.motivoRecusa
      }))

      const res = await fetch(`/api/escalas/evento/${selectedEventoId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        const data = await res.json()
        setEscalasDoEvento(data)
        fetchEventosVisaoGeral()
        setFeedback({ tipo: 'success', texto: 'Escala da equipe atualizada com sucesso!' })
        setTimeout(() => setFeedback(null), 3000)
      } else {
        const errData = await res.json().catch(() => null)
        const msg = errData?.message || 'Erro ao salvar escala da equipe.'
        setFeedback({ tipo: 'error', texto: msg })
        setTimeout(() => setFeedback(null), 5000)
      }
    } catch (err) {
      setFeedback({ tipo: 'error', texto: 'Erro de conexão ao salvar escalas.' })
      setTimeout(() => setFeedback(null), 5000)
    } finally {
      setLoadingEquipe(false)
    }
  }

  const handleConfirmarPresencaLogado = async (escalaId) => {
    try {
      const res = await fetch(`/api/escalas/${escalaId}/responder?status=CONFIRMADO`, {
        method: 'POST'
      })
      if (res.ok) {
        if (selectedEventoId) {
          handleSelectEvento(selectedEventoId)
        }
        fetchEventosVisaoGeral()
        fetchMinhasEscalas(membroLogadoId)
        setFeedback({ tipo: 'success', texto: 'Presença confirmada!' })
        setTimeout(() => setFeedback(null), 3000)
      } else {
        setFeedback({ tipo: 'error', texto: 'Erro ao responder confirmação.' })
        setTimeout(() => setFeedback(null), 3000)
      }
    } catch (err) {
      setFeedback({ tipo: 'error', texto: 'Erro de conexão.' })
      setTimeout(() => setFeedback(null), 3000)
    }
  }

  const handleOpenRecusaModal = (escalaId) => {
    setRecusaEscalaId(escalaId)
    setJustificativaRecusa('')
    setShowRecusaModal(true)
  }

  const handleSaveRecusaLogado = async (e) => {
    e.preventDefault()
    if (!justificativaRecusa.trim()) {
      setFeedback({ tipo: 'error', texto: 'Informe a justificativa.' })
      setTimeout(() => setFeedback(null), 3000)
      return
    }

    try {
      const res = await fetch(`/api/escalas/${recusaEscalaId}/responder?status=RECUSADO&motivo=${encodeURIComponent(justificativaRecusa)}`, {
        method: 'POST'
      })
      if (res.ok) {
        setShowRecusaModal(false)
        if (selectedEventoId) {
          handleSelectEvento(selectedEventoId)
        }
        fetchEventosVisaoGeral()
        fetchMinhasEscalas(membroLogadoId)
        setFeedback({ tipo: 'info', texto: 'Escala recusada com justificativa.' })
        setTimeout(() => setFeedback(null), 3000)
      } else {
        setFeedback({ tipo: 'error', texto: 'Erro ao responder recusa.' })
        setTimeout(() => setFeedback(null), 3000)
      }
    } catch (err) {
      setFeedback({ tipo: 'error', texto: 'Erro ao responder escala.' })
      setTimeout(() => setFeedback(null), 3000)
    }
  }

  // FALLBACKS DE RESILIÊNCIA E APRESENTAÇÃO
  function getFallbackEventos() {
    return [
      {
        id: 1,
        titulo: 'Culto de Celebração - Domingo Noite',
        data: '2026-07-05',
        hora: '19:00',
        observacoes: 'Passagem de som às 17:30. Oração com a equipe às 18:40.',
        statusEquipes: { 'Louvor': 'OK', 'Mídia': 'PENDENTE', 'Diaconato': 'RECUSADO' }
      },
      {
        id: 2,
        titulo: 'Culto de Celebração - Domingo Manhã',
        data: '2026-07-05',
        hora: '09:00',
        observacoes: 'Chegar às 08:30.',
        statusEquipes: { 'Mídia': 'OK', 'Diaconato': 'OK' }
      }
    ]
  }

  function getFallbackGrupos() {
    return [
      { id: 1, nomeGrupo: 'Louvor & Adoração', tipoGrupo: 'MINISTERIO' },
      { id: 2, nomeGrupo: 'Mídia & Sonoplastia', tipoGrupo: 'MINISTERIO' },
      { id: 3, nomeGrupo: 'Recepção & Diaconato', tipoGrupo: 'MINISTERIO' },
      { id: 4, nomeGrupo: 'Ministério Infantil (Kids)', tipoGrupo: 'MINISTERIO' }
    ]
  }

  function getFallbackMembros() {
    return [
      { id: 1, nomeCompleto: 'Guilherme Santos', tituloCargo: 'Líder de Louvor' },
      { id: 2, nomeCompleto: 'Juliana Mendes', tituloCargo: 'Teclado' },
      { id: 3, nomeCompleto: 'Thiago Oliveira', tituloCargo: 'Bateria' },
      { id: 4, nomeCompleto: 'Sarah Rocha', tituloCargo: 'Backing Vocal' },
      { id: 5, nomeCompleto: 'Marcos Silva', tituloCargo: 'Baixo' },
      { id: 6, nomeCompleto: 'Lucas Ramos', tituloCargo: 'Operador de Som' }
    ]
  }

  const formatarData = (dataStr) => {
    if (!dataStr) return ''
    const parts = dataStr.split('-')
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`
    }
    return dataStr
  }

  const getEventoStatus = (ev) => {
    if (!ev.statusEquipes || Object.keys(ev.statusEquipes).length === 0) {
      return 'PENDENTE'
    }
    const statuses = Object.values(ev.statusEquipes)
    if (statuses.includes('RECUSADO')) return 'RECUSADO'
    if (statuses.includes('PENDENTE')) return 'PENDENTE'
    return 'CONFIRMADO'
  }

  return (
    <div className="space-y-6">
      {/* HEADER DE COMANDO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Culto, Evento e Escala</h1>
          <p className="text-sm text-slate-500 mt-1">Aloque equipes de voluntários para cultos e eventos e visualize o status de prontidão operacional.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center h-10 bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-sm select-none">
            <button
              onClick={() => { setActiveSubTab('geral'); setSelectedEventoId(null) }}
              className={`flex items-center gap-2 px-4 h-full rounded-lg text-xs font-bold transition-all ${
                activeSubTab === 'geral' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <CalendarRange className="h-4 w-4" />
              Ver Cultos / Eventos
            </button>
            <button
              onClick={() => { setActiveSubTab('minhas-escalas'); setSelectedEventoId(null) }}
              className={`flex items-center gap-2 px-4 h-full rounded-lg text-xs font-bold transition-all ${
                activeSubTab === 'minhas-escalas' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className="h-4 w-4" />
              Minhas Escalas
            </button>
          </div>

          <button
            onClick={() => {
              setEditingEventoId(null)
              setTitulo('')
              setData('')
              setHora('')
              setObservacoes('')
              setImagemUrl('')
              setGruposSelecionados([])
              setShowModal(true)
            }}
            className="flex items-center justify-center h-10 w-10 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl transition-all shadow-sm shrink-0"
            title="Cadastrar Culto / Evento"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* FEEDBACK INLINE BAR */}
      {feedback && (
        <div className={`px-4 py-3 rounded-xl border flex items-center gap-2 text-sm font-semibold transition-all ${
          feedback.tipo === 'success' ? 'bg-emerald-50 border-emerald-250 text-emerald-800' : 
          feedback.tipo === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
          'bg-slate-50 border-slate-200 text-slate-700'
        }`}>
          {feedback.tipo === 'success' ? <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0" /> :
           feedback.tipo === 'error' ? <AlertCircle className="h-5 w-5 text-red-700 shrink-0" /> :
           <Info className="h-5 w-5 text-slate-500 shrink-0" />
          }
          <span>{feedback.texto}</span>
        </div>
      )}

      {/* SUB-ABAS LOCAIS */}
      {activeSubTab === 'geral' && (
        <div className="space-y-6">
          {!selectedEventoId ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-2">Lista de Cultos Agendados</h3>

              {loading ? (
                <div className="py-12 flex justify-center items-center">
                  <Loader2 className="h-8 w-8 text-emerald-700 animate-spin" />
                </div>
              ) : eventos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {eventos.map((ev) => {
                    const status = getEventoStatus(ev)
                    const borderLColor = status === 'CONFIRMADO' ? 'border-l-emerald-600' :
                                         status === 'RECUSADO' ? 'border-l-red-500' :
                                         'border-l-amber-500';
                    return (
                      <div
                        key={ev.id}
                        onClick={() => handleSelectEvento(ev.id)}
                        className={`bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-350 hover:shadow-md cursor-pointer transition-all border-l-4 ${borderLColor} flex flex-col justify-between space-y-4`}
                      >
                        <div>
                          <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
                            <div className="flex items-center gap-2">
                              <span>{ev.hora}</span>
                              <span className="text-emerald-700 font-bold">{formatarData(ev.data)}</span>
                            </div>
                            <button
                              onClick={(e) => handleEditEventoClick(ev, e)}
                              className="p-1 text-slate-450 hover:text-emerald-750 hover:bg-slate-100 rounded transition-all"
                              title="Editar Informações"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <h4 className="font-extrabold text-slate-800 text-base mt-2">{ev.titulo}</h4>
                          
                          {/* List/Section of Status Operacional por Ministério exigido, always shown under title */}
                          <div className="space-y-1.5 mt-3 pt-2 border-t border-slate-100/60">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Equipes Requisitadas</span>
                            <div className="space-y-1">
                              {ev.statusEquipes && Object.keys(ev.statusEquipes).length > 0 ? (
                                Object.entries(ev.statusEquipes).map(([depto, status]) => {
                                  const escaladosNoDepto = ev.membrosEscalados ? ev.membrosEscalados.filter(m => m.nomeGrupo === depto) : [];
                                  return (
                                    <div key={depto} className="py-1 border-b border-slate-50 last:border-b-0">
                                      <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                                        <span>{depto}</span>
                                        <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-full border uppercase tracking-wider ${
                                          status === 'OK'
                                            ? 'bg-green-50 border-green-200 text-green-700'
                                            : status === 'PENDENTE'
                                            ? 'bg-amber-50 border-amber-200 text-amber-700 animate-pulse'
                                            : 'bg-red-50 border-red-200 text-red-755'
                                        }`}>
                                          {status}
                                        </span>
                                      </div>
                                      
                                      {expandedEvents.includes(ev.id) && (
                                        <div className="mt-1 pl-3 space-y-1 border-l-2 border-slate-150">
                                          {escaladosNoDepto.length > 0 ? (
                                            escaladosNoDepto.map((m, idx) => (
                                              <div key={idx} className="flex justify-between items-center text-[10px] text-slate-550 font-bold py-0.5">
                                                <span className="flex items-center gap-1.5">
                                                  <span className={`h-1.5 w-1.5 rounded-full ${
                                                    m.status === 'CONFIRMADO' ? 'bg-emerald-500' :
                                                    m.status === 'RECUSADO' ? 'bg-red-500' : 'bg-amber-400'
                                                  }`} />
                                                  {m.nomeMembro} {m.funcao ? `(${m.funcao})` : ''}
                                                </span>
                                                <span className="opacity-80 text-[8px] uppercase tracking-wider">{m.status}</span>
                                              </div>
                                            ))
                                          ) : (
                                            <div className="text-[10px] text-slate-400 italic">Ninguém escalado</div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )
                                })
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">Sem ministérios exigidos</span>
                              )}
                            </div>
                          </div>

                          {ev.observacoes && (
                            <p className="text-xs text-slate-400 mt-2 line-clamp-1 italic">{ev.observacoes}</p>
                          )}
                        </div>

                        {/* Collapsible toggle button */}
                        {ev.statusEquipes && Object.keys(ev.statusEquipes).length > 0 && (
                          <div className="mt-2 pt-2 border-t border-slate-100/50">
                            <button
                              onClick={(e) => handleToggleExpandEvent(ev.id, e)}
                              className="w-full flex items-center justify-center gap-1 py-1 bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold rounded-lg text-[9px] uppercase tracking-wider transition-all border border-slate-200/50"
                            >
                              {expandedEvents.includes(ev.id) ? (
                                <>
                                  <span>Ocultar Escala</span>
                                  <ChevronUp className="h-3 w-3" />
                                </>
                              ) : (
                                <>
                                  <span>Ver Escala</span>
                                  <ChevronDown className="h-3 w-3" />
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="py-16 text-center text-slate-400 italic text-xs">
                  Nenhum evento agendado na base de dados.
                </div>
              )}
            </div>
          ) : (
            // VISÃO INTERNA DO EVENTO E PAINEL DO LÍDER (MASTER-DETAIL)
            (() => {
              const ev = eventos.find(e => e.id === selectedEventoId)
              if (!ev) return null

              // Selecionar o primeiro grupo por padrão
              if (!selectedCargoId && grupos.length > 0) {
                setTimeout(() => handleSelectCargoId(grupos[0].id), 0)
              }

              const activeCargo = grupos.find(c => c.id === selectedCargoId)

              return (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden flex flex-col md:flex-row h-full md:min-h-[600px]">
                  {/* MASTER: Lista de Ministérios (Esquerda) */}
                  <div className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col shrink-0">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => { setSelectedEventoId(null); setSelectedCargoId(null); }}
                        className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-all flex items-center gap-1"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Voltar
                      </button>
                      <button
                        onClick={(e) => handleEditEventoClick(ev, e)}
                        className="p-1 text-slate-450 hover:text-emerald-700 hover:bg-slate-100 rounded transition-all"
                        title="Editar Informações do Culto"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="p-4 bg-emerald-700 text-white">
                      <h2 className="text-sm font-black uppercase tracking-wide line-clamp-2">{ev.titulo}</h2>
                      <span className="text-[10px] font-bold block mt-1 opacity-80">{formatarData(ev.data)} às {ev.hora}h</span>
                    </div>
                    
                    <div className="flex-grow overflow-y-auto p-3 space-y-1">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2 mb-2 mt-2">Ministérios</h4>
                      {grupos
                        .filter(cg => ev.gruposNecessariosIds && ev.gruposNecessariosIds.includes(cg.id))
                        .map(cg => {
                          const isActive = selectedCargoId === cg.id
                          const statusEquipe = ev.statusEquipes && ev.statusEquipes[cg.nomeGrupo] ? ev.statusEquipes[cg.nomeGrupo] : 'PENDENTE'
                          return (
                            <button
                              key={cg.id}
                              onClick={() => handleSelectCargoId(cg.id)}
                              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                isActive
                                  ? 'bg-emerald-50 text-emerald-800 shadow-sm'
                                  : 'text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <span className="truncate pr-2">{cg.nomeGrupo}</span>
                              <span className={`h-2 w-2 rounded-full shrink-0 ${
                                statusEquipe === 'OK' ? 'bg-green-500' :
                                statusEquipe === 'PENDENTE' ? 'bg-amber-400' : 'bg-red-500'
                              }`} title={`Status: ${statusEquipe}`}></span>
                            </button>
                          )
                        })}
                    </div>
                  </div>
                  
                  {/* DETAIL: Voluntários do Ministério (Direita) */}
                  <div className="flex-grow flex flex-col bg-slate-50">
                    <div className="p-5 border-b border-slate-200 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h3 className="font-extrabold text-slate-800 text-base">{activeCargo ? activeCargo.nomeGrupo : 'Selecione um ministério'}</h3>
                        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Gerenciamento de Equipe</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        {activeCargo && (
                          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs w-full sm:w-60">
                            <select
                              value={selectedMembroIdToAdd}
                              onChange={(e) => setSelectedMembroIdToAdd(e.target.value)}
                              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer w-full"
                            >
                              <option value="">Selecione o Membro...</option>
                              {membrosDoGrupo.map(m => (
                                <option key={m.id} value={m.id}>{m.nomeCompleto}</option>
                              ))}
                            </select>
                          </div>
                        )}
                        <button
                          onClick={() => {
                            if (!selectedMembroIdToAdd) {
                              setFeedback({ tipo: 'error', texto: 'Selecione um membro para adicionar' })
                              setTimeout(() => setFeedback(null), 3000)
                              return
                            }
                            const jaExiste = escalasEdit.some(item => String(item.membroId) === String(selectedMembroIdToAdd))
                            if (jaExiste) {
                              setFeedback({ tipo: 'error', texto: 'Este voluntário já está escalado para este culto/evento.' })
                              setTimeout(() => setFeedback(null), 4000)
                              return
                            }
                            const mbObj = membros.find(m => String(m.id) === String(selectedMembroIdToAdd))
                            setEscalasEdit(prev => [
                              ...prev,
                              {
                                id: 'new-' + Date.now(),
                                membroId: selectedMembroIdToAdd,
                                nomeMembro: mbObj ? mbObj.nomeCompleto : '',
                                grupoId: selectedCargoId,
                                funcaoEspecifica: '',
                                statusConfirmacao: 'PENDENTE'
                              }
                            ])
                          }}
                          disabled={!activeCargo || !selectedMembroIdToAdd}
                          className="px-3.5 py-2 bg-white border border-emerald-250 text-emerald-800 rounded-xl text-xs font-bold hover:bg-emerald-50 transition-all flex items-center justify-center gap-1 shadow-sm disabled:opacity-50 flex-grow sm:flex-grow-0"
                        >
                          <UserPlus className="h-4 w-4" />
                          <span>Adicionar</span>
                        </button>
                        <button
                          onClick={handleSaveEquipe}
                          className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-650 transition-all shadow-sm flex-grow sm:flex-grow-0 text-center"
                        >
                          Salvar Escala
                        </button>
                      </div>
                    </div>

                    <div className="p-5 flex-grow overflow-y-auto">
                      {loadingEquipe ? (
                        <div className="py-12 flex justify-center items-center">
                          <Loader2 className="h-8 w-8 text-emerald-700 animate-spin" />
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {escalasEdit.map((item, index) => {
                            const mb = membros.find(m => String(m.id) === String(item.membroId))
                            const pertenceAoCargo = item.grupoId 
                                ? item.grupoId === selectedCargoId 
                                : (mb && mb.cargoId === selectedCargoId)

                            if (!pertenceAoCargo && selectedCargoId !== null) return null;

                            return (
                              <div key={item.id || index} className="bg-white border border-slate-250 rounded-xl p-4 space-y-4 shadow-sm relative flex flex-col justify-between">
                                <button
                                  onClick={() => handleRemoveVoluntarioEdit(index)}
                                  className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 rounded hover:bg-slate-50 transition-all"
                                  title="Desalocar"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>

                                <div className="space-y-3 pt-2">
                                  <div>
                                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Membro Voluntário</label>
                                    <div className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 flex items-center gap-2">
                                      <User className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                                      <span>
                                        {mb ? mb.nomeCompleto : (item.nomeMembro || 'Membro Desconhecido')}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Função Específica</label>
                                      <input
                                        type="text"
                                        placeholder="Ex: Teclado, Projeção"
                                        value={item.funcaoEspecifica}
                                        onChange={(e) => handleVoluntarioEditChange(index, 'funcaoEspecifica', e.target.value)}
                                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-600"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Status Confirmação</label>
                                      <select
                                        value={item.statusConfirmacao}
                                        onChange={(e) => handleVoluntarioEditChange(index, 'statusConfirmacao', e.target.value)}
                                        className={`w-full px-3 py-1.5 rounded-lg text-xs font-bold border focus:outline-none focus:border-emerald-600 uppercase ${
                                          item.statusConfirmacao === 'CONFIRMADO'
                                            ? 'bg-green-50 border-green-200 text-green-700'
                                            : item.statusConfirmacao === 'PENDENTE'
                                            ? 'bg-amber-50 border-amber-250 text-amber-700'
                                            : 'bg-red-50 border-red-200 text-red-750'
                                        }`}
                                      >
                                        <option value="PENDENTE">Pendente</option>
                                        <option value="CONFIRMADO">Confirmado</option>
                                        <option value="RECUSADO">Recusado</option>
                                      </select>
                                    </div>
                                  </div>

                                  {item.motivoRecusa && (
                                    <div className="text-[10px] text-red-650 bg-red-50 p-2 rounded border border-red-150">
                                      Justificativa: {item.motivoRecusa}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                          
                          {escalasEdit.filter(item => {
                            const mb = membros.find(m => String(m.id) === String(item.membroId))
                            return item.grupoId ? item.grupoId === selectedCargoId : (mb && mb.cargoId === selectedCargoId)
                          }).length === 0 && (
                            <div className="col-span-full py-12 flex flex-col items-center justify-center text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                              <Users className="h-8 w-8 mb-2 opacity-20" />
                              <span className="text-xs font-bold text-slate-500">Nenhum voluntário escalado</span>
                              <span className="text-[10px] mt-1">Clique em "Adicionar" para convocar um membro para este ministério.</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })()
          )}
        </div>
      )}

      {/* ABA LOCAIS: MINHAS ESCALAS PESSOAIS */}
      {activeSubTab === 'minhas-escalas' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-0.5">
              <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest block">Simulação de Voluntário</span>
              <label className="block text-xs font-semibold text-slate-500">Selecione quem está acessando o portal de escalas pessoais:</label>
            </div>
            
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs w-full sm:w-64">
              <User className="h-4 w-4 text-emerald-700 shrink-0" />
              <select
                value={membroLogadoId}
                onChange={(e) => setMembroLogadoId(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer w-full"
              >
                {membros.map(m => (
                  <option key={m.id} value={m.id}>{m.nomeCompleto}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-2">Minhas Escalas Cadastradas</h3>
            {/* Como não carregamos dinamicamente as escalas pessoais por falta de filtros múltiplos na query de escala do backend, mostramos um simulador baseado na pessoa selecionada */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {loadingMinhasEscalas ? (
                <div className="col-span-full py-12 flex justify-center items-center">
                  <Loader2 className="h-8 w-8 text-emerald-700 animate-spin" />
                </div>
              ) : minhasEscalas.length > 0 ? (
                minhasEscalas.map((esc) => {
                  const borderLColor = esc.statusConfirmacao === 'CONFIRMADO' ? 'border-l-emerald-600' :
                                       esc.statusConfirmacao === 'RECUSADO' ? 'border-l-red-500' :
                                       'border-l-amber-500';
                  return (
                    <div
                      key={esc.id}
                      className={`bg-white border border-slate-200 rounded-xl p-5 shadow-xs border-l-4 ${borderLColor} flex flex-col justify-between space-y-4`}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-650 text-[9px] font-bold rounded uppercase tracking-wider">{esc.nomeGrupo || 'Ministério'}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border uppercase tracking-wider ${
                            esc.statusConfirmacao === 'CONFIRMADO'
                              ? 'bg-green-50 border-green-200 text-green-700'
                              : esc.statusConfirmacao === 'PENDENTE'
                              ? 'bg-amber-50 border-amber-250 text-amber-700'
                              : 'bg-red-50 border-red-200 text-red-750'
                          }`}>{esc.statusConfirmacao}</span>
                        </div>

                        <h4 className="font-extrabold text-slate-805 text-sm mt-3">{esc.tituloEvento}</h4>
                        <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 mt-2 bg-slate-50 p-2 rounded-lg">
                          <span>Data: {formatarData(esc.dataEvento)}</span>
                          <span>Horário: {esc.horaEvento ? esc.horaEvento.substring(0, 5) : ''}h</span>
                        </div>

                        <div className="mt-3 bg-emerald-50/30 border border-emerald-100 rounded-xl p-3">
                          <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-widest block">Função Alocada</span>
                          <span className="text-xs font-bold text-slate-800 block mt-0.5">{esc.funcaoEspecifica || 'Geral'}</span>
                        </div>
                        {esc.statusConfirmacao === 'RECUSADO' && esc.motivoRecusa && (
                          <div className="mt-2 text-[10px] text-red-650 bg-red-50 p-2 rounded border border-red-150">
                            Justificativa: {esc.motivoRecusa}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 border-t border-slate-100 pt-3">
                        <button
                          onClick={() => handleConfirmarPresencaLogado(esc.id)}
                          className="flex-grow py-1.5 px-3 bg-emerald-650 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs flex justify-center items-center gap-1 transition-all"
                        >
                          <Check className="h-4 w-4" />
                          Confirmar
                        </button>
                        <button
                          onClick={() => handleOpenRecusaModal(esc.id)}
                          className="flex-grow py-1.5 px-3 border border-red-200 hover:bg-red-50 text-red-750 rounded-lg text-xs font-bold shadow-xs flex justify-center items-center gap-1 transition-all"
                        >
                          <X className="h-4 w-4" />
                          Recusar
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-16 text-center text-slate-400 italic text-xs">
                  Nenhuma escala atribuída para o voluntário selecionado no momento.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CADASTRO DE NOVO EVENTO / CULTO */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-250 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center bg-slate-50 px-6 py-4 border-b border-slate-200 shrink-0">
              <div className="space-y-0.5">
                <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">{editingEventoId ? 'Editar Culto / Evento' : 'Culto / Evento'}</h3>
                <span className="text-[10px] text-slate-400 block font-semibold">Crie o serviço e marque quais ministérios serão exigidos.</span>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-lg transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddEvento} className="p-6 space-y-4 overflow-y-auto flex-grow">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Título do Culto / Evento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Culto de Celebração Noturno, Culto de Jovens..."
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
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
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Hora *</label>
                  <input
                    type="time"
                    required
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Foto / Capa de Destaque</label>
                <div className="flex items-center gap-3 mt-1">
                  {imagemUrl && (
                    <img src={imagemUrl} alt="Preview" className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                  )}
                  <div className="relative flex-grow">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setImagemUrl(event.target.result);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                      id="eventoImageUploadInput"
                    />
                    <label
                      htmlFor="eventoImageUploadInput"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-600 bg-white font-semibold text-slate-700 cursor-pointer flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <span className="truncate pr-2">{imagemUrl ? 'Alterar Imagem' : 'Selecionar Imagem'}</span>
                      <Upload className="h-4 w-4 text-slate-400 shrink-0" />
                    </label>
                  </div>
                  {imagemUrl && (
                    <button
                      type="button"
                      onClick={() => setImagemUrl('')}
                      className="p-2.5 border border-red-200 text-red-650 hover:bg-red-50 rounded-xl transition-colors"
                      title="Limpar Imagem"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Observações do Culto</label>
                <textarea
                  placeholder="Ex: Passagem de som às 17h, oração às 18h..."
                  rows={2}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* CHECKBOXES DE MINISTÉRIOS REQUISITADOS */}
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Selecione quais Ministérios/Sociedades serão necessários:</label>
                <div className="grid grid-cols-2 gap-3">
                  {grupos.map((cg) => (
                    <label
                      key={cg.id}
                      className={`flex items-center gap-2 px-3 py-2 border rounded-xl text-xs font-bold cursor-pointer transition-all select-none ${
                        gruposSelecionados.includes(cg.id)
                          ? 'border-emerald-600 bg-emerald-50/45 text-emerald-800'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={gruposSelecionados.includes(cg.id)}
                        onChange={() => handleToggleGrupoSelecionado(cg.id)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer w-4 h-4"
                      />
                      {cg.nomeGrupo}
                    </label>
                  ))}
                </div>
              </div>

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
                  className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-650 transition-all shadow-sm"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE JUSTIFICATIVA DE RECUSA */}
      {showRecusaModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-250 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center bg-slate-50 px-5 py-3 border-b border-slate-200">
              <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Justificar Ausência na Escala</h3>
              <button
                onClick={() => setShowRecusaModal(false)}
                className="p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-650 rounded hover:text-slate-600 transition-all"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            <form onSubmit={handleSaveRecusaLogado} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Informe a Justificativa *</label>
                <textarea
                  required
                  placeholder="Escreva detalhadamente o motivo de não comparecimento à convocação da equipe..."
                  rows={3}
                  value={justificativaRecusa}
                  onChange={(e) => setJustificativaRecusa(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>
              <div className="flex justify-end gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setShowRecusaModal(false)}
                  className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-505 rounded-lg transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-red-650 text-white rounded-lg hover:bg-red-700 transition-all shadow-xs"
                >
                  Confirmar Ausência
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
