import { useState, useCallback } from 'react'
import {
  ChevronLeft, Plus, Trash2, Loader2, CheckCircle2,
  AlertCircle, UserCheck, FileText, Settings
} from 'lucide-react'

function CadastroEleicao({ onBack }) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)

  // Dados principais da eleição
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [limiteVotos, setLimiteVotos] = useState(1)

  // Lista de opções/candidatos
  const [opcoes, setOpcoes] = useState([
    { tituloOpcao: '', membroId: '', membroNome: '', loadingMembro: false, membroErro: '' }
  ])

  // Busca o nome do membro pelo ID digitado
  const fetchMembroNome = useCallback(async (index, id) => {
    if (!id || isNaN(Number(id))) {
      setOpcoes(prev => prev.map((op, i) =>
        i === index ? { ...op, membroNome: '', membroErro: '', tituloOpcao: '' } : op
      ))
      return
    }

    setOpcoes(prev => prev.map((op, i) =>
      i === index ? { ...op, loadingMembro: true, membroErro: '', membroNome: '' } : op
    ))

    try {
      const res = await fetch(`/api/membros/${id}`)
      if (res.ok) {
        const data = await res.json()
        const nome = data.nomeCompleto || data.nome || ''
        setOpcoes(prev => prev.map((op, i) =>
          i === index
            ? { ...op, membroNome: nome, tituloOpcao: nome, loadingMembro: false, membroErro: '' }
            : op
        ))
      } else {
        setOpcoes(prev => prev.map((op, i) =>
          i === index
            ? { ...op, membroNome: '', tituloOpcao: '', loadingMembro: false, membroErro: 'Membro não encontrado' }
            : op
        ))
      }
    } catch {
      setOpcoes(prev => prev.map((op, i) =>
        i === index
          ? { ...op, membroNome: '', loadingMembro: false, membroErro: 'Erro ao buscar membro' }
          : op
      ))
    }
  }, [])

  const handleMembroIdChange = (index, value) => {
    const raw = value.replace(/\D/g, '')
    setOpcoes(prev => prev.map((op, i) =>
      i === index ? { ...op, membroId: raw } : op
    ))
  }

  const handleMembroIdBlur = (index) => {
    const id = opcoes[index].membroId
    fetchMembroNome(index, id)
  }

  const handleTituloOpcaoChange = (index, value) => {
    setOpcoes(prev => prev.map((op, i) =>
      i === index ? { ...op, tituloOpcao: value } : op
    ))
  }

  const addOpcao = () => {
    setOpcoes(prev => [...prev, { tituloOpcao: '', membroId: '', membroNome: '', loadingMembro: false, membroErro: '' }])
  }

  const removeOpcao = (index) => {
    if (opcoes.length === 1) return
    setOpcoes(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validações básicas
    for (const op of opcoes) {
      if (!op.tituloOpcao.trim()) {
        setError('Todas as opções devem ter um título ou ID de membro válido.')
        return
      }
      if (op.membroId && op.membroErro) {
        setError('Corrija os erros nos campos de membro antes de continuar.')
        return
      }
    }

    setLoading(true)

    const payload = {
      titulo,
      descricao: descricao || null,
      limiteVotos: Number(limiteVotos),
      opcoes: opcoes.map(op => ({
        tituloOpcao: op.tituloOpcao.trim(),
        membroId: op.membroId ? Number(op.membroId) : null
      }))
    }

    try {
      const res = await fetch('/api/admin/votacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        const id = await res.json()
        setSuccess(`Eleição cadastrada com sucesso! ID: ${id}`)
        // Reset form
        setTitulo('')
        setDescricao('')
        setLimiteVotos(1)
        setOpcoes([{ tituloOpcao: '', membroId: '', membroNome: '', loadingMembro: false, membroErro: '' }])
      } else {
        const problem = await res.json().catch(() => ({}))
        setError(problem.detail || problem.message || 'Erro ao cadastrar eleição.')
      }
    } catch {
      setError('Falha de conexão com o servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 flex justify-between items-center w-full px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-700 focus:outline-none"
            title="Voltar"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <img
            src="/logo.png"
            alt="Logotipo Oficial da Igreja"
            className="h-10 w-auto max-w-[150px] object-contain"
          />
        </div>
        <div className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full uppercase tracking-wider">
          Cadastro de Eleição
        </div>
      </header>

      <main className="flex-grow max-w-2xl w-full mx-auto p-4 sm:p-6 space-y-6">

        {/* Feedback */}
        {success && (
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-4 rounded-xl text-sm flex gap-3 items-start">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <span className="font-semibold">{success}</span>
          </div>
        )}
        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-xl text-sm flex gap-3 items-start">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* DADOS PRINCIPAIS */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <FileText className="h-5 w-5 text-emerald-700" />
              <h2 className="text-lg font-bold text-slate-900">Dados da Eleição</h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Título *
              </label>
              <input
                type="text"
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                placeholder="Ex: Eleição de Diáconos 2026"
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm bg-white text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Descrição
              </label>
              <textarea
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
                placeholder="Descrição opcional da pauta..."
                rows={3}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm bg-white text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                <Settings className="inline h-3.5 w-3.5 mr-1" />
                Limite de Votos por Eleitor
              </label>
              <input
                type="number"
                value={limiteVotos}
                onChange={e => setLimiteVotos(Math.max(1, Number(e.target.value)))}
                min={1}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm bg-white text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors"
              />
              <p className="text-xs text-slate-400 mt-1">
                1 = escolha única (radio). Maior que 1 = múltipla escolha (checkbox).
              </p>
            </div>
          </div>

          {/* OPÇÕES / CANDIDATOS */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-emerald-700" />
                <h2 className="text-lg font-bold text-slate-900">Opções / Candidatos</h2>
              </div>
              <button
                type="button"
                onClick={addOpcao}
                className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Adicionar Opção
              </button>
            </div>

            <div className="space-y-4">
              {opcoes.map((opcao, index) => (
                <div key={index} className="border border-slate-200 rounded-xl p-4 space-y-3 relative bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Opção {index + 1}
                    </span>
                    {opcoes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeOpcao(index)}
                        className="text-red-400 hover:text-red-600 transition-colors p-1 rounded"
                        title="Remover opção"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* ID do Membro */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      ID do Membro <span className="text-slate-400 font-normal normal-case">(opcional)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={opcao.membroId}
                        onChange={e => handleMembroIdChange(index, e.target.value)}
                        onBlur={() => handleMembroIdBlur(index)}
                        placeholder="Ex: 42"
                        className={`w-full border rounded-xl px-3.5 py-2.5 text-sm bg-white text-slate-800 focus:outline-none focus:ring-1 transition-colors pr-10 ${
                          opcao.membroErro
                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                            : opcao.membroNome
                            ? 'border-emerald-500 focus:border-emerald-600 focus:ring-emerald-600'
                            : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-600'
                        }`}
                      />
                      {opcao.loadingMembro && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 animate-spin" />
                      )}
                      {!opcao.loadingMembro && opcao.membroNome && (
                        <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600" />
                      )}
                    </div>
                    {opcao.membroErro && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {opcao.membroErro}
                      </p>
                    )}
                    {opcao.membroNome && !opcao.membroErro && (
                      <p className="text-xs text-emerald-700 mt-1 flex items-center gap-1 font-medium">
                        <UserCheck className="h-3.5 w-3.5" />
                        Membro encontrado: <strong>{opcao.membroNome}</strong>
                      </p>
                    )}
                  </div>

                  {/* Título da Opção */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Título da Opção *
                      {opcao.membroNome && (
                        <span className="ml-2 text-emerald-600 font-normal normal-case">
                          (preenchido automaticamente pelo nome do membro)
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={opcao.tituloOpcao}
                      onChange={e => handleTituloOpcaoChange(index, e.target.value)}
                      placeholder={opcao.membroId ? 'Aguardando busca do membro...' : 'Ex: Chapa A — Renovação'}
                      className={`w-full border rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-1 transition-colors ${
                        opcao.membroNome
                          ? 'bg-emerald-50 border-emerald-300 focus:border-emerald-600 focus:ring-emerald-600 font-medium text-emerald-800'
                          : 'bg-white border-slate-300 focus:border-emerald-600 focus:ring-emerald-600'
                      }`}
                      required
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      {opcao.membroId
                        ? 'O nome do membro será salvo como título ao confirmar, substituindo qualquer texto acima.'
                        : 'Sem membro vinculado, o texto acima será usado como título da opção.'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-700 text-white font-semibold py-3.5 px-4 rounded-xl hover:bg-emerald-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Cadastrando Eleição...
              </>
            ) : (
              'CADASTRAR ELEIÇÃO'
            )}
          </button>
        </form>
      </main>

      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-center text-xs text-slate-400">
        <p className="font-semibold text-slate-500">Igreja Presbiteriana dos Ipês</p>
        <p className="mt-1">Sistema Integrado de Gestão e Apuração de Assembleias © 2026</p>
      </footer>
    </div>
  )
}

export default CadastroEleicao
