import { useState, useEffect } from 'react'
import {
  BookOpen, Play, CheckCircle2, ChevronRight, BookOpenCheck,
  Video, FileText, ArrowLeft, Loader2, Sparkles, CheckSquare, Award,
  Plus, X, HelpCircle, AlertCircle, Check, Search, Pencil, FileDown,
  Pause, RefreshCw, Layers, User, Upload, Trash2, Info
} from 'lucide-react'
import RichTextEditor from './RichTextEditor'

export default function TrilhasManager() {
  const membroIdSimulado = 1

  // Feedback banner state
  const [feedback, setFeedback] = useState(null)
  const showFeedback = (tipo, texto) => {
    setFeedback({ tipo, texto })
    setTimeout(() => setFeedback(null), 5000)
  }

  // Estados para o Aluno/Membro Comum
  const [trilhas, setTrilhas] = useState([])
  const [conteudosSoltos, setConteudosSoltos] = useState([])
  const [membros, setMembros] = useState([])
  
  // Aba ativa do Aluno: 'todos' | 'meus-estudos'
  const [abaEstudos, setAbaEstudos] = useState('todos')
  
  // Filtros
  const [filtroTipo, setFiltroTipo] = useState('Todos') // 'Todos' | 'PREGACAO' | 'TRILHA' | 'DEVOCIONAL' | 'AVULSO'
  const [buscaNome, setBuscaNome] = useState('')
  const [buscaNomeMeusEstudos, setBuscaNomeMeusEstudos] = useState('')
  const [filtroStatusMeusEstudos, setFiltroStatusMeusEstudos] = useState('ALL') // 'ALL' | 'EM_ANDAMENTO' | 'PARALISADO' | 'CONCLUIDO'

  // Meus Estudos iniciados
  const [meusEstudos, setMeusEstudos] = useState([])
  const [loadingMeusEstudos, setLoadingMeusEstudos] = useState(false)

  const [selectedTrilha, setSelectedTrilha] = useState(null)
  const [selectedIsSolto, setSelectedIsSolto] = useState(false) // Se o conteúdo ativo é solto/avulso
  const [conteudos, setConteudos] = useState([]) // Aulas da trilha ativa
  const [selectedConteudo, setSelectedConteudo] = useState(null)
  
  // Status de carregamento
  const [loading, setLoading] = useState(false)
  const [loadingConteudos, setLoadingConteudos] = useState(false)
  const [loadingSoltos, setLoadingSoltos] = useState(false)

  // Controle de Modo Admin
  const [adminMode, setAdminMode] = useState(false)
  const [allConteudosAdmin, setAllConteudosAdmin] = useState([])
  const [loadingAdminConteudos, setLoadingAdminConteudos] = useState(false)
  const [buscaAdminNome, setBuscaAdminNome] = useState('')
  const [filterAdminTrilhaId, setFilterAdminTrilhaId] = useState('TODOS')
  const [buscaAdminTrilhas, setBuscaAdminTrilhas] = useState('')

  // Modal e Formulário de Criação/Edição de Trilha/Curso/Devocional
  const [showTrilhaModal, setShowTrilhaModal] = useState(false)
  const [editingTrilhaId, setEditingTrilhaId] = useState(null)
  const [trilhaTitulo, setTrilhaTitulo] = useState('')
  const [trilhaDescricao, setTrilhaDescricao] = useState('')
  const [trilhaTipo, setTrilhaTipo] = useState('TRILHA') // 'TRILHA' | 'PREGACAO' | 'DEVOCIONAL'
  const [trilhaImagemUrl, setTrilhaImagemUrl] = useState('')
  const [trilhaAtorId, setTrilhaAtorId] = useState('')

  // Modal e Formulário de Criação/Edição de Conteúdo/Aula
  const [showConteudoModal, setShowConteudoModal] = useState(false)
  const [editingConteudoId, setEditingConteudoId] = useState(null)
  const [conteudoTitulo, setConteudoTitulo] = useState('')
  const [conteudoResumo, setConteudoResumo] = useState('')
  const [conteudoTextoCompleto, setConteudoTextoCompleto] = useState('')
  const [conteudoVideoUrl, setConteudoVideoUrl] = useState('')
  const [conteudoPdfUrl, setConteudoPdfUrl] = useState('')
  const [conteudoOrdem, setConteudoOrdem] = useState('')
  const [conteudoTrilhaId, setConteudoTrilhaId] = useState('solto') // 'solto' | TRILHA_ID
  const [conteudoAtorId, setConteudoAtorId] = useState('')

  useEffect(() => {
    fetchTrilhas()
    fetchConteudosSoltos()
    fetchMeusEstudos()
    fetchMembros()
  }, [])

  useEffect(() => {
    if (adminMode) {
      fetchAllConteudosAdmin()
    }
  }, [adminMode, trilhas])

  const fetchMembros = async () => {
    try {
      const res = await fetch('/api/membros?size=1000')
      if (res.ok) {
        const data = await res.json()
        setMembros(data.content || data || [])
      }
    } catch (err) {
      console.error('Erro ao buscar membros', err)
    }
  }

  const handlePasteImage = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = items[i].getAsFile();
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target.result;
          const textarea = e.target;
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const text = textarea.value;
          const before = text.substring(0, start);
          const after = text.substring(end, text.length);
          const imageMarkdown = `\n![imagem](${base64})\n`;
          setConteudoTextoCompleto(before + imageMarkdown + after);
        };
        reader.readAsDataURL(file);
        break;
      }
    }
  }

  const fetchTrilhas = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/trilhas?membroId=${membroIdSimulado}`)
      if (res.ok) {
        const data = await res.json()
        setTrilhas(data)
      }
    } catch (err) {
      console.error('Erro ao buscar trilhas', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchConteudosSoltos = async () => {
    setLoadingSoltos(true)
    try {
      const res = await fetch(`/api/trilhas/conteudos-soltos?membroId=${membroIdSimulado}`)
      if (res.ok) {
        const data = await res.json()
        setConteudosSoltos(data)
      }
    } catch (err) {
      console.error('Erro ao buscar conteúdos soltos', err)
    } finally {
      setLoadingSoltos(false)
    }
  }

  const fetchMeusEstudos = async () => {
    setLoadingMeusEstudos(true)
    try {
      const res = await fetch(`/api/trilhas/meus-estudos?membroId=${membroIdSimulado}`)
      if (res.ok) {
        const data = await res.json()
        setMeusEstudos(data)
      }
    } catch (err) {
      console.error('Erro ao buscar meus estudos', err)
    } finally {
      setLoadingMeusEstudos(false)
    }
  }

  const fetchAllConteudosAdmin = async () => {
    setLoadingAdminConteudos(true)
    try {
      const all = []
      // 1. Loose contents
      const resSoltos = await fetch(`/api/trilhas/conteudos-soltos?membroId=${membroIdSimulado}`)
      if (resSoltos.ok) {
        const soltos = await resSoltos.json()
        all.push(...soltos.map(c => ({ ...c, nomeTrilha: 'Conteúdo Avulso' })))
      }
      
      // 2. Contents of each trail
      for (const t of trilhas) {
        const res = await fetch(`/api/trilhas/${t.id}/conteudos?membroId=${membroIdSimulado}`)
        if (res.ok) {
          const contentList = await res.json()
          all.push(...contentList.map(c => ({ ...c, nomeTrilha: t.titulo })))
        }
      }
      setAllConteudosAdmin(all)
    } catch (err) {
      console.error('Erro ao listar conteúdos admin', err)
    } finally {
      setLoadingAdminConteudos(false)
    }
  }

  const handleSelectTrilha = async (trilha) => {
    setSelectedTrilha(trilha)
    setSelectedIsSolto(false)
    setLoadingConteudos(true)
    try {
      const res = await fetch(`/api/trilhas/${trilha.id}/conteudos?membroId=${membroIdSimulado}`)
      if (res.ok) {
        const data = await res.json()
        setConteudos(data)
        if (data.length > 0) {
          setSelectedConteudo(data[0])
        } else {
          setSelectedConteudo(null)
        }

        // Se não tiver status de andamento ainda, vamos iniciar
        if (!trilha.status) {
          await handleSaveStatusManualmente(trilha.id, null, 'EM_ANDAMENTO')
        }
      }
    } catch (err) {
      console.error('Erro ao buscar conteúdos da trilha', err)
    } finally {
      setLoadingConteudos(false)
    }
  }

  const handleSelectConteudoSolto = async (conteudo) => {
    setSelectedTrilha({ id: null, titulo: 'Conteúdos Avulsos e Leituras', atorNome: conteudo.atorNome })
    setSelectedIsSolto(true)
    setConteudos([conteudo])
    setSelectedConteudo(conteudo)

    // Se o conteúdo avulso não estiver iniciado, inicia
    const jaIniciado = meusEstudos.some(e => e.tipo === 'AVULSO' && e.id === conteudo.id)
    if (!jaIniciado) {
      await handleSaveStatusManualmente(null, conteudo.id, 'EM_ANDAMENTO')
    }
  }

  const handleSaveStatusManualmente = async (trilhaId, conteudoId, novoStatus) => {
    try {
      let url = `/api/trilhas/status?membroId=${membroIdSimulado}&status=${novoStatus}`
      if (trilhaId) url += `&trilhaId=${trilhaId}`
      if (conteudoId) url += `&conteudoId=${conteudoId}`

      const res = await fetch(url, { method: 'POST' })
      if (res.ok) {
        fetchTrilhas()
        fetchMeusEstudos()
        // Se a trilha selecionada for a mesma, atualizar status nela localmente
        if (selectedTrilha && selectedTrilha.id === trilhaId) {
          setSelectedTrilha(prev => ({ ...prev, status: novoStatus }))
        }
      }
    } catch (err) {
      console.error('Erro ao salvar status manual', err)
    }
  }

  const handleToggleConcluido = async (conteudoId, concluidoAtual) => {
    try {
      const novoEstado = !concluidoAtual
      const res = await fetch(`/api/trilhas/conteudos/${conteudoId}/concluir?membroId=${membroIdSimulado}&concluido=${novoEstado}`, {
        method: 'POST'
      })
      if (res.ok) {
        // Atualizar lista localmente
        setConteudos(prev =>
          prev.map(c => (c.id === conteudoId ? { ...c, concluido: novoEstado } : c))
        )
        setConteudosSoltos(prev =>
          prev.map(c => (c.id === conteudoId ? { ...c, concluido: novoEstado } : c))
        )
        if (selectedConteudo && selectedConteudo.id === conteudoId) {
          setSelectedConteudo(prev => ({ ...prev, concluido: novoEstado }))
        }
        
        fetchTrilhas()
        fetchMeusEstudos()

        if (adminMode) {
          fetchAllConteudosAdmin()
        }
      }
    } catch (err) {
      console.error('Erro ao marcar conclusão', err)
    }
  }

  const handleSaveTrilha = async (e) => {
    e.preventDefault()
    if (!trilhaTitulo || !trilhaDescricao) {
      showFeedback('error', 'Preencha título e descrição')
      return
    }

    try {
      const url = editingTrilhaId ? `/api/trilhas/${editingTrilhaId}` : '/api/trilhas'
      const method = editingTrilhaId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: trilhaTitulo,
          descricao: trilhaDescricao,
          tipo: trilhaTipo,
          imagemUrl: trilhaImagemUrl || null,
          atorId: trilhaAtorId ? parseInt(trilhaAtorId) : null
        })
      })
      if (res.ok) {
        setShowTrilhaModal(false)
        setEditingTrilhaId(null)
        setTrilhaTitulo('')
        setTrilhaDescricao('')
        setTrilhaImagemUrl('')
        setTrilhaAtorId('')
        fetchTrilhas()
        showFeedback('success', editingTrilhaId ? 'Estudo atualizado com sucesso!' : 'Novo estudo criado com sucesso!')
      } else {
        const errMsg = await res.text().catch(() => '')
        showFeedback('error', errMsg || 'Erro ao salvar agrupamento no servidor.')
      }
    } catch (err) {
      showFeedback('error', 'Erro ao salvar trilha.')
    }
  }

  const handleEditTrilha = (trilha) => {
    setEditingTrilhaId(trilha.id)
    setTrilhaTitulo(trilha.titulo)
    setTrilhaDescricao(trilha.descricao)
    setTrilhaTipo(trilha.tipo)
    setTrilhaImagemUrl(trilha.imagemUrl || '')
    setTrilhaAtorId(trilha.atorId ? String(trilha.atorId) : '')
    setShowTrilhaModal(true)
  }

  const handleSaveConteudo = async (e) => {
    e.preventDefault()
    if (!conteudoTitulo || !conteudoResumo) {
      showFeedback('error', 'Preencha título e resumo')
      return
    }

    try {
      const payload = {
        titulo: conteudoTitulo,
        resumo: conteudoResumo,
        textoCompleto: conteudoTextoCompleto || null,
        videoUrl: conteudoVideoUrl || null,
        pdfUrl: conteudoPdfUrl || null,
        ordem: conteudoOrdem ? parseInt(conteudoOrdem) : 0,
        atorId: conteudoAtorId ? parseInt(conteudoAtorId) : null
      }

      let res
      if (editingConteudoId) {
        res = await fetch(`/api/trilhas/conteudos/${editingConteudoId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      } else {
        const isSolto = conteudoTrilhaId === 'solto'
        const url = isSolto ? '/api/trilhas/conteudos-soltos' : `/api/trilhas/${conteudoTrilhaId}/conteudos`
        res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      }

      if (res.ok) {
        setShowConteudoModal(false)
        setEditingConteudoId(null)
        setConteudoTitulo('')
        setConteudoResumo('')
        setConteudoTextoCompleto('')
        setConteudoVideoUrl('')
        setConteudoPdfUrl('')
        setConteudoOrdem('')
        setConteudoAtorId('')
        fetchConteudosSoltos()
        if (adminMode) {
          fetchAllConteudosAdmin()
        }
        showFeedback('success', editingConteudoId ? 'Conteúdo atualizado com sucesso!' : 'Conteúdo criado com sucesso!')
      } else {
        const errMsg = await res.text().catch(() => '')
        showFeedback('error', errMsg || `Erro ao salvar conteúdo (Status ${res.status}).`)
      }
    } catch (err) {
      showFeedback('error', 'Erro de conexão ao salvar conteúdo.')
    }
  }

  const handleEditConteudo = (conteudo) => {
    setEditingConteudoId(conteudo.id)
    setConteudoTitulo(conteudo.titulo)
    setConteudoResumo(conteudo.resumo)
    setConteudoTextoCompleto(conteudo.textoCompleto || '')
    setConteudoVideoUrl(conteudo.videoUrl || '')
    setConteudoPdfUrl(conteudo.pdfUrl || '')
    setConteudoOrdem(conteudo.ordem)
    setConteudoTrilhaId(conteudo.trilhaId || 'solto')
    setConteudoAtorId(conteudo.atorId ? String(conteudo.atorId) : '')
    setShowConteudoModal(true)
  }

  // Filtragem de todos os estudos
  const todosEstudosUnificados = [
    ...trilhas.map(t => ({ ...t, isAvulso: false })),
    ...conteudosSoltos.map(c => ({
      id: c.id,
      titulo: c.titulo,
      descricao: c.resumo,
      tipo: 'AVULSO',
      imagemUrl: null,
      status: c.concluido ? 'CONCLUIDO' : (meusEstudos.some(e => e.tipo === 'AVULSO' && e.id === c.id) ? 'EM_ANDAMENTO' : null),
      percentual: c.concluido ? 100 : 0,
      isAvulso: true,
      atorId: c.atorId,
      atorNome: c.atorNome,
      originalObject: c
    }))
  ]

  const estudosFiltrados = todosEstudosUnificados.filter(item => {
    if (filtroTipo !== 'Todos') {
      if (item.tipo !== filtroTipo) return false
    }
    if (buscaNome.trim() !== '') {
      return item.titulo.toLowerCase().includes(buscaNome.toLowerCase())
    }
    return true
  })

  // Filtragem de "Meus Estudos"
  const meusEstudosFiltrados = meusEstudos.filter(item => {
    if (filtroStatusMeusEstudos !== 'ALL') {
      if (item.status !== filtroStatusMeusEstudos) return false
    }
    if (buscaNomeMeusEstudos.trim() !== '') {
      return item.titulo.toLowerCase().includes(buscaNomeMeusEstudos.toLowerCase())
    }
    return true
  })

  // Filtragem do Admin para Trilhas (Cursos e Pregações)
  const adminTrilhasFiltradas = trilhas.filter(t => {
    return buscaAdminTrilhas.trim() === '' || t.titulo.toLowerCase().includes(buscaAdminTrilhas.toLowerCase())
  })

  // Filtragem do Admin para Aulas
  const adminConteudosFiltrados = allConteudosAdmin.filter(c => {
    const matchNome = buscaAdminNome.trim() === '' || c.titulo.toLowerCase().includes(buscaAdminNome.toLowerCase())
    if (!matchNome) return false

    if (filterAdminTrilhaId === 'SOLTOS') {
      return !c.trilhaId
    }
    if (filterAdminTrilhaId !== 'TODOS') {
      return String(c.trilhaId) === String(filterAdminTrilhaId)
    }
    return true
  })

  // Progresso computado
  const totalAulas = conteudos.length
  const concluidas = conteudos.filter(c => c.concluido).length
  const percentual = totalAulas > 0 ? Math.round((concluidas / totalAulas) * 100) : 0

  // Renderizar conteúdo rico (HTML do Tiptap ou markdown legado)
  const renderizarTextoRico = (texto) => {
    if (!texto) return null;
    
    // Se o conteúdo começa com tag HTML, renderizar como HTML (conteúdo do Tiptap)
    const isHtml = texto.trim().startsWith('<');
    if (isHtml) {
      return <div dangerouslySetInnerHTML={{ __html: texto }} />;
    }
    
    // Fallback: renderizar como markdown legado
    return texto.split('\n').map((linha, idx) => {
      const regexMarkdown = /!\[(.*?)\]\((.*?)\)/g;
      let match = regexMarkdown.exec(linha);
      if (match) {
        const alt = match[1];
        const url = match[2];
        return (
          <div key={idx} className="my-4 flex flex-col items-center">
            <img src={url} alt={alt} className="max-w-full md:max-w-md h-auto rounded-xl shadow-md border border-slate-200" />
            {alt && <span className="text-xs text-slate-400 mt-1">{alt}</span>}
          </div>
        )
      }

      const regexUrlDirect = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg))$/i;
      if (regexUrlDirect.test(linha.trim())) {
        return (
          <div key={idx} className="my-4 flex flex-col items-center">
            <img src={linha.trim()} alt="Imagem Ilustrativa" className="max-w-full md:max-w-md h-auto rounded-xl shadow-md border border-slate-200" />
          </div>
        )
      }

      return <p key={idx} className="mb-3 leading-relaxed text-slate-700 font-medium">{linha}</p>;
    });
  }

  return (
    <div className="space-y-6">
      {/* 🟢 BANNER PRINCIPAL VERDE ESCURO (RESTABELECIDO) */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0b4233] to-[#125844] text-white p-6 md:p-8 rounded-3xl shadow-lg border border-[#0d4f3d]">
        {/* Ícone sutil no fundo */}
        <div className="absolute right-6 bottom-[-20px] opacity-10 pointer-events-none transform rotate-12">
          <BookOpen className="h-44 w-44 text-white" />
        </div>

        <div className="relative z-10 space-y-3 max-w-2xl">
          <span className="inline-block px-3 py-1 bg-emerald-955/60 text-emerald-200 text-[10px] font-bold rounded-full uppercase tracking-wider border border-emerald-700/30">
            Escola Bíblica e Discipulado
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Portal de conhecimento</h1>
          <p className="text-sm md:text-base text-emerald-100/90 leading-relaxed font-light">
            Aprofunde seu conhecimento nas Escrituras através de sermões, estudos teológicos, artigos e videoaulas pastorais.
          </p>
        </div>
      </div>

      {!showTrilhaModal && !showConteudoModal && feedback && (
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

      {/* SELETOR ADMIN / ALUNO E ABAS PRINCIPAIS */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-white p-4 border border-slate-200 rounded-2xl shadow-sm">
        {!adminMode && !selectedTrilha ? (
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-sm select-none">
            <button
              onClick={() => setAbaEstudos('todos')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                abaEstudos === 'todos'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              Todos os Estudos
            </button>
            <button
              onClick={() => { setAbaEstudos('meus-estudos'); fetchMeusEstudos(); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                abaEstudos === 'meus-estudos'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
              }`}
            >
              <CheckSquare className="h-3.5 w-3.5" />
              Meus Estudos
            </button>
          </div>
        ) : (
          <div className="flex items-center">
            {selectedTrilha && (
              <button
                onClick={() => { setSelectedTrilha(null); fetchConteudosSoltos(); fetchMeusEstudos(); }}
                className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition-all bg-slate-100 px-3 py-2 rounded-xl"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar para Listagem
              </button>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setAdminMode(false); setSelectedTrilha(null); }}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
              !adminMode 
                ? 'bg-emerald-700 border-emerald-700 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Visualizar Estudos
          </button>
          <button
            onClick={() => { setAdminMode(true); setSelectedTrilha(null); }}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
              adminMode 
                ? 'bg-emerald-700 border-emerald-700 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Painel do Administrador
          </button>
        </div>
      </div>

      {!adminMode ? (
        // ======================= MODO ALUNO / MEMBRO =======================
        !selectedTrilha ? (
          <>
            {/* ABA TODOS OS ESTUDOS */}
            {abaEstudos === 'todos' && (
              <div className="space-y-6">
                {/* FILTROS E BARRA DE BUSCA */}
                <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                  <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 w-fit select-none">
                    {['Todos', 'TRILHA', 'PREGACAO', 'DEVOCIONAL', 'AVULSO'].map(tipo => (
                      <button
                        key={tipo}
                        onClick={() => setFiltroTipo(tipo)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          filtroTipo === tipo
                            ? 'bg-white text-emerald-800 shadow-sm'
                            : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                        }`}
                      >
                        {tipo === 'Todos' ? 'Todos' : tipo === 'TRILHA' ? 'Trilhas' : tipo === 'PREGACAO' ? 'Pregações' : tipo === 'DEVOCIONAL' ? 'Devocionais' : 'Avulsos'}
                      </button>
                    ))}
                  </div>

                  <div className="relative flex-grow md:max-w-xs">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Pesquisar por nome..."
                      value={buscaNome}
                      onChange={(e) => setBuscaNome(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-250 bg-white rounded-xl text-xs focus:outline-none focus:border-emerald-600 shadow-xs"
                    />
                  </div>
                </div>

                {/* GRID DE CARDS UNIFICADO (TRILHAS + AVULSOS) */}
                {loading ? (
                  <div className="py-20 flex flex-col items-center justify-center">
                    <Loader2 className="h-10 w-10 text-emerald-700 animate-spin mb-2" />
                    <span className="text-sm text-slate-500 font-semibold">Carregando conteúdos e trilhas...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {estudosFiltrados.length > 0 ? (
                      estudosFiltrados.map(item => (
                        <div
                          key={item.isAvulso ? `avulso-${item.id}` : `trilha-${item.id}`}
                          onClick={() => {
                            if (item.isAvulso) {
                              handleSelectConteudoSolto(item.originalObject)
                            } else {
                              handleSelectTrilha(item)
                            }
                          }}
                          className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:border-slate-350 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
                        >
                          {item.imagemUrl ? (
                            <img
                              src={item.imagemUrl}
                              alt={item.titulo}
                              className="w-full h-40 object-cover border-b border-slate-100"
                              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                            />
                          ) : null}
                          <div className="w-full h-40 bg-slate-50 border-b border-slate-100 flex items-center justify-center text-slate-350" style={{ display: item.imagemUrl ? 'none' : 'flex' }}>
                            <BookOpen className="h-10 w-10" />
                          </div>

                          <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
                                  item.tipo === 'PREGACAO' || item.tipo === 'MINI_CURSO'
                                    ? 'bg-blue-50 text-blue-800 border-blue-100'
                                    : item.tipo === 'TRILHA'
                                    ? 'bg-purple-50 text-purple-800 border-purple-100'
                                    : item.tipo === 'DEVOCIONAL'
                                    ? 'bg-amber-50 text-amber-800 border-amber-100'
                                    : 'bg-slate-100 text-slate-650 border-slate-200'
                                }`}>
                                  {item.tipo === 'PREGACAO' || item.tipo === 'MINI_CURSO' ? 'Pregação' : item.tipo === 'TRILHA' ? 'Trilha' : item.tipo === 'DEVOCIONAL' ? 'Devocional' : 'Avulso'}
                                </span>
                                
                                {item.atorNome && (
                                  <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                                    <User className="h-3 w-3 text-emerald-750" />
                                    {item.atorNome.split(' ')[0]}
                                  </span>
                                )}
                              </div>
                              <h3 className="font-extrabold text-slate-800 text-base line-clamp-1">{item.titulo}</h3>
                              <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">{item.descricao}</p>
                            </div>

                            <div className="border-t border-slate-100 pt-3">
                              {item.status ? (
                                <div className="space-y-1.5">
                                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                                    <span className={`px-1.5 py-0.5 rounded uppercase text-[8px] font-black ${
                                      item.status === 'CONCLUIDO' 
                                        ? 'bg-emerald-50 text-emerald-800' 
                                        : item.status === 'PARALISADO' 
                                        ? 'bg-rose-50 text-rose-800' 
                                        : 'bg-indigo-50 text-indigo-800'
                                    }`}>
                                      {item.status === 'CONCLUIDO' ? 'Concluído' : item.status === 'PARALISADO' ? 'Paralisado' : 'Em Andamento'}
                                    </span>
                                    <span>{item.percentual}%</span>
                                  </div>
                                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                    <div className={`h-full transition-all ${
                                      item.status === 'CONCLUIDO' ? 'bg-emerald-600' : item.status === 'PARALISADO' ? 'bg-rose-500' : 'bg-indigo-600'
                                    }`} style={{ width: `${item.percentual}%` }}></div>
                                  </div>
                                  <div className="flex justify-between items-center text-xs text-emerald-700 font-bold mt-1">
                                    <span>Continuar Estudo</span>
                                    <ChevronRight className="h-4 w-4" />
                                  </div>
                                </div>
                              ) : (
                                <div className="flex justify-between items-center text-xs text-emerald-700 font-bold">
                                  <span>Iniciar Estudo</span>
                                  <ChevronRight className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full py-16 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-2xl text-center">
                        <BookOpen className="h-10 w-10 text-slate-200 mb-3" />
                        <span className="text-xs font-semibold text-slate-400">Nenhum conteúdo ou pregação encontrada.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ABA MEUS ESTUDOS (PROGRESSOS INICIADOS) */}
            {abaEstudos === 'meus-estudos' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                  <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 w-fit select-none">
                    {[
                      { val: 'ALL', label: 'Todos Iniciados' },
                      { val: 'EM_ANDAMENTO', label: 'Em Andamento' },
                      { val: 'PARALISADO', label: 'Paralisados' },
                      { val: 'CONCLUIDO', label: 'Concluídos' }
                    ].map(st => (
                      <button
                        key={st.val}
                        onClick={() => setFiltroStatusMeusEstudos(st.val)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          filtroStatusMeusEstudos === st.val
                            ? 'bg-white text-emerald-800 shadow-sm'
                            : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative flex-grow md:max-w-xs">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Pesquisar meus estudos..."
                      value={buscaNomeMeusEstudos}
                      onChange={(e) => setBuscaNomeMeusEstudos(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-250 bg-white rounded-xl text-xs focus:outline-none focus:border-emerald-650 shadow-xs"
                    />
                  </div>
                </div>

                {/* GRID DE CARDS EXCLUSIVOS DOS MEUS ESTUDOS */}
                {loadingMeusEstudos ? (
                  <div className="py-20 flex flex-col items-center justify-center">
                    <Loader2 className="h-10 w-10 text-emerald-700 animate-spin mb-2" />
                    <span className="text-sm text-slate-500 font-semibold">Carregando seus progressos...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {meusEstudosFiltrados.length > 0 ? (
                      meusEstudosFiltrados.map(item => (
                        <div
                          key={item.tipo === 'AVULSO' ? `meu-avulso-${item.id}` : `meu-trilha-${item.id}`}
                          onClick={() => {
                            if (item.tipo === 'AVULSO') {
                              const orig = conteudosSoltos.find(c => c.id === item.id)
                              if (orig) handleSelectConteudoSolto(orig)
                            } else {
                              handleSelectTrilha(item)
                            }
                          }}
                          className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:border-slate-350 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between p-5 space-y-4"
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border ${
                                item.tipo === 'PREGACAO' || item.tipo === 'MINI_CURSO'
                                  ? 'bg-blue-50 text-blue-800 border-blue-100'
                                  : item.tipo === 'TRILHA'
                                  ? 'bg-purple-50 text-purple-800 border-purple-100'
                                  : item.tipo === 'DEVOCIONAL'
                                  ? 'bg-amber-50 text-amber-800 border-amber-100'
                                  : 'bg-slate-100 text-slate-650 border-slate-200'
                              }`}>
                                {item.tipo === 'PREGACAO' || item.tipo === 'MINI_CURSO' ? 'Pregação' : item.tipo === 'TRILHA' ? 'Trilha' : item.tipo === 'DEVOCIONAL' ? 'Devocional' : 'Avulso'}
                              </span>

                              <select
                                value={item.status || 'EM_ANDAMENTO'}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                  e.stopPropagation()
                                  handleSaveStatusManualmente(item.tipo !== 'AVULSO' ? item.id : null, item.tipo === 'AVULSO' ? item.id : null, e.target.value)
                                }}
                                className="bg-slate-50 border border-slate-200 rounded-md text-[10px] font-extrabold text-slate-600 focus:outline-none p-1 shrink-0 cursor-pointer"
                              >
                                <option value="EM_ANDAMENTO">Em Andamento</option>
                                <option value="PARALISADO">Paralisar</option>
                                <option value="CONCLUIDO">Concluído</option>
                              </select>
                            </div>

                            <h3 className="font-extrabold text-slate-800 text-base line-clamp-1">{item.titulo}</h3>
                            <p className="text-xs text-slate-550 leading-relaxed font-medium line-clamp-2">{item.descricao}</p>
                            
                            {item.atorNome && (
                              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                                <User className="h-3.5 w-3.5 text-emerald-750" />
                                <span>Autor: {item.atorNome}</span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-1.5 pt-2 border-t border-slate-100">
                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                              <span className={`px-1.5 py-0.5 rounded uppercase text-[8px] font-black ${
                                item.status === 'CONCLUIDO' 
                                  ? 'bg-emerald-50 text-emerald-800' 
                                  : item.status === 'PARALISADO' 
                                  ? 'bg-rose-50 text-rose-800' 
                                  : 'bg-indigo-50 text-indigo-800'
                              }`}>
                                {item.status === 'CONCLUIDO' ? 'Concluído' : item.status === 'PARALISADO' ? 'Paralisado' : 'Em Andamento'}
                              </span>
                              <span>{item.percentual}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className={`h-full transition-all ${
                                item.status === 'CONCLUIDO' ? 'bg-emerald-600' : item.status === 'PARALISADO' ? 'bg-rose-500' : 'bg-indigo-600'
                              }`} style={{ width: `${item.percentual}%` }}></div>
                            </div>
                            <div className="flex justify-between items-center text-xs text-emerald-700 font-bold mt-1">
                              <span>Continuar Estudo</span>
                              <ChevronRight className="h-4 w-4" />
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full py-16 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-2xl text-center">
                        <CheckSquare className="h-10 w-10 text-slate-200 mb-3" />
                        <span className="text-xs font-semibold text-slate-400">Você ainda não possui estudos cadastrados ou iniciados com este filtro.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          // ======================= VISÃO INTERNA DO CURSO / LEITOR =======================
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col max-h-[75vh]">
                <div className="p-5 border-b border-slate-150 bg-slate-50/50 space-y-3">
                  <div>
                    <span className="text-[9px] font-extrabold text-emerald-700 uppercase tracking-widest block font-mono">Estudo Ativo</span>
                    <h3 className="font-black text-slate-850 text-base mt-1 line-clamp-1">{selectedTrilha.titulo}</h3>
                    
                    {selectedTrilha.atorNome && (
                      <span className="text-[10px] text-slate-400 font-bold block mt-1">
                        Ministrado por: {selectedTrilha.atorNome}
                      </span>
                    )}
                  </div>
                  
                  {selectedTrilha.id !== null && (
                    <div className="flex justify-between items-center text-xs border-t border-slate-150 pt-2">
                      <span className="text-[10px] font-bold text-slate-450 uppercase">Meu Status:</span>
                      <select
                        value={selectedTrilha.status || 'EM_ANDAMENTO'}
                        onChange={(e) => handleSaveStatusManualmente(selectedTrilha.id, null, e.target.value)}
                        className="bg-white border border-slate-250 rounded-md text-[10px] font-extrabold text-slate-700 focus:outline-none p-1 cursor-pointer"
                      >
                        <option value="EM_ANDAMENTO">Em Andamento</option>
                        <option value="PARALISADO">Paralisado</option>
                        <option value="CONCLUIDO">Concluído</option>
                      </select>
                    </div>
                  )}

                  {!selectedIsSolto && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-500">
                        <span>Progresso do Aluno</span>
                        <span>{percentual}% ({concluidas}/{totalAulas})</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full transition-all duration-300" style={{ width: `${percentual}%` }}></div>
                      </div>
                    </div>
                  )}
                </div>

                {loadingConteudos ? (
                  <div className="py-12 flex justify-center items-center">
                    <Loader2 className="h-6 w-6 text-emerald-750 animate-spin" />
                  </div>
                ) : (
                  <div className="overflow-y-auto divide-y divide-slate-100 max-h-[50vh]">
                    {conteudos.map((aula, index) => (
                      <div
                        key={aula.id}
                        onClick={() => setSelectedConteudo(aula)}
                        className={`p-4 flex gap-3 items-start cursor-pointer transition-all hover:bg-slate-50/60 ${
                          selectedConteudo && selectedConteudo.id === aula.id ? 'bg-emerald-50/40 border-l-4 border-l-emerald-600' : ''
                        }`}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleConcluido(aula.id, aula.concluido)
                          }}
                          className={`mt-0.5 rounded-md border flex items-center justify-center w-5 h-5 transition-all shrink-0 ${
                            aula.concluido 
                              ? 'bg-emerald-600 border-emerald-600 text-white' 
                              : 'border-slate-300 hover:border-emerald-600 bg-white'
                          }`}
                        >
                          {aula.concluido && <Check className="h-3 w-3 stroke-[3]" />}
                        </button>

                        <div className="space-y-0.5 flex-grow">
                          <span className="text-[9px] font-bold text-slate-400 font-mono block">MÓDULO {aula.ordem || index + 1}</span>
                          <h4 className="font-extrabold text-xs text-slate-800 leading-tight">{aula.titulo}</h4>
                          <p className="text-[10px] text-slate-555 line-clamp-1">{aula.resumo}</p>
                        </div>

                        {aula.videoUrl ? (
                          <Video className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-1" />
                        ) : (
                          <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-1" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm p-6 space-y-6">
                {selectedConteudo ? (
                  <>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-150 pb-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-black text-slate-850 uppercase tracking-wide">{selectedConteudo.titulo}</h2>
                          {selectedConteudo.atorNome && (
                            <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-800 text-[9px] font-black rounded">
                              Ator: {selectedConteudo.atorNome}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-555 mt-1 font-medium">{selectedConteudo.resumo}</p>
                      </div>

                      <div className="flex gap-2">
                        {selectedConteudo.pdfUrl && (
                          <a
                            href={selectedConteudo.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-250 text-slate-650 rounded-lg text-xs font-bold transition-all shrink-0"
                          >
                            <FileDown className="h-4 w-4 text-emerald-700" />
                            <span className="hidden sm:inline">Material PDF</span>
                          </a>
                        )}

                        <button
                          onClick={() => handleToggleConcluido(selectedConteudo.id, selectedConteudo.concluido)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                            selectedConteudo.concluido
                              ? 'bg-emerald-50 border-emerald-250 text-emerald-800'
                              : 'border-slate-250 hover:bg-slate-50 text-slate-650'
                          }`}
                        >
                          <CheckCircle2 className={`h-4 w-4 ${selectedConteudo.concluido ? 'text-emerald-700' : 'text-slate-400'}`} />
                          {selectedConteudo.concluido ? 'Aula Concluída' : 'Marcar como Concluída'}
                        </button>
                      </div>
                    </div>

                    {selectedConteudo.videoUrl ? (
                      <div className="w-full bg-slate-900 aspect-video rounded-xl overflow-hidden shadow-inner flex flex-col justify-center items-center text-white border border-slate-800">
                        <div className="p-4 bg-white/10 rounded-full border border-white/20 animate-pulse cursor-pointer">
                          <Play className="h-10 w-10 fill-current text-emerald-550" />
                        </div>
                        <span className="text-xs font-bold text-slate-450 mt-3">Visualização de Vídeo Ativa</span>
                        <span className="text-[10px] text-slate-550 mt-0.5">{selectedConteudo.videoUrl}</span>
                      </div>
                    ) : null}

                    {selectedConteudo.textoCompleto && (
                      <div className="space-y-3">
                        <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Material de Apoio e Estudo</span>
                        <div className="text-sm leading-relaxed bg-slate-50/50 p-5 rounded-xl border border-slate-150">
                          {renderizarTextoRico(selectedConteudo.textoCompleto)}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-24 flex flex-col items-center justify-center text-center text-slate-400 text-sm">
                    <BookOpenCheck className="h-12 w-12 text-slate-200 mb-3" />
                    Sem conteúdo ativo selecionado. Escolha uma aula na timeline lateral.
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      ) : (
        // ======================= PAINEL DE GESTÃO DO ADMINISTRADOR =======================
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* COLUNA 1: AGRUPAMENTOS (CURSOS E PREGAÇÕES) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-3 border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Agrupamento de aulas, pregações e devocionais</h3>
              
              <div className="flex items-center gap-2 justify-end">
                {/* 🔍 FILTRO POR NOME EM CURSOS E PREGAÇÕES */}
                <div className="relative flex-grow sm:flex-grow-0">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filtrar..."
                    value={buscaAdminTrilhas}
                    onChange={(e) => setBuscaAdminTrilhas(e.target.value)}
                    className="pl-8 pr-3 py-1.5 border border-slate-250 rounded-lg text-[11px] focus:outline-none focus:border-emerald-650 bg-white w-full sm:w-40"
                  />
                </div>

                <button
                  onClick={() => {
                    setEditingTrilhaId(null);
                    setTrilhaTitulo('');
                    setTrilhaDescricao('');
                    setTrilhaImagemUrl('');
                    setTrilhaTipo('TRILHA');
                    setTrilhaAtorId('');
                    setShowTrilhaModal(true);
                  }}
                  className="flex items-center justify-center h-8 w-8 bg-emerald-700 text-white rounded-lg hover:bg-emerald-650 transition-all shrink-0"
                  title="Criar Agrupamento"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {adminTrilhasFiltradas.length > 0 ? (
                adminTrilhasFiltradas.map((t) => (
                  <div key={t.id} className="p-4 border border-slate-200 rounded-xl hover:bg-slate-50/50 transition-all flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border ${
                          t.tipo === 'PREGACAO' || t.tipo === 'MINI_CURSO'
                            ? 'bg-blue-50 text-blue-800 border-blue-100'
                            : t.tipo === 'TRILHA'
                            ? 'bg-purple-50 text-purple-800 border-purple-100'
                            : 'bg-amber-50 text-amber-800 border-amber-100'
                        }`}>{t.tipo === 'PREGACAO' || t.tipo === 'MINI_CURSO' ? 'Pregação' : t.tipo === 'TRILHA' ? 'Trilha' : 'Devocional'}</span>
                        
                        {t.atorNome && (
                          <span className="text-[9px] font-bold text-slate-450 bg-slate-100 px-1 rounded">
                            Ator: {t.atorNome}
                          </span>
                        )}
                      </div>
                      <h4 className="font-extrabold text-slate-800 text-sm mt-1">{t.titulo}</h4>
                      <p className="text-xs text-slate-400 font-semibold line-clamp-1">{t.descricao}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditTrilha(t)}
                        title="Editar estudo"
                        className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-all"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 italic text-xs">Nenhum curso ou pregação localizado.</div>
              )}
            </div>
          </div>

          {/* COLUNA 2: AULAS E LEITURAS */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-3 border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Aulas, leituras e devocionais</h3>
              
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 justify-end">
                <select
                  value={filterAdminTrilhaId}
                  onChange={(e) => setFilterAdminTrilhaId(e.target.value)}
                  className="pl-3 pr-8 py-1.5 border border-slate-250 rounded-lg text-xs font-bold text-slate-700 bg-white focus:outline-none focus:border-emerald-650 cursor-pointer w-full sm:w-48 md:w-56 shrink-0"
                >
                  <option value="TODOS">Todos os agrupamentos</option>
                  <option value="SOLTOS">Sem agrupamento (Avulsos)</option>
                  {trilhas.map(t => (
                    <option key={t.id} value={t.id}>{t.titulo}</option>
                  ))}
                </select>

                <div className="relative flex-grow sm:flex-grow-0">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filtrar por nome..."
                    value={buscaAdminNome}
                    onChange={(e) => setBuscaAdminNome(e.target.value)}
                    className="pl-8 pr-3 py-1.5 border border-slate-250 rounded-lg text-[11px] focus:outline-none focus:border-emerald-650 bg-white w-full sm:w-36"
                  />
                </div>

                <button
                  onClick={() => {
                    setEditingConteudoId(null);
                    setConteudoTitulo('');
                    setConteudoResumo('');
                    setConteudoTextoCompleto('');
                    setConteudoVideoUrl('');
                    setConteudoPdfUrl('');
                    setConteudoOrdem('');
                    setConteudoTrilhaId('solto');
                    setConteudoAtorId('');
                    setShowConteudoModal(true);
                  }}
                  className="flex items-center justify-center h-8 w-8 bg-emerald-700 text-white rounded-lg hover:bg-emerald-650 transition-all shrink-0"
                  title="Criar Conteúdo"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {loadingAdminConteudos ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="h-8 w-8 text-emerald-700 animate-spin" />
                </div>
              ) : adminConteudosFiltrados.length > 0 ? (
                adminConteudosFiltrados.map((c) => (
                  <div key={c.id} className="p-4 border border-slate-200 rounded-xl hover:bg-slate-50/50 transition-all flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Ordem {c.ordem}</span>
                        <span className="text-[9px] font-extrabold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 line-clamp-1">{c.nomeTrilha}</span>
                        {c.pdfUrl && <span className="text-[8px] font-extrabold text-rose-800 bg-rose-50 px-1 rounded border border-rose-100">PDF</span>}
                        {c.atorNome && <span className="text-[8px] font-bold text-slate-450 bg-slate-100 px-1 rounded">Ator: {c.atorNome}</span>}
                      </div>
                      <h4 className="font-extrabold text-slate-800 text-sm">{c.titulo}</h4>
                      <p className="text-xs text-slate-455 line-clamp-1">{c.resumo}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleEditConteudo(c)}
                        title="Editar conteúdo"
                        className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-all"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 italic text-xs">Nenhuma aula ou conteúdo localizado.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL CRIAÇÃO/EDIÇÃO DE AGRUPAMENTO (TRILHA/CURSO/DEVOCIONAL) */}
      {showTrilhaModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-250 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center bg-slate-50 px-5 py-3.5 border-b border-slate-200">
              <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">{editingTrilhaId ? 'Editar Agrupamento' : 'Novo Agrupamento'}</h3>
              <button
                onClick={() => setShowTrilhaModal(false)}
                className="p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-650 rounded transition-all"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleSaveTrilha} className="p-5 space-y-4">
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
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Título do Curso / Devocional *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Teologia Bíblica Sistemática..."
                  value={trilhaTitulo}
                  onChange={(e) => setTrilhaTitulo(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-650"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Tipo de Estudo *</label>
                <select
                  value={trilhaTipo}
                  onChange={(e) => setTrilhaTipo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none bg-white font-semibold text-slate-700"
                >
                  <option value="TRILHA">Trilha Completa</option>
                  <option value="PREGACAO">Pregação</option>
                  <option value="DEVOCIONAL">Devocional Diário</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Imagem de Capa</label>
                <div className="flex items-center gap-3 mt-1">
                  {trilhaImagemUrl && (
                    <img src={trilhaImagemUrl} alt="Preview" className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
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
                            setTrilhaImagemUrl(event.target.result);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                      id="trilhaImageUploadInput"
                    />
                    <label
                      htmlFor="trilhaImageUploadInput"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-650 bg-white font-semibold text-slate-700 cursor-pointer flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <span className="truncate pr-2">{trilhaImagemUrl ? 'Alterar Capa' : 'Selecionar Capa'}</span>
                      <Upload className="h-4 w-4 text-slate-400 shrink-0" />
                    </label>
                  </div>
                  {trilhaImagemUrl && (
                    <button
                      type="button"
                      onClick={() => setTrilhaImagemUrl('')}
                      className="p-2.5 border border-red-200 text-red-650 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                      title="Limpar Capa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* 👤 ATOR / AUTOR (MEMBRO) */}
              <div>
                <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Autor *</label>
                <select
                  value={trilhaAtorId}
                  onChange={(e) => setTrilhaAtorId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none bg-white font-semibold text-slate-700"
                  required
                >
                  <option value="">Selecione o Autor *</option>
                  {membros.map(m => (
                    <option key={m.id} value={m.id}>{m.nomeCompleto}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Descrição Curta *</label>
                <textarea
                  required
                  placeholder="Forneça um breve resumo explicativo..."
                  rows={2}
                  value={trilhaDescricao}
                  onChange={(e) => setTrilhaDescricao(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-650"
                />
              </div>

              <div className="flex justify-end gap-2 text-xs font-bold pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTrilhaModal(false)}
                  className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-2 bg-emerald-700 text-white rounded-xl hover:bg-emerald-650 transition-all shadow-xs"
                >
                  {editingTrilhaId ? 'Salvar Alterações' : 'Criar Estudo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CRIAÇÃO/EDIÇÃO DE CONTEÚDO / AULA */}
      {showConteudoModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-250 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center bg-slate-50 px-6 py-4 border-b border-slate-200 shrink-0">
              <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">{editingConteudoId ? 'Editar Aula / Leitura' : 'Nova Aula / Leitura'}</h3>
              <button
                onClick={() => setShowConteudoModal(false)}
                className="p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-650 rounded transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveConteudo} className="p-6 space-y-4 overflow-y-auto flex-grow">
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
              <div>
                <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Título do Conteúdo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Aula 1: Contexto Histórico..."
                  value={conteudoTitulo}
                  onChange={(e) => setConteudoTitulo(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-650"
                />
              </div>

              {!editingConteudoId && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Pertence a qual Estudo? *</label>
                  <select
                    value={conteudoTrilhaId}
                    onChange={(e) => setConteudoTrilhaId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none bg-white font-semibold text-slate-700"
                  >
                    <option value="solto">Nenhum (Conteúdo Avulso / Solto)</option>
                    {trilhas.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.tipo === 'PREGACAO' || t.tipo === 'MINI_CURSO' ? 'Pregação' : t.tipo === 'TRILHA' ? 'Trilha' : 'Devocional'}: {t.titulo}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">URL do Vídeo (Youtube/Opcional)</label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/..."
                    value={conteudoVideoUrl}
                    onChange={(e) => setConteudoVideoUrl(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-650"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Ordem/Posição</label>
                  <input
                    type="number"
                    min={1}
                    placeholder="Incremental"
                    value={conteudoOrdem}
                    onChange={(e) => setConteudoOrdem(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-650"
                  />
                </div>
              </div>

              {/* 👤 ATOR / AUTOR (MEMBRO) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Autor *</label>
                  <select
                    value={conteudoAtorId}
                    onChange={(e) => setConteudoAtorId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none bg-white font-semibold text-slate-700"
                    required
                  >
                    <option value="">Selecione o Autor *</option>
                    {membros.map(m => (
                      <option key={m.id} value={m.id}>{m.nomeCompleto}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Material</label>
                  <div className="flex items-center gap-2">
                    {conteudoPdfUrl && (
                      <a href={conteudoPdfUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-emerald-700 truncate max-w-[80px]" title={conteudoPdfUrl}>Arquivo</a>
                    )}
                    <div className="relative flex-grow">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setConteudoPdfUrl(event.target.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                        id="conteudoMaterialUploadInput"
                      />
                      <label
                        htmlFor="conteudoMaterialUploadInput"
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white font-semibold text-slate-700 cursor-pointer flex items-center justify-between hover:bg-slate-50 transition-colors"
                      >
                        <span className="truncate pr-2">{conteudoPdfUrl ? 'Alterar Material' : 'Selecionar Material'}</span>
                        <Upload className="h-4 w-4 text-slate-400 shrink-0" />
                      </label>
                    </div>
                    {conteudoPdfUrl && (
                      <button
                        type="button"
                        onClick={() => setConteudoPdfUrl('')}
                        className="p-2 border border-red-200 text-red-650 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                        title="Remover Material"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Resumo Curto *</label>
                <input
                  type="text"
                  required
                  placeholder="Forneça uma linha de resumo..."
                  value={conteudoResumo}
                  onChange={(e) => setConteudoResumo(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-650"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Texto de Estudo / Artigo Completo</label>
                <RichTextEditor
                  value={conteudoTextoCompleto}
                  onChange={(html) => setConteudoTextoCompleto(html)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowConteudoModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-bold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-650 transition-all shadow-sm"
                >
                  {editingConteudoId ? 'Salvar Alterações' : 'Salvar Conteúdo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
