import { useState, useEffect } from 'react'
import { Plus, ChevronRight, FileText, Calendar, Loader2, Play, Pencil } from 'lucide-react'
import CadastroEleicao from './CadastroEleicao'
import RestricoesManager from './RestricoesManager'

export default function EleicoesManager({ onNavigate }) {
  const [eleicoes, setEleicoes] = useState([])
  const [loading, setLoading] = useState(false)
  const [viewState, setViewState] = useState('list') // 'list', 'create', 'edit'
  const [selectedEleicao, setSelectedEleicao] = useState(null)

  useEffect(() => {
    if (viewState === 'list') {
      fetchEleicoes()
    }
  }, [viewState])

  const fetchEleicoes = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/votacoes')
      if (res.ok) {
        const data = await res.json()
        setEleicoes(data)
      }
    } catch (err) {
      console.error('Erro ao buscar eleições', err)
    } finally {
      setLoading(false)
    }
  }

  if (viewState === 'create') {
    return (
      <CadastroEleicao onBack={() => setViewState('list')} />
    )
  }

  if (viewState === 'edit-votacao' && selectedEleicao) {
    return (
      <CadastroEleicao editingVotacao={selectedEleicao} onBack={() => setViewState('list')} />
    )
  }

  if (viewState === 'edit' && selectedEleicao) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 bg-white p-4 border border-slate-200 rounded-2xl shadow-sm">
          <button 
            onClick={() => setViewState('list')}
            className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-600 focus:outline-none border border-slate-200"
          >
            <ChevronRight className="h-5 w-5 rotate-180" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{selectedEleicao.titulo}</h2>
            <p className="text-xs text-slate-500">Gerenciar restrições de voto</p>
          </div>
        </div>
        <RestricoesManager initialVotacaoId={selectedEleicao.id} onClose={() => setViewState('list')} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gerenciar Eleições</h1>
          <p className="text-sm text-slate-500 mt-1">Consulte, cadastre e gerencie assembleias e eleições da igreja.</p>
        </div>
        <button
          onClick={() => setViewState('create')}
          className="flex items-center justify-center h-10 w-10 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl transition-all shadow-sm shrink-0"
          title="Cadastrar Eleição"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        {loading ? (
           <div className="flex flex-col items-center justify-center py-12 text-slate-500">
             <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-4" />
             Carregando eleições...
           </div>
        ) : eleicoes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 rounded-tl-xl">Nome da Eleição</th>
                  <th className="px-6 py-4">Data de Encerramento</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 rounded-tr-xl">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {eleicoes.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-emerald-600" />
                      {e.titulo}
                    </td>
                    <td className="px-6 py-4">
                      {e.dataEncerramento ? new Date(e.dataEncerramento).toLocaleDateString('pt-BR') : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${e.ativa ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                        {e.ativa ? 'ATIVA' : 'ENCERRADA'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedEleicao(e)
                              setViewState('edit-votacao')
                            }}
                            className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all"
                            title="Editar Eleição"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedEleicao(e)
                              setViewState('edit')
                            }}
                            className="text-xs px-3 py-1.5 bg-amber-100 text-amber-800 hover:bg-amber-200 rounded-lg font-bold transition-colors"
                          >
                            Restrições
                          </button>
                        <button
                          onClick={() => {
                            localStorage.setItem('selectedVotacaoId', e.id.toString())
                            if (onNavigate) onNavigate('apuracao')
                          }}
                          className="flex items-center gap-1 text-xs px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg font-bold transition-colors"
                        >
                          <Play className="h-3 w-3" />
                          Apuração
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-500 font-medium">Nenhuma eleição encontrada.</p>
          </div>
        )}
      </div>
    </div>
  )
}
