import { useState, useEffect } from 'react'
import {
  Users, Search, Phone, ChevronRight, ChevronDown, Loader2,
  AlertCircle, Shield, Award, HelpCircle, ChevronLeft
} from 'lucide-react'

export default function OrganogramaView({ preFilter, onBack }) {
  const [treeData, setTreeData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Search inputs
  const [searchNome, setSearchNome] = useState(preFilter?.nome || '')
  const [searchCargo, setSearchCargo] = useState('')

  // State to track collapsed/expanded nodes
  const [collapsedNodes, setCollapsedNodes] = useState({})

  // Fetch organogram data
  const fetchOrganograma = async () => {
    setLoading(true)
    setError(null)
    try {
      let url = '/api/organograma?'
      if (searchNome) url += `nome=${encodeURIComponent(searchNome)}&`
      if (searchCargo) url += `tituloCargo=${encodeURIComponent(searchCargo)}&`
      
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setTreeData(data)
      } else {
        setError('Erro ao carregar estrutura hierárquica.')
      }
    } catch (err) {
      setError('Falha de conexão com o servidor.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Sync preFilter when it changes
  useEffect(() => {
    if (preFilter) {
      setSearchNome(preFilter.nome || '')
      setSearchCargo(preFilter.cargo || '')
    }
  }, [preFilter])

  // Trigger search on mount and when inputs change
  useEffect(() => {
    fetchOrganograma()
  }, [searchNome, searchCargo])

  // Get initials for profile fallback
  const getInitials = (name) => {
    if (!name) return '?'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return parts[0].slice(0, 2).toUpperCase()
  }

  // Collapse/Expand state helper
  const toggleCollapse = (matricula) => {
    setCollapsedNodes(prev => ({
      ...prev,
      [matricula]: !prev[matricula]
    }))
  }

  // Card Inner Content
  const renderCardInner = (node, hasChildren, isCollapsed) => {
    return (
      <>
        <div className="flex items-center gap-3">
          {/* Profile Avatar / Initials */}
          {node.fotoPerfilUrl ? (
            <img
              src={node.fotoPerfilUrl}
              alt={node.nomeCompleto}
              className="w-10 h-10 rounded-full object-cover border border-slate-100 shrink-0"
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
            />
          ) : null}
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-100" style={{ display: node.fotoPerfilUrl ? 'none' : 'flex' }}>
            {getInitials(node.nomeCompleto)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-col">
              <h4 className="font-bold text-slate-800 text-sm leading-tight truncate" title={node.nomeCompleto}>{node.nomeCompleto}</h4>
              <span className="text-[9px] font-mono text-slate-400 mt-0.5">
                Matrícula: {String(node.matricula).padStart(4, '0')}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <Award className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
              <span className="truncate">{node.tituloCargo || 'Membro'}</span>
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
          {node.whatsapp ? (
            <a
              href={`https://wa.me/55${node.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 px-3 py-1.5 border border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-lg text-xs font-bold transition-colors flex-1"
              title="WhatsApp"
            >
              <Phone className="h-3.5 w-3.5 shrink-0" />
              Contato
            </a>
          ) : (
            <span className="text-[10px] text-slate-400 font-medium flex-1 text-center py-1.5">Sem WhatsApp</span>
          )}
          {hasChildren && (
            <button
              onClick={() => toggleCollapse(node.matricula)}
              className="px-2.5 py-1.5 hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-500 transition-colors flex items-center gap-1 text-xs font-semibold shrink-0"
              title={isCollapsed ? 'Expandir' : 'Colapsar'}
            >
              <span className="text-[10px] text-slate-400">({node.liderados.length})</span>
              {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      </>
    )
  }

  // Recursive Node Renderer (Mobile - Vertical List)
  const renderNodeMobile = (node, depth = 0) => {
    const isCollapsed = !!collapsedNodes[node.matricula]
    const hasChildren = node.liderados && node.liderados.length > 0

    return (
      <div key={node.matricula} className="flex flex-col relative shrink-0">
        {/* Node Card */}
        <div className="flex items-center gap-3 relative z-10">
          {/* Connecting line to parent */}
          {depth > 0 && (
            <div className="absolute -left-8 top-1/2 w-8 h-[2px] bg-emerald-500/20 -z-10" />
          )}

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all flex flex-col gap-3 min-w-[280px] max-w-[300px] w-full">
            {renderCardInner(node, hasChildren, isCollapsed)}
          </div>
        </div>

        {/* Children Recursion */}
        {hasChildren && !isCollapsed && (
          <div className="relative mt-4 flex flex-col gap-4 pl-8 border-l-2 border-emerald-500/20 pt-2 animate-in fade-in duration-300">
            {node.liderados.map((child) => renderNodeMobile(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  // Recursive Node Renderer (Desktop - Hybrid Horizontal/Vertical Chart)
  const renderNodeDesktop = (node, depth = 0) => {
    const isCollapsed = !!collapsedNodes[node.matricula]
    const hasChildren = node.liderados && node.liderados.length > 0

    return (
      <div key={node.matricula} className="flex flex-col items-center relative shrink-0">
        {/* Card and top connectors */}
        <div className="relative flex flex-col items-center">
          {/* Vertical line connecting to horizontal connector bar above */}
          {depth === 1 && (
            <div className="w-[2px] h-4 bg-emerald-500/20 mb-0" />
          )}
          {/* Horizontal line branch for vertical stacking below Level 1 */}
          {depth > 1 && (
            <div className="absolute -left-8 top-1/2 w-8 h-[2px] bg-emerald-500/20 -z-10" />
          )}

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all flex flex-col gap-3 min-w-[280px] max-w-[300px] w-full text-left">
            {renderCardInner(node, hasChildren, isCollapsed)}
          </div>
        </div>

        {/* Children Recursion */}
        {hasChildren && !isCollapsed && (
          depth === 0 ? (
            // Depth 0 (Root) -> Level 1 children are placed side-by-side horizontally
            <div className="flex flex-col items-center">
              <div className="w-[2px] h-8 bg-emerald-500/20" />
              <div className="relative flex flex-row gap-8 justify-center items-start pt-4">
                {node.liderados.length > 1 && (
                  <div className="absolute top-0 left-[150px] right-[150px] h-[2px] bg-emerald-500/20" />
                )}
                {node.liderados.map((child) => renderNodeDesktop(child, depth + 1))}
              </div>
            </div>
          ) : (
            // Depth 1+ (Level 2+) -> Children are stacked vertically to save space
            <div className="flex flex-col items-center">
              <div className="w-[2px] h-6 bg-emerald-500/20" />
              <div className="relative flex flex-col gap-4 pl-8 border-l-2 border-emerald-500/20 pt-2 text-left">
                {node.liderados.map((child) => renderNodeDesktop(child, depth + 1))}
              </div>
            </div>
          )
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* BREADCRUMB TITLE */}
      {onBack && (
        <div className="flex items-center gap-3 mb-4 animate-in fade-in duration-200">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-600 focus:outline-none border border-slate-200 bg-white"
            title="Voltar"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="text-sm font-semibold text-slate-500">
            Painel Administrativo / <span className="text-slate-800 font-bold">Organograma</span>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Organograma da Igreja</h1>
          <p className="text-sm text-slate-500 mt-1">Estrutura organizacional de liderança e relacionamentos eclesiásticos.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3.5 py-2 rounded-xl border border-emerald-100 text-xs font-semibold">
          <Users className="h-4.5 w-4.5 text-emerald-700" />
          Estrutura Dinâmica
        </div>
      </div>

      {/* SEARCH/FILTER BAR */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Buscar por Nome
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ex: Pastor João..."
                value={searchNome}
                onChange={(e) => setSearchNome(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Buscar por Cargo/Função
            </label>
            <select
              value={searchCargo}
              onChange={(e) => setSearchCargo(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white"
            >
              <option value="">Todos os Cargos</option>
              <option value="Pastor">Pastor</option>
              <option value="Presbítero">Presbítero</option>
              <option value="Membro">Membro</option>
              <option value="Visitante">Visitante</option>
            </select>
          </div>
        </div>
        {(searchNome || searchCargo) && (
          <p className="text-xs text-slate-400 mt-2 italic">
            Nota: Ao aplicar filtros, o sistema exibirá os nós correspondentes juntamente com seus líderes diretos e liderados imediatos para contexto.
          </p>
        )}
      </div>

      {/* TREE CONTENT CONTAINER */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 overflow-x-auto">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 text-emerald-700 animate-spin mb-2" />
            <span className="text-sm font-medium text-slate-600">Construindo organograma...</span>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 text-red-700 border border-red-200 rounded-xl flex gap-3 items-center">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        ) : treeData.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-600">Árvore hierárquica vazia</p>
            <p className="text-xs mt-1">Não há líderes registrados correspondentes aos filtros.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Desktop Hybrid Tree Chart */}
            <div className="hidden md:flex flex-col items-center justify-center p-4 min-w-[900px] overflow-visible">
              {treeData.map((root) => renderNodeDesktop(root))}
            </div>

            {/* Mobile Responsive Vertical Tree */}
            <div className="flex md:hidden flex-col gap-6">
              {treeData.map((root) => renderNodeMobile(root))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
