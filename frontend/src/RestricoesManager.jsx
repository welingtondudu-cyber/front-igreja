import { useState, useEffect } from 'react'
import { ShieldAlert, Trash2, Plus, Loader2, AlertCircle, CheckCircle2, User, FileText } from 'lucide-react'

export default function RestricoesManager({ initialVotacaoId, onClose }) {
  const [votacoes, setVotacoes] = useState([])
  const [selectedVotacaoId, setSelectedVotacaoId] = useState(initialVotacaoId || '')
  
  // Restrictions list
  const [restricoes, setRestricoes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Add restriction form
  const [matricula, setMatricula] = useState('')
  const [motivo, setMotivo] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)

  const selectedVotacao = votacoes.find(v => v.id.toString() === selectedVotacaoId.toString())
  const isVotacaoAtiva = selectedVotacao ? selectedVotacao.ativa : false

  // Load elections on mount if not provided
  useEffect(() => {
    async function loadVotacoes() {
      try {
        const response = await fetch('/api/admin/votacoes')
        if (response.ok) {
          const data = await response.json()
          setVotacoes(data)
          if (data.length > 0 && !selectedVotacaoId) {
            setSelectedVotacaoId(data[0].id.toString())
          }
        }
      } catch (err) {
        console.error('Falha ao carregar votações:', err)
      }
    }
    loadVotacoes()
  }, [])

  // Load restrictions when selected election changes
  useEffect(() => {
    if (selectedVotacaoId) {
      fetchRestricoes(selectedVotacaoId)
    } else {
      setRestricoes([])
    }
  }, [selectedVotacaoId])

  const fetchRestricoes = async (votacaoId) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/votacoes/${votacaoId}/restricoes`)
      if (res.ok) {
        const data = await res.json()
        setRestricoes(data)
      } else {
        setError('Não foi possível carregar as restrições desta votação.')
      }
    } catch (err) {
      setError('Erro de conexão ao buscar restrições.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddRestricao = async (e) => {
    e.preventDefault()
    if (!selectedVotacaoId || !matricula.trim() || !motivo.trim()) return

    setSubmitLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch(`/api/admin/votacoes/${selectedVotacaoId}/restricoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matricula: matricula.trim(),
          motivo: motivo.trim()
        })
      })

      if (res.ok) {
        setSuccess('Restrição cadastrada com sucesso!')
        setMatricula('')
        setMotivo('')
        fetchRestricoes(selectedVotacaoId)
      } else {
        const problem = await res.json().catch(() => ({}))
        setError(problem.detail || problem.message || 'Erro ao cadastrar restrição de voto.')
      }
    } catch (err) {
      setError('Falha de conexão com o servidor.')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleDeleteRestricao = async (matriculaMembro) => {
    if (!confirm(`Deseja realmente remover a restrição para a matrícula ${matriculaMembro}?`)) return
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch(`/api/admin/votacoes/${selectedVotacaoId}/restricoes/${matriculaMembro}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setSuccess('Restrição removida com sucesso!')
        fetchRestricoes(selectedVotacaoId)
      } else {
        setError('Não foi possível remover a restrição.')
      }
    } catch (err) {
      setError('Erro ao se conectar para remover a restrição.')
    }
  }

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-red-600" />
            Restrições de Votação
          </h1>
          <p className="text-sm text-slate-500 mt-1">Impedir membros específicos de votar em determinadas eleições.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ADD FORM */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4 h-fit">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Plus className="h-5 w-5 text-emerald-700" />
            <h2 className="text-lg font-bold text-slate-900">Bloquear Eleitor</h2>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 border border-red-200 p-3.5 rounded-xl text-xs flex gap-2 items-start animate-in fade-in duration-200">
              <AlertCircle className="h-4.5 w-4.5 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-3.5 rounded-xl text-xs flex gap-2 items-start animate-in fade-in duration-200">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleAddRestricao} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Eleição Selecionada
              </label>
              <div className="w-full border border-slate-250 bg-slate-50 rounded-xl px-3.5 py-2 text-sm text-slate-800 font-bold">
                {selectedVotacao ? selectedVotacao.titulo : 'Carregando...'}
              </div>
            </div>

            {!isVotacaoAtiva ? (
              <div className="bg-amber-50 text-amber-800 border border-amber-200 p-4 rounded-xl text-xs flex gap-2 items-start mt-2">
                <AlertCircle className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Eleição Encerrada:</span>
                  <p className="mt-0.5 leading-relaxed">Esta eleição já foi encerrada. Não é permitido adicionar ou remover restrições de voto.</p>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Matrícula do Membro *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 0042"
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value.replace(/\D/g, ''))}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-emerald-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Motivo do Bloqueio *
                  </label>
                  <textarea
                    placeholder="Ex: Membro em disciplina / Transferido..."
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    rows={3}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-emerald-600 resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitLoading || !selectedVotacaoId}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2.5 rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5 text-sm"
                >
                  {submitLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Bloquear Membro
                </button>
              </>
            )}
          </form>
        </div>

        {/* RESTRICTION LIST */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="h-5 w-5 text-slate-400" />
            <h2 className="text-lg font-bold text-slate-900">Eleitores Bloqueados</h2>
          </div>

          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 text-emerald-700 animate-spin mb-2" />
              <span className="text-xs text-slate-500 font-medium">Buscando restrições...</span>
            </div>
          ) : restricoes.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <User className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-600 text-sm">Nenhum bloqueio cadastrado</p>
              <p className="text-xs mt-1">Todos os membros aptos podem votar normalmente nesta eleição.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                    <th className="px-4 py-3">Matrícula</th>
                    <th className="px-4 py-3">Membro</th>
                    <th className="px-4 py-3">Motivo</th>
                    {isVotacaoAtiva && <th className="px-4 py-3 text-center">Ações</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {restricoes.map((r) => (
                    <tr key={r.matricula} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-mono text-slate-500 font-semibold">{r.matricula}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{r.nomeMembro}</td>
                      <td className="px-4 py-3 text-slate-600">{r.motivo}</td>
                      {isVotacaoAtiva && (
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleDeleteRestricao(r.matricula)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remover Bloqueio"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
