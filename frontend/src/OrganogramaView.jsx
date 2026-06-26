import { useState, useEffect } from 'react'
import {
  Users, Search, Phone, ChevronRight, ChevronDown, Loader2,
  AlertCircle, Shield, Award, HelpCircle, ChevronLeft
} from 'lucide-react'

export default function OrganogramaView({ preFilter, onBack, onViewMemberDetails }) {
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

  // Helper to find node by name recursively
  const findNodeByName = (nodes, name) => {
    if (!nodes || !name) return null;
    const search = name.toLowerCase();
    for (const node of nodes) {
      if (node.nomeCompleto.toLowerCase().includes(search)) {
        return node;
      }
      if (node.liderados && node.liderados.length > 0) {
        const found = findNodeByName(node.liderados, name);
        if (found) return found;
      }
    }
    return null;
  }

  // State to track focal node matrícula
  const [focalMatricula, setFocalMatricula] = useState(null)

  // Sync focal node when tree data or preFilter changes
  useEffect(() => {
    if (treeData && treeData.length > 0) {
      if (preFilter?.nome) {
        const found = findNodeByName(treeData, preFilter.nome);
        if (found) {
          setFocalMatricula(found.matricula);
          return;
        }
      }
      // If we already have a focal matricula, let's see if it still exists in the tree
      if (focalMatricula) {
        const info = findNodeAndAncestors(treeData, focalMatricula);
        if (info) return; // Keep current focal matricula
      }
      setFocalMatricula(treeData[0].matricula);
    } else {
      setFocalMatricula(null);
    }
  }, [treeData, preFilter])

  // Helper to find a node and all its ancestors from root
  const findNodeAndAncestors = (nodes, targetMatricula, ancestors = []) => {
    if (!nodes || nodes.length === 0) return null;
    for (const node of nodes) {
      if (node.matricula === targetMatricula) {
        return { node, ancestors };
      }
      if (node.liderados && node.liderados.length > 0) {
        const result = findNodeAndAncestors(node.liderados, targetMatricula, [...ancestors, node]);
        if (result) return result;
      }
    }
    return null;
  };

  const focalInfo = findNodeAndAncestors(treeData, focalMatricula);
  const focalNode = focalInfo ? focalInfo.node : (treeData && treeData[0] ? treeData[0] : null);
  const ancestors = focalInfo ? focalInfo.ancestors : [];

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
          <h1 className="text-2xl font-bold text-slate-900">Organograma Explorer</h1>
          <p className="text-sm text-slate-500 mt-1">Navegue interativamente pela hierarquia de liderança e subordinação.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3.5 py-2 rounded-xl border border-emerald-100 text-xs font-semibold">
          <Users className="h-4.5 w-4.5 text-emerald-700" />
          Navegação Interativa
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
          <div className="flex justify-between items-center mt-3">
            <p className="text-xs text-slate-400 italic">
              Nota: Filtrando e exibindo a estrutura de liderança correspondente.
            </p>
            <button
              onClick={() => {
                setSearchNome('');
                setSearchCargo('');
              }}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              Limpar Filtros
            </button>
          </div>
        )}
      </div>

      {/* EXPLORER LAYOUT */}
      <div className="bg-slate-50/50 border border-slate-200 rounded-2xl shadow-sm p-6 overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 text-emerald-700 animate-spin mb-2" />
            <span className="text-sm font-medium text-slate-600">Carregando organograma...</span>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 text-red-700 border border-red-200 rounded-xl flex gap-3 items-center">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        ) : !focalNode ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-600">Organograma vazio</p>
            <p className="text-xs mt-1">Não há líderes registrados correspondentes aos filtros.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full space-y-4">
            
            {/* 1. ANCESTORS CHAIN (SUPERIORES) */}
            {ancestors.length > 0 && (
              <div className="flex flex-col items-center w-full">
                {ancestors.map((sup) => (
                  <div key={sup.matricula} className="flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-300">
                    <button
                      onClick={() => setFocalMatricula(sup.matricula)}
                      className="group flex items-center gap-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-emerald-300 rounded-xl p-2.5 shadow-sm hover:shadow transition-all w-64 text-left"
                    >
                      <div className="relative shrink-0">
                        {sup.fotoPerfilUrl ? (
                          <img src={sup.fotoPerfilUrl} className="w-8 h-8 rounded-full object-cover border border-slate-100" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200">
                            {getInitials(sup.nomeCompleto)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="font-bold text-slate-800 text-xs truncate group-hover:text-emerald-700 transition-colors">
                          {sup.nomeCompleto}
                        </h5>
                        <p className="text-[10px] text-slate-500 truncate">{sup.tituloCargo || 'Membro'}</p>
                      </div>
                      <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0" />
                    </button>
                    {/* Vertical connector line */}
                    <div className="w-[2px] h-5 bg-slate-300" />
                  </div>
                ))}
              </div>
            )}

            {/* 2. FOCAL NODE (PESSOA EM DESTAQUE) */}
            <div className="flex flex-col items-center w-full animate-in zoom-in-95 duration-300 relative z-10">
              <div className="w-64 sm:w-72 bg-white border-2 border-emerald-500 rounded-2xl p-4 shadow-lg relative overflow-hidden text-center">
                {/* Visual accent top bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
                
                {/* Avatar */}
                <div className="flex justify-center mb-3">
                  {focalNode.fotoPerfilUrl ? (
                    <img
                      src={focalNode.fotoPerfilUrl}
                      className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm ring-4 ring-emerald-500/10"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-base flex items-center justify-center border-2 border-white shadow-sm ring-4 ring-emerald-500/10">
                      {getInitials(focalNode.nomeCompleto)}
                    </div>
                  )}
                </div>

                {/* Name and Role */}
                <h3 className="font-extrabold text-slate-800 text-sm leading-tight truncate px-1" title={focalNode.nomeCompleto}>
                  {focalNode.nomeCompleto}
                </h3>
                <span className="inline-block px-2.5 py-0.5 mt-2 bg-emerald-50 text-emerald-800 border border-emerald-200/50 rounded-full text-[9px] font-bold uppercase tracking-wide">
                  {focalNode.tituloCargo || 'Membro'}
                </span>

                <div className="mt-2 text-[9px] text-slate-400 font-mono">
                  Matrícula: {String(focalNode.matricula).padStart(4, '0')}
                </div>

                {/* Contact options */}
                <div className="flex flex-col gap-2 mt-4 w-full">
                  {focalNode.whatsapp && (
                    <a
                      href={`https://wa.me/55${focalNode.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow hover:-translate-y-0.5 duration-200"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      Falar no WhatsApp
                    </a>
                  )}

                  {onViewMemberDetails && (
                    <button
                      onClick={() => onViewMemberDetails(focalNode.matricula)}
                      className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow hover:-translate-y-0.5 duration-200"
                    >
                      <Users className="h-3.5 w-3.5 text-slate-500" />
                      Ver Cadastro do Membro
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 3. DIRECT REPORTS GRID (LIDERADOS DIRETOS) */}
            <div className="w-full flex flex-col items-center">
              {focalNode.liderados && focalNode.liderados.length > 0 ? (
                <div className="w-full space-y-4 pt-4 animate-in fade-in duration-300">
                  <div className="w-full text-center border-t border-slate-200 pt-6">
                    <h4 className="font-bold text-slate-700 text-xs">
                      Membros sob a coordenação ou liderança de {focalNode.nomeCompleto.split(' ')[0]} ({focalNode.liderados.length})
                    </h4>
                  </div>
                  
                  {/* Fluid / Wrapping Direct Reports Grid */}
                  <div className="flex flex-row flex-wrap gap-4 justify-center items-stretch w-full px-2">
                    {focalNode.liderados.map((child) => (
                      <button
                        key={child.matricula}
                        onClick={() => setFocalMatricula(child.matricula)}
                        className="group relative bg-white hover:bg-slate-50 border border-slate-200 hover:border-emerald-300 rounded-xl p-3.5 shadow-sm hover:shadow transition-all w-60 text-left flex items-start gap-3"
                      >
                        {/* Profile Image / Initials */}
                        <div className="relative shrink-0">
                          {child.fotoPerfilUrl ? (
                            <img src={child.fotoPerfilUrl} className="w-10 h-10 rounded-full object-cover border border-slate-100" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200">
                              {getInitials(child.nomeCompleto)}
                            </div>
                          )}
                        </div>

                        {/* Node details */}
                        <div className="min-w-0 flex-1">
                          <h5 className="font-bold text-slate-800 text-xs truncate group-hover:text-emerald-700 transition-colors">
                            {child.nomeCompleto}
                          </h5>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">{child.tituloCargo || 'Membro'}</p>
                          
                          {/* Children count badge */}
                          {child.liderados && child.liderados.length > 0 && (
                            <span className="inline-flex items-center gap-1 mt-2 px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-semibold">
                              <Users className="h-2.5 w-2.5" />
                              {child.liderados.length} liderados
                            </span>
                          )}
                        </div>
                        
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all self-center shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-sm pt-6">
                  <div className="text-center py-6 bg-white border border-dashed border-slate-200 rounded-2xl shadow-sm">
                    <Award className="h-6 w-6 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-500">Este membro não possui liderados diretos nesta estrutura</p>
                    <p className="text-[10px] text-slate-400 mt-1 px-4 leading-normal">Não há outros membros vinculados sob a coordenação ou mentoria direta desta pessoa.</p>
                  </div>
                </div>
              )}
            </div>
            
          </div>
        )}
      </div>
    </div>
  )
}

