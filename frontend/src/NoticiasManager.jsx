import { useState, useEffect } from 'react'
import {
  Newspaper, Calendar, Plus, Trash2, X, Image,
  ChevronRight, ArrowLeft, Loader2, FileText, CheckCircle2,
  Pencil, Search, User, Filter, Upload
} from 'lucide-react'

export default function NoticiasManager() {
  const [noticias, setNoticias] = useState([])
  const [loading, setLoading] = useState(false)
  const [zoomedImage, setZoomedImage] = useState(null)

  // Filtros
  const [filtroSociedade, setFiltroSociedade] = useState('TODA_IGREJA') // 'TODA_IGREJA' | 'UCP' | 'UPA' | 'UMP' | 'SAF' | 'UPH'
  const [buscaTexto, setBuscaTexto] = useState('')

  // Modal e Formulário (Cadastro / Edição)
  const [showModal, setShowModal] = useState(false)
  const [editingNoticiaId, setEditingNoticiaId] = useState(null)
  const [titulo, setTitulo] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [imagemUrl, setImagemUrl] = useState('')
  const [sociedade, setSociedade] = useState('TODA_IGREJA')

  useEffect(() => {
    fetchNoticias()
  }, [])

  const fetchNoticias = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/noticias')
      if (res.ok) {
        const data = await res.json()
        setNoticias(data)
      }
    } catch (err) {
      console.error('Erro ao buscar notícias', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNoticia = async (e) => {
    e.preventDefault()
    if (!titulo || !conteudo) {
      alert('Preencha título e conteúdo.')
      return
    }

    try {
      const url = editingNoticiaId ? `/api/noticias/${editingNoticiaId}` : '/api/noticias'
      const method = editingNoticiaId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo,
          conteudo,
          imagemUrl: imagemUrl || null,
          sociedade: sociedade.toUpperCase()
        })
      })
      if (res.ok) {
        setShowModal(false)
        setEditingNoticiaId(null)
        setTitulo('')
        setConteudo('')
        setImagemUrl('')
        setSociedade('TODA_IGREJA')
        fetchNoticias()
        alert(editingNoticiaId ? 'Matéria atualizada com sucesso!' : 'Matéria publicada com sucesso!')
      }
    } catch (err) {
      alert('Erro ao salvar notícia.')
    }
  }

  const handleEditNoticia = (item) => {
    setEditingNoticiaId(item.id)
    setTitulo(item.titulo)
    setConteudo(item.conteudo)
    setImagemUrl(item.imagemUrl || '')
    setSociedade(item.sociedade || 'TODA_IGREJA')
    setShowModal(true)
  }

  const handleDeleteNoticia = async (id) => {
    if (!window.confirm('Excluir esta publicação do mural?')) return

    try {
      const res = await fetch(`/api/noticias/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        fetchNoticias()
      }
    } catch (err) {
      alert('Erro ao excluir notícia.')
    }
  }

  // Filtragem Reativa de Notícias (por Sociedade Interna + Busca por Nome/Texto)
  const noticiasFiltradas = noticias.filter(item => {
    // Filtro de Sociedade
    if (filtroSociedade !== 'TODA_IGREJA') {
      if (item.sociedade !== filtroSociedade) return false
    }
    // Filtro por nome/busca
    if (buscaTexto.trim() !== '') {
      const matchesTitulo = item.titulo.toLowerCase().includes(buscaTexto.toLowerCase())
      const matchesConteudo = item.conteudo.toLowerCase().includes(buscaTexto.toLowerCase())
      return matchesTitulo || matchesConteudo
    }
    return true
  })

  const getSociedadeLabel = (val) => {
    if (val === 'TODA_IGREJA') return 'Toda Igreja'
    return val
  }

  return (
    <div className="space-y-6">
      {/* 🟢 BANNER PRINCIPAL VERDE ESCURO (RESTABELECIDO) */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0b4233] to-[#125844] text-white p-6 md:p-8 rounded-3xl shadow-lg border border-[#0d4f3d]">
        <div className="absolute right-6 bottom-[-20px] opacity-10 pointer-events-none transform rotate-12">
          <Newspaper className="h-44 w-44 text-white" />
        </div>

        <div className="relative z-10 space-y-3 max-w-2xl">
          <span className="inline-block px-3 py-1 bg-emerald-950/60 text-emerald-200 text-[10px] font-bold rounded-full uppercase tracking-wider border border-emerald-700/30">
            Comunicação Oficial
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Bem-vindo ao Portal de Comunicação</h1>
          <p className="text-sm md:text-base text-emerald-100/90 leading-relaxed font-light">
            Mantenha-se informado sobre notícias, comunicados pastorais e eventos da nossa comunidade, pastorais e nossas programações.
          </p>
        </div>
      </div>

      {/* SELETOR DE FILTROS E PESQUISA */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-white p-4 border border-slate-200 rounded-2xl shadow-sm">
          {/* Abas de Sociedades Internas */}
          <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 select-none">
            {[
              { val: 'TODA_IGREJA', label: 'Toda Igreja' },
              { val: 'UCP', label: 'UCP' },
              { val: 'UPA', label: 'UPA' },
              { val: 'UMP', label: 'UMP' },
              { val: 'SAF', label: 'SAF' },
              { val: 'UPH', label: 'UPH' }
            ].map(soc => (
              <button
                key={soc.val}
                onClick={() => setFiltroSociedade(soc.val)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filtroSociedade === soc.val
                    ? 'bg-[#0b4233] text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                {soc.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Input de busca por texto */}
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Pesquisar comunicados..."
                value={buscaTexto}
                onChange={(e) => setBuscaTexto(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-250 bg-white rounded-xl text-xs focus:outline-none focus:border-emerald-600 shadow-xs"
              />
            </div>

            <button
              onClick={() => {
                setEditingNoticiaId(null);
                setTitulo('');
                setConteudo('');
                setImagemUrl('');
                setSociedade('TODA_IGREJA');
                setShowModal(true);
              }}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-650 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <>
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader2 className="h-10 w-10 text-emerald-700 animate-spin mb-2" />
              <span className="text-sm text-slate-500 font-semibold">Carregando feed de notícias...</span>
            </div>
          ) : noticiasFiltradas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {noticiasFiltradas.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:border-slate-350 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {item.imagemUrl ? (
                      <img
                        src={item.imagemUrl}
                        alt={item.titulo}
                        onClick={() => setZoomedImage(item.imagemUrl)}
                        className="w-full h-64 object-cover border-b border-slate-100 cursor-pointer hover:opacity-95 transition-opacity"
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                      />
                    ) : null}
                    <div className="w-full h-64 bg-slate-50 border-b border-slate-100 flex items-center justify-center text-slate-300" style={{ display: item.imagemUrl ? 'none' : 'flex' }}>
                      <Newspaper className="h-10 w-10" />
                    </div>

                    <div className="p-5 space-y-3">
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-emerald-700" />
                          {new Date(item.dataPublicacao).toLocaleDateString('pt-BR')}
                        </span>
                        
                        <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleEditNoticia(item)}
                            className="p-1 text-slate-450 hover:text-emerald-750 hover:bg-emerald-50 rounded transition-all"
                            title="Editar post"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteNoticia(item.id)}
                            className="p-1 text-slate-455 hover:text-red-650 hover:bg-red-50 rounded transition-all"
                            title="Excluir post"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                          item.sociedade === 'TODA_IGREJA' 
                            ? 'bg-slate-50 text-slate-650 border-slate-200' 
                            : 'bg-emerald-50 text-emerald-800 border-emerald-100'
                        }`}>
                          {getSociedadeLabel(item.sociedade)}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-slate-800 text-base">{item.titulo}</h3>
                      <p className="text-xs text-slate-500 font-semibold leading-relaxed whitespace-pre-wrap">{item.conteudo}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-2xl shadow-sm text-center">
              <Newspaper className="h-10 w-10 text-slate-250 mb-3" />
              <span className="text-xs font-semibold text-slate-400">Nenhum comunicado localizado para este filtro.</span>
            </div>
          )}
        </>
      {/* MODAL DE ZOOM DE IMAGEM */}
      {zoomedImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200" onClick={() => setZoomedImage(null)}>
          <button 
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            onClick={() => setZoomedImage(null)}
          >
            <X className="h-6 w-6" />
          </button>
          <img 
            src={zoomedImage} 
            alt="Imagem ampliada" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}

      {/* MODAL DE CADASTRO / EDIÇÃO DE ANÚNCIO */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-250 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center bg-slate-50 px-5 py-3.5 border-b border-slate-200">
              <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">{editingNoticiaId ? 'Editar Matéria' : 'Publicar no Mural'}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-650 rounded-lg transition-all"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleSaveNoticia} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Título da Notícia *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Novo Horário do Culto de Jovens..."
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Sociedade Interna / Destinatário *</label>
                  <select
                    value={sociedade}
                    onChange={(e) => setSociedade(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none bg-white font-semibold text-slate-700"
                  >
                    <option value="TODA_IGREJA">Toda Igreja</option>
                    <option value="UCP">UCP (Crianças)</option>
                    <option value="UPA">UPA (Adolescentes)</option>
                    <option value="UMP">UMP (Jovens)</option>
                    <option value="SAF">SAF (Mulheres)</option>
                    <option value="UPH">UPH (Homens)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Imagem de Destaque</label>
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
                        id="newsImageUploadInput"
                      />
                      <label
                        htmlFor="newsImageUploadInput"
                        className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-600 bg-white font-semibold text-slate-700 cursor-pointer flex items-center justify-between hover:bg-slate-50 transition-colors"
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
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Conteúdo da Notícia (Máx 400 caracteres) *</label>
                <textarea
                  required
                  maxLength={400}
                  placeholder="Escreva a notícia (até 400 caracteres)..."
                  rows={5}
                  value={conteudo}
                  onChange={(e) => setConteudo(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-650 min-h-[120px]"
                />
              </div>

              <div className="flex justify-end gap-2 text-xs font-bold pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-2 bg-emerald-700 text-white rounded-xl hover:bg-emerald-650 transition-all shadow-xs"
                >
                  {editingNoticiaId ? 'Salvar Alterações' : 'Publicar Notícia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
