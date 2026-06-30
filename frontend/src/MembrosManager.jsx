import { useState, useEffect, useMemo } from 'react'
import {
  Search, Plus, Download, Upload, Info, Edit, UserMinus, Phone,
  X, Check, AlertCircle, Loader2, Filter, ChevronDown, ChevronUp,
  User, Mail, Calendar, Hash, MapPin, Award, CheckCircle2, RefreshCw,
  UserCheck, Users, Trash2
} from 'lucide-react'

const WhatsAppIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" {...props}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

export default function MembrosManager({ onViewOrganograma, initialMemberMatricula, onCloseInitialMember }) {
  // Members List State
  const [members, setMembers] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Sorting State
  const [sortField, setSortField] = useState('nomeCompleto')
  const [sortDirection, setSortDirection] = useState('asc')

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Filters State
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [filterNome, setFilterNome] = useState('')
  const [filterMatricula, setFilterMatricula] = useState('')
  const [filterGrupoId, setFilterGrupoId] = useState('')
  const [filterCpf, setFilterCpf] = useState('')
  const [filterLiderId, setFilterLiderId] = useState('')
  const [filterAnoDe, setFilterAnoDe] = useState('')
  const [filterAnoAte, setFilterAnoAte] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCargoId, setFilterCargoId] = useState('')

  // Groups and Leaders lists for selects
  const [grupos, setGrupos] = useState([])
  const [lideres, setLideres] = useState([])

  // Modal States
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)

  // Member Details Sub-Tabs and History
  const [activeDetailTab, setActiveDetailTab] = useState('cadastro')
  const [memberHistory, setMemberHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const [showImportModal, setShowImportModal] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [importStatus, setImportStatus] = useState(null) // null | 'success' | 'error'
  const [importMessage, setImportMessage] = useState('')
  const [importLoading, setImportLoading] = useState(false)

  // Wizard / Add / Edit States
  const [showWizard, setShowWizard] = useState(false)
  const [wizardStep, setWizardStep] = useState(1) // 1: CPF check, 2: Form edit/create
  const [wizardCpf, setWizardCpf] = useState('')
  const [wizardMode, setWizardMode] = useState('add') // 'add' | 'edit'
  const [wizardLoading, setWizardLoading] = useState(false)
  const [wizardError, setWizardError] = useState(null)

  // Form Fields State
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    cpf: '',
    rg: '',
    whatsapp: '',
    email: '',
    fotoPerfilUrl: '',
    statusCadastro: 'Ativo',
    dataAdesao: '',
    dataNascimento: '',
    sexo: 'Masculino',
    cargoId: '',
    liderDiretoId: '',
    ministeriosIds: [],
    pequenosGruposIds: []
  })

  // Selected tab in wizard step 2
  const [wizardTab, setWizardTab] = useState('pessoais') // 'pessoais' | 'contato' | 'eclesiasticos'

  // Convidado Modal States
  const [showConvidadoModal, setShowConvidadoModal] = useState(false)
  const [convidadoLoading, setConvidadoLoading] = useState(false)
  const [convidadoError, setConvidadoError] = useState(null)
  const [convidadoFormData, setConvidadoFormData] = useState({
    nomeCompleto: '',
    whatsapp: '',
    dataNascimento: '',
    observacao: ''
  })

  // Load lists on mount
  useEffect(() => {
    fetchGrupos()
    fetchLideres()
  }, [])

  // Fetch members when filters or page change
  useEffect(() => {
    fetchMembers()
  }, [currentPage, filterGrupoId, filterLiderId, filterStatus, filterCargoId])

  // Se recebermos uma matricula inicial (vindo do Organograma), carrega o detalhe do membro
  useEffect(() => {
    if (initialMemberMatricula) {
      const fetchInitialMember = async () => {
        try {
          const res = await fetch(`/api/membros/${initialMemberMatricula}`)
          if (res.ok) {
            const data = await res.json()
            setSelectedMember(data)
            setShowDetailModal(true)
          }
        } catch (err) {
          console.error('Erro ao carregar detalhes do membro inicial:', err)
        }
      }
      fetchInitialMember()
    }
  }, [initialMemberMatricula])

  // Limpa a matricula inicial no componente pai ao fechar a modal de detalhes
  useEffect(() => {
    if (!showDetailModal && onCloseInitialMember) {
      onCloseInitialMember()
    }
  }, [showDetailModal, onCloseInitialMember])

  const fetchGrupos = async () => {
    try {
      const res = await fetch('/api/grupos')
      if (res.ok) {
        const data = await res.json()
        setGrupos(data)
      }
    } catch (err) {
      console.error('Erro ao buscar grupos:', err)
    }
  }

  const fetchLideres = async () => {
    try {
      // Fetch active members to serve as direct leaders
      const res = await fetch('/api/membros?size=1000&statusCadastro=Ativo')
      if (res.ok) {
        const data = await res.json()
        setLideres(data.content || [])
      }
    } catch (err) {
      console.error('Erro ao buscar líderes:', err)
    }
  }

  const fetchMembers = async () => {
    setLoading(true)
    setError(null)

    let url = `/api/membros?page=${currentPage}&size=8`
    if (filterNome) url += `&nome=${encodeURIComponent(filterNome)}`
    if (filterMatricula) {
      // Convert matricula back to ID for filtering (as the search field matches standard ID parameter)
      const parsedId = parseInt(filterMatricula, 10)
      if (!isNaN(parsedId)) {
        url += `&nome=${encodeURIComponent(filterMatricula)}` // matches matricula or name in search
      }
    }
    if (filterGrupoId) url += `&grupoId=${filterGrupoId}`
    if (filterCpf) url += `&cpf=${filterCpf.replace(/\D/g, '')}`
    if (filterLiderId) url += `&liderDiretoId=${filterLiderId}`
    if (filterStatus) url += `&statusCadastro=${filterStatus}`
    if (filterCargoId) url += `&cargoId=${filterCargoId}`

    // Parse Birth Year Range
    if (filterAnoDe) {
      url += `&nascimentoDe=${filterAnoDe}-01-01`
    }
    if (filterAnoAte) {
      url += `&nascimentoAte=${filterAnoAte}-12-31`
    }

    try {
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setMembers(data.content || [])
        setTotalPages(data.totalPages || 0)
        setTotalElements(data.totalElements || 0)
      } else {
        setError('Erro ao carregar lista de membros.')
      }
    } catch (err) {
      setError('Falha de conexão com o servidor.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setCurrentPage(0)
    fetchMembers()
  }

  const handleClearFilters = () => {
    setFilterNome('')
    setFilterMatricula('')
    setFilterGrupoId('')
    setFilterCpf('')
    setFilterLiderId('')
    setFilterAnoDe('')
    setFilterAnoAte('')
    setFilterStatus('')
    setFilterCargoId('')
    setCurrentPage(0)
    // We delay fetch using setTimeout or rely on state trigger, let's call fetch explicitly
    setTimeout(() => fetchMembers(), 50)
  }

  // Formatting Helpers
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    try {
      const clean = dateStr.split('T')[0]
      const parts = clean.split('-')
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`
      }
    } catch (e) {}
    return dateStr
  }

  const formatCPF = (val) => {
    if (!val) return ''
    const rawVal = val.replace(/\D/g, '').slice(0, 11)
    let formatted = rawVal
    if (rawVal.length > 9) {
      formatted = `${rawVal.slice(0, 3)}.${rawVal.slice(3, 6)}.${rawVal.slice(6, 9)}-${rawVal.slice(9)}`
    } else if (rawVal.length > 6) {
      formatted = `${rawVal.slice(0, 3)}.${rawVal.slice(3, 6)}.${rawVal.slice(6)}`
    } else if (rawVal.length > 3) {
      formatted = `${rawVal.slice(0, 3)}.${rawVal.slice(3)}`
    }
    return formatted
  }

  const formatWhatsapp = (val) => {
    if (!val) return ''
    const rawVal = val.replace(/\D/g, '').slice(0, 11)
    if (rawVal.length <= 2) {
      return rawVal.length > 0 ? `(${rawVal}` : ''
    }
    if (rawVal.length <= 6) {
      return `(${rawVal.slice(0, 2)}) ${rawVal.slice(2)}`
    }
    if (rawVal.length <= 10) {
      return `(${rawVal.slice(0, 2)}) ${rawVal.slice(2, 6)}-${rawVal.slice(6)}`
    }
    return `(${rawVal.slice(0, 2)}) ${rawVal.slice(2, 7)}-${rawVal.slice(7)}`
  }

  const getInitials = (name) => {
    if (!name) return '?'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return parts[0].slice(0, 2).toUpperCase()
  }

  const handleExportCSV = () => {
    let url = `/api/membros/exportar/csv?`
    if (filterNome) url += `&nome=${encodeURIComponent(filterNome)}`
    if (filterGrupoId) url += `&grupoId=${filterGrupoId}`
    if (filterCpf) url += `&cpf=${filterCpf.replace(/\D/g, '')}`
    if (filterLiderId) url += `&liderDiretoId=${filterLiderId}`
    if (filterStatus) url += `&statusCadastro=${filterStatus}`
    if (filterAnoDe) url += `&nascimentoDe=${filterAnoDe}-01-01`
    if (filterAnoAte) url += `&nascimentoAte=${filterAnoAte}-12-31`

    // Trigger Download
    window.location.href = url
  }

  const handleImportCSV = async (e) => {
    e.preventDefault()
    if (!importFile) return

    setImportLoading(true)
    setImportStatus(null)
    setImportMessage('')

    const formData = new FormData()
    formData.append('file', importFile)

    try {
      const res = await fetch('/api/membros/importar/csv', {
        method: 'POST',
        body: formData
      })

      if (res.ok) {
        const data = await res.json()
        setImportStatus('success')
        setImportMessage(data.mensagem || 'Membros importados com sucesso!')
        fetchMembers()
      } else {
        const problem = await res.json().catch(() => ({}))
        setImportStatus('error')
        setImportMessage(problem.detail || problem.message || 'Erro no processamento do arquivo CSV. Verifique o formato das linhas.')
      }
    } catch (err) {
      setImportStatus('error')
      setImportMessage('Falha ao conectar com o servidor para importação.')
    } finally {
      setImportLoading(false)
    }
  }

  // Lupa Detail Click
  const handleOpenDetail = async (matricula) => {
    try {
      const res = await fetch(`/api/membros/${matricula}`)
      if (res.ok) {
        const data = await res.json()
        setSelectedMember(data)
        setActiveDetailTab('cadastro')
        setMemberHistory([])
        setShowDetailModal(true)
        fetchMemberHistory(matricula)
      }
    } catch (err) {
      alert('Erro ao buscar detalhes do membro')
    }
  }

  const fetchMemberHistory = async (matricula) => {
    setLoadingHistory(true)
    try {
      const res = await fetch(`/api/membros/${matricula}/historico`)
      if (res.ok) {
        const data = await res.json()
        setMemberHistory(data)
      }
    } catch (err) {
      console.error('Erro ao buscar histórico do membro', err)
    } finally {
      setLoadingHistory(false)
    }
  }

  // CPF check step
  const handleWizardCpfSubmit = async (e) => {
    e.preventDefault()
    const cleanCpf = wizardCpf.replace(/\D/g, '')
    if (cleanCpf.length !== 11) {
      setWizardError('Por favor, informe um CPF válido.')
      return
    }

    setWizardLoading(true)
    setWizardError(null)

    try {
      // Check if CPF exists
      const res = await fetch(`/api/membros?cpf=${cleanCpf}`)
      if (res.ok) {
        const pageData = await res.json()
        if (pageData.content && pageData.content.length > 0) {
          // Exists! Load full entity for edit
          const shortMember = pageData.content[0]
          const fullRes = await fetch(`/api/membros/${shortMember.matricula}`)
          if (fullRes.ok) {
            const detail = await fullRes.json()
            setWizardMode('edit')
            setFormData({
              matricula: detail.matricula,
              nomeCompleto: detail.nomeCompleto || '',
              cpf: formatCPF(detail.cpf || ''),
              rg: detail.rg || '',
              whatsapp: formatWhatsapp(detail.whatsapp || ''),
              email: detail.email || '',
              fotoPerfilUrl: detail.fotoPerfilUrl || '',
              statusCadastro: detail.statusCadastro || 'Ativo',
              dataAdesao: detail.dataAdesao || '',
              dataNascimento: detail.dataNascimento || '',
              sexo: detail.sexo || 'Masculino',
              cargoId: detail.cargoId ? String(detail.cargoId) : '',
              liderDiretoId: detail.liderDiretoId ? String(detail.liderDiretoId) : '',
              ministeriosIds: detail.ministeriosIds || [],
              pequenosGruposIds: detail.pequenosGruposIds || [],
              observacao: detail.observacao || ''
            })
            setWizardStep(2)
          } else {
            setWizardError('Erro ao buscar dados do membro existente.')
          }
        } else {
          // Doesn't exist, proceed as clean creation
          setWizardMode('add')
          setFormData({
            nomeCompleto: '',
            cpf: formatCPF(cleanCpf),
            whatsapp: '',
            email: '',
            fotoPerfilUrl: '',
            statusCadastro: 'Ativo',
            dataAdesao: new Date().toISOString().split('T')[0],
            dataNascimento: '',
            sexo: 'Masculino',
            cargoId: '',
            liderDiretoId: '',
            ministeriosIds: [],
            pequenosGruposIds: [],
            observacao: ''
          })
          setWizardStep(2)
        }
      } else {
        setWizardError('Erro ao conectar com servidor.')
      }
    } catch (err) {
      setWizardError('Erro na verificação de CPF.')
    } finally {
      setWizardLoading(false)
    }
  }

  const handleToggleMinisterio = (id) => {
    const ids = formData.ministeriosIds || []
    if (ids.includes(id)) {
      setFormData({ ...formData, ministeriosIds: ids.filter(x => x !== id) })
    } else {
      setFormData({ ...formData, ministeriosIds: [...ids, id] })
    }
  }

  const handleTogglePequenoGrupo = (id) => {
    const ids = formData.pequenosGruposIds || []
    if (ids.includes(id)) {
      setFormData({ ...formData, pequenosGruposIds: ids.filter(x => x !== id) })
    } else {
      setFormData({ ...formData, pequenosGruposIds: [...ids, id] })
    }
  }

  // Submit add/edit
  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setWizardLoading(true)
    setWizardError(null)

    const payload = {
      ...formData,
      cpf: formData.cpf.replace(/\D/g, ''),
      whatsapp: formData.whatsapp.replace(/\D/g, ''),
      cargoId: formData.cargoId ? parseInt(formData.cargoId) : null,
      liderDiretoId: formData.liderDiretoId ? parseInt(formData.liderDiretoId) : null,
      dataAdesao: formData.dataAdesao || null,
      dataNascimento: formData.dataNascimento || null,
      observacao: formData.observacao || null
    }

    try {
      const url = wizardMode === 'edit' ? `/api/membros/${formData.matricula}` : '/api/membros'
      const method = wizardMode === 'edit' ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        setShowWizard(false)
        fetchMembers()
      } else {
        const problem = await res.json().catch(() => ({}))
        setWizardError(problem.detail || problem.message || 'Erro ao salvar cadastro.')
      }
    } catch (err) {
      setWizardError('Falha ao conectar com o servidor.')
    } finally {
      setWizardLoading(false)
    }
  }

  const handleConvidadoSubmit = async (e) => {
    e.preventDefault()
    if (!convidadoFormData.nomeCompleto || !convidadoFormData.whatsapp) {
      setConvidadoError('Nome completo e WhatsApp são obrigatórios.')
      return
    }

    setConvidadoLoading(true)
    setConvidadoError(null)

    const payload = {
      nomeCompleto: convidadoFormData.nomeCompleto,
      whatsapp: convidadoFormData.whatsapp.replace(/\D/g, ''),
      dataNascimento: convidadoFormData.dataNascimento || null,
      observacao: convidadoFormData.observacao || null,
      cpf: null,
      statusCadastro: 'Ativo',
      cargoId: 4, // Visitante/Convidado
      dataAdesao: new Date().toISOString().split('T')[0],
      sexo: 'Masculino', // default required field or empty
      fotoPerfilUrl: '',
      ministeriosIds: [],
      pequenosGruposIds: []
    }

    try {
      const res = await fetch('/api/membros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        setShowConvidadoModal(false)
        fetchMembers()
      } else {
        const problem = await res.json().catch(() => ({}))
        setConvidadoError(problem.detail || problem.message || 'Erro ao cadastrar convidado.')
      }
    } catch (err) {
      setConvidadoError('Falha ao conectar com o servidor.')
    } finally {
      setConvidadoLoading(false)
    }
  }

  const handleToggleStatus = async (matricula, newStatus) => {
    const actionLabel = newStatus.toUpperCase() === 'ATIVO' ? 'ativar' : 'inativar'
    if (!confirm(`Deseja realmente ${actionLabel} este membro?`)) return
    try {
      // Fetch complete details to update status
      const detailRes = await fetch(`/api/membros/${matricula}`)
      if (detailRes.ok) {
        const detail = await detailRes.json()
        const payload = {
          ...detail,
          statusCadastro: newStatus,
          cargoId: detail.cargoId || null,
          liderDiretoId: detail.liderDiretoId || null
        }
        const res = await fetch(`/api/membros/${matricula}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        if (res.ok) {
          setShowDetailModal(false)
          fetchMembers()
        } else {
          alert(`Erro ao ${actionLabel} membro.`)
        }
      }
    } catch (err) {
      console.error(err)
      alert('Falha ao conectar com o servidor.')
    }
  }

  const triggerEditFromDetail = () => {
    if (!selectedMember) return
    setShowDetailModal(false)
    setWizardMode('edit')
    setFormData({
      matricula: selectedMember.matricula,
      nomeCompleto: selectedMember.nomeCompleto || '',
      cpf: formatCPF(selectedMember.cpf || ''),
      whatsapp: formatWhatsapp(selectedMember.whatsapp || ''),
      email: selectedMember.email || '',
      fotoPerfilUrl: selectedMember.fotoPerfilUrl || '',
      statusCadastro: selectedMember.statusCadastro || 'Ativo',
      dataAdesao: selectedMember.dataAdesao || '',
      dataNascimento: selectedMember.dataNascimento || '',
      sexo: selectedMember.sexo || 'Masculino',
      cargoId: selectedMember.cargoId ? String(selectedMember.cargoId) : '',
      liderDiretoId: selectedMember.liderDiretoId ? String(selectedMember.liderDiretoId) : '',
      ministeriosIds: selectedMember.ministeriosIds || [],
      pequenosGruposIds: selectedMember.pequenosGruposIds || [],
      observacao: selectedMember.observacao || ''
    })
    setWizardCpf(selectedMember.cpf || '')
    setWizardStep(2)
    setShowWizard(true)
  }

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestão de Membros</h1>
          <p className="text-sm text-slate-500 mt-1">Consulte, cadastre e gerencie a base oficial de membros da igreja.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              setWizardCpf('')
              setWizardStep(1)
              setWizardError(null)
              setShowWizard(true)
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2 px-4 rounded-xl transition-colors shadow-sm text-sm flex-1 sm:flex-none"
          >
            <Plus className="h-4.5 w-4.5" />
            Adicionar Membro
          </button>
          <button
            onClick={() => {
              setConvidadoFormData({
                nomeCompleto: '',
                whatsapp: '',
                dataNascimento: '',
                observacao: ''
              })
              setConvidadoError(null)
              setShowConvidadoModal(true)
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-xl transition-colors shadow-sm text-sm flex-1 sm:flex-none"
          >
            <Plus className="h-4.5 w-4.5" />
            Adicionar Convidado
          </button>
          <button
            onClick={() => {
              setImportFile(null)
              setImportStatus(null)
              setImportMessage('')
              setShowImportModal(true)}
            }
            className="w-full sm:w-auto flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold py-2 px-4 rounded-xl transition-colors text-sm"
          >
            <Upload className="h-4.5 w-4.5" />
            Importar CSV
          </button>
          <button
            onClick={handleExportCSV}
            className="w-full sm:w-auto flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold py-2 px-4 rounded-xl transition-colors text-sm"
          >
            <Download className="h-4.5 w-4.5" />
            Exportar
          </button>
        </div>
      </div>

      {/* FILTER PANEL */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Nome do Membro
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar por nome..."
                  value={filterNome}
                  onChange={(e) => setFilterNome(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Matrícula
              </label>
              <input
                type="text"
                placeholder="Ex: 0021"
                value={filterMatricula}
                onChange={(e) => setFilterMatricula(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Ministério / Sociedade Interna
              </label>
              <select
                value={filterGrupoId}
                onChange={(e) => setFilterGrupoId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white"
              >
                <option value="">Todos os Grupos</option>
                {grupos.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nomeGrupo} ({g.tipoGrupo === 'MINISTERIO' ? 'Ministério' : 'Soc. Interna'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ADVANCED FILTER TOGGLE */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-widest"
            >
              <Filter className="h-3.5 w-3.5" />
              {showAdvancedFilters ? 'Ocultar Filtros' : 'Mais Filtros'}
              {showAdvancedFilters ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors bg-slate-50 hover:bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200"
              >
                Limpar
              </button>
              <button
                type="submit"
                className="text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors px-4 py-2 rounded-xl shadow-sm flex items-center gap-1"
              >
                Filtrar
              </button>
            </div>
          </div>

          {/* ADVANCED FILTER PANEL */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t border-slate-100 pt-4 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  CPF
                </label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={filterCpf}
                  onChange={(e) => setFilterCpf(formatCPF(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Matrícula do Líder
                </label>
                <input
                  type="text"
                  placeholder="Ex: 0001"
                  value={filterLiderId}
                  onChange={(e) => setFilterLiderId(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Ano Nascimento (De)
                </label>
                <input
                  type="number"
                  placeholder="Ex: 1980"
                  value={filterAnoDe}
                  onChange={(e) => setFilterAnoDe(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Ano Nascimento (Até)
                </label>
                <input
                  type="number"
                  placeholder="Ex: 2000"
                  value={filterAnoAte}
                  onChange={(e) => setFilterAnoAte(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Status Cadastro
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white"
                >
                  <option value="">Todos</option>
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Cargo / Função
                </label>
                <select
                  value={filterCargoId}
                  onChange={(e) => setFilterCargoId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white"
                >
                  <option value="">Todos os Cargos</option>
                  <option value="1">Pastor</option>
                  <option value="2">Presbítero</option>
                  <option value="3">Membro</option>
                  <option value="4">Visitante</option>
                </select>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* MEMBER LIST TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 text-emerald-700 animate-spin mb-2" />
            <span className="text-sm font-medium text-slate-600">Carregando membros...</span>
          </div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center">
            <User className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800">Nenhum membro encontrado</h3>
            <p className="text-sm text-slate-400 mt-1">Refine seus filtros e faça uma nova pesquisa.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-100 select-none">
                  <th onClick={() => handleSort('matricula')} className="px-6 py-4 cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition-colors">
                    <span className="flex items-center gap-1">
                      Matrícula {sortField === 'matricula' && (sortDirection === 'asc' ? '▲' : '▼')}
                    </span>
                  </th>
                  <th onClick={() => handleSort('nomeCompleto')} className="px-6 py-4 cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition-colors">
                    <span className="flex items-center gap-1">
                      Nome {sortField === 'nomeCompleto' && (sortDirection === 'asc' ? '▲' : '▼')}
                    </span>
                  </th>
                  <th onClick={() => handleSort('tituloCargo')} className="px-6 py-4 cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition-colors">
                    <span className="flex items-center gap-1">
                      Cargo / Função {sortField === 'tituloCargo' && (sortDirection === 'asc' ? '▲' : '▼')}
                    </span>
                  </th>
                  <th onClick={() => handleSort('statusCadastro')} className="px-6 py-4 cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition-colors">
                    <span className="flex items-center gap-1">
                      Status {sortField === 'statusCadastro' && (sortDirection === 'asc' ? '▲' : '▼')}
                    </span>
                  </th>
                  <th className="px-6 py-4 text-center">Contato</th>
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {(() => {
                  const sortedMembers = [...members].sort((a, b) => {
                    let aVal = a[sortField] || ''
                    let bVal = b[sortField] || ''

                    if (typeof aVal === 'string') {
                      aVal = aVal.toLowerCase()
                      bVal = bVal.toLowerCase()
                    }

                    if (sortField === 'matricula') {
                      aVal = Number(aVal)
                      bVal = Number(bVal)
                    }

                    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
                    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
                    return 0
                  })

                  return sortedMembers.map((member) => (
                    <tr key={member.matricula} className="hover:bg-slate-50/55 transition-colors">
                    <td className="px-6 py-4 font-mono font-semibold text-slate-500">
                      {member.matricula}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {member.fotoPerfilUrl ? (
                          <img
                            src={member.fotoPerfilUrl}
                            alt={member.nomeCompleto}
                            className="w-9 h-9 rounded-full object-cover border border-slate-100 shrink-0"
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                          />
                        ) : null}
                        <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0" style={{ display: member.fotoPerfilUrl ? 'none' : 'flex' }}>
                          {getInitials(member.nomeCompleto)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 leading-tight">{member.nomeCompleto}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{member.email || 'Sem e-mail'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600">
                      {member.tituloCargo || 'Membro'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        member.statusCadastro?.toUpperCase() === 'ATIVO'
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : 'bg-red-100 text-red-800 border-red-200'
                      }`}>
                        {member.statusCadastro?.toUpperCase() === 'ATIVO' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {member.whatsapp ? (
                        <a
                          href={`https://wa.me/55${member.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center p-1.5 bg-green-50 hover:bg-green-100 rounded-xl text-green-600 hover:text-green-700 transition-colors shadow-xs"
                          title="WhatsApp Direct"
                        >
                          <WhatsAppIcon />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Sem WhatsApp</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenDetail(member.matricula)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                          title="Visualizar Detalhes"
                        >
                          <Info className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))})()}
              </tbody>
            </table>

            {/* PAGINATION BAR */}
            {totalPages > 1 && (
              <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Mostrando {(currentPage * 8) + 1} a {Math.min((currentPage + 1) * 8, totalElements)} de {totalElements} membros
                </span>
                <div className="flex gap-1">
                  <button
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        currentPage === i
                          ? 'bg-emerald-700 text-white'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    disabled={currentPage === totalPages - 1}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próximo
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {showDetailModal && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xl flex items-center justify-center shrink-0 border border-emerald-100">
                  {selectedMember.fotoPerfilUrl ? (
                    <img
                      src={selectedMember.fotoPerfilUrl}
                      alt={selectedMember.nomeCompleto}
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  ) : getInitials(selectedMember.nomeCompleto)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedMember.nomeCompleto}</h3>
                  <div className="flex gap-2 items-center mt-1">
                    <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                      Matrícula: {selectedMember.matricula}
                    </span>
                    <span className={`inline-flex px-2.5 py-0.5 rounded text-xs font-semibold border ${
                      selectedMember.statusCadastro?.toUpperCase() === 'ATIVO' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'
                    }`}>
                      {selectedMember.statusCadastro?.toUpperCase() === 'ATIVO' ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 bg-white hover:bg-slate-100 rounded-lg border border-slate-100"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Sub-Tabs */}
            <div className="flex border-b border-slate-100 bg-slate-50/50 px-6 select-none shrink-0">
              <button
                onClick={() => setActiveDetailTab('cadastro')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all ${
                  activeDetailTab === 'cadastro'
                    ? 'border-emerald-600 text-emerald-800'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Ficha Cadastral
              </button>
              <button
                onClick={() => setActiveDetailTab('historico')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all ${
                  activeDetailTab === 'historico'
                    ? 'border-emerald-600 text-emerald-800'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Histórico de Alterações
              </button>
            </div>

            {/* Modal Body */}
            {activeDetailTab === 'cadastro' && (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">Dados Pessoais</h4>
                  <div className="space-y-2 text-sm text-slate-700">
                    <p className="flex items-center gap-2"><User className="h-4 w-4 text-slate-400 shrink-0" /> <span className="font-semibold text-slate-500 w-24">Sexo:</span> {selectedMember.sexo || 'Não informado'}</p>
                    <p className="flex items-center gap-2"><Calendar className="h-4 w-4 text-slate-400 shrink-0" /> <span className="font-semibold text-slate-500 w-24">Nascimento:</span> {selectedMember.dataNascimento ? formatDate(selectedMember.dataNascimento) : 'Não cadastrado'}</p>
                    <p className="flex items-center gap-2"><Hash className="h-4 w-4 text-slate-400 shrink-0" /> <span className="font-semibold text-slate-500 w-24">CPF:</span> {selectedMember.cpf ? formatCPF(selectedMember.cpf) : 'Não informado'}</p>
                    <p className="flex items-center gap-2"><Hash className="h-4 w-4 text-slate-400 shrink-0" /> <span className="font-semibold text-slate-500 w-24">RG:</span> {selectedMember.rg || 'Não informado'}</p>
                  </div>

                  <div className="pt-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">Contato</h4>
                  </div>
                  <div className="space-y-2 text-sm text-slate-700">
                    <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400 shrink-0" /> <span className="font-semibold text-slate-500 w-24">WhatsApp:</span> {selectedMember.whatsapp ? formatWhatsapp(selectedMember.whatsapp) : 'Não informado'}</p>
                    <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-slate-400 shrink-0" /> <span className="font-semibold text-slate-500 w-24">E-mail:</span> {selectedMember.email || 'Não informado'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">Dados Eclesiásticos</h4>
                  <div className="space-y-2 text-sm text-slate-700">
                    <p className="flex items-center gap-2"><Award className="h-4 w-4 text-slate-400 shrink-0" /> <span className="font-semibold text-slate-500 w-24">Cargo/Função:</span> {selectedMember.tituloCargo || 'Membro'}</p>
                    <p className="flex items-center gap-2"><User className="h-4 w-4 text-slate-400 shrink-0" /> <span className="font-semibold text-slate-500 w-24">Líder Direto:</span> {selectedMember.nomeLiderDireto || 'Sem líder imediato'}</p>
                    <p className="flex items-center gap-2"><Calendar className="h-4 w-4 text-slate-400 shrink-0" /> <span className="font-semibold text-slate-500 w-24">Adesão:</span> {selectedMember.dataAdesao ? formatDate(selectedMember.dataAdesao) : 'Não cadastrada'}</p>
                  </div>

                  <br />
                  <div className="pt-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">Vínculos de Grupos</h4>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-bold text-slate-500 block mb-1">Ministérios:</span>
                      {selectedMember.ministerios && selectedMember.ministerios.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {selectedMember.ministerios.map((m, idx) => (
                            <span key={idx} className="bg-emerald-50 text-emerald-800 text-xs font-semibold px-2 py-0.5 rounded border border-emerald-100">{m}</span>
                          ))}
                        </div>
                      ) : <span className="text-xs text-slate-400 italic">Nenhum</span>}
                    </div>

                    <div className="mt-2">
                      <span className="text-xs font-bold text-slate-500 block mb-1">Sociedades Internas:</span>
                      {selectedMember.pequenosGrupos && selectedMember.pequenosGrupos.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {selectedMember.pequenosGrupos.map((pg, idx) => (
                            <span key={idx} className="bg-teal-50 text-teal-800 text-xs font-semibold px-2 py-0.5 rounded border border-teal-100">{pg}</span>
                          ))}
                        </div>
                      ) : <span className="text-xs text-slate-400 italic">Nenhum</span>}
                    </div>
                  </div>
                </div>
                {selectedMember.observacao && (
                  <div className="col-span-1 md:col-span-2 space-y-2 mt-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">Observações</h4>
                    <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-wrap">
                      {selectedMember.observacao}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeDetailTab === 'historico' && (
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">Linha do Tempo de Alterações</h4>
                {loadingHistory ? (
                  <div className="py-12 flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 text-emerald-700 animate-spin mb-2" />
                    <span className="text-xs text-slate-500">Buscando histórico...</span>
                  </div>
                ) : memberHistory.length > 0 ? (
                  <div className="space-y-4">
                    {memberHistory.map((log) => (
                      <div key={log.id} className="border-l-2 border-emerald-500 pl-3 py-1.5 space-y-1 text-xs">
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-100 uppercase tracking-wider">{log.campoAlterado}</span>
                          <span>{new Date(log.dataAlteracao).toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-1 font-medium">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold">Valor Anterior</span>
                            <span className="text-slate-600 break-words">{log.valorAntigo || 'Vazio'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold">Valor Novo</span>
                            <span className="text-emerald-800 font-bold break-words">{log.valorNovo || 'Vazio'}</span>
                          </div>
                        </div>
                        <span className="text-[9px] text-slate-400 font-bold block uppercase mt-1">Autor: Admin (ID: {log.usuarioId})</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400 italic text-xs">
                    Nenhuma alteração registrada para este cadastro de membro.
                  </div>
                )}
              </div>
            )}

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between gap-3 animate-in fade-in duration-200">
              <div className="w-full sm:w-auto">
                {selectedMember.statusCadastro?.toUpperCase() === 'ATIVO' ? (
                  <button
                    onClick={() => handleToggleStatus(selectedMember.matricula, 'Inativo')}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors"
                  >
                    <UserMinus className="h-4 w-4" />
                    Inativar Cadastro
                  </button>
                ) : (
                  <button
                    onClick={() => handleToggleStatus(selectedMember.matricula, 'Ativo')}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors"
                  >
                    <UserCheck className="h-4 w-4" />
                    Ativar Cadastro
                  </button>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                {onViewOrganograma && (
                  <button
                    onClick={() => {
                      setShowDetailModal(false)
                      onViewOrganograma({ nome: selectedMember.nomeCompleto })
                    }}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors border border-slate-200"
                  >
                    <Users className="h-4 w-4 text-slate-500" />
                    Ver Organograma
                  </button>
                )}
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="w-full sm:w-auto bg-white border border-slate-200 text-slate-600 font-semibold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Fechar
                </button>
                <button
                  onClick={triggerEditFromDetail}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-emerald-700 text-white hover:bg-emerald-800 font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors shadow-sm"
                >
                  <Edit className="h-4 w-4" />
                  Editar Membro
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* IMPORT CSV MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-slate-900">Importação de Membros (CSV)</h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleImportCSV} className="space-y-4">
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-emerald-500 transition-colors">
                <Upload className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <label className="block text-sm font-semibold text-slate-600 mb-1 cursor-pointer">
                  Selecione o arquivo membros.csv
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => setImportFile(e.target.files[0])}
                    required
                  />
                </label>
                {importFile ? (
                  <p className="text-xs text-emerald-700 font-semibold mt-1">
                    Selecionado: {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
                  </p>
                ) : (
                  <p className="text-xs text-slate-400">Delimitador: vírgula ou ponto-e-vírgula</p>
                )}
              </div>

              {/* Status logs card */}
              {importStatus && (
                <div className={`p-4 rounded-xl border flex gap-3 text-xs leading-relaxed ${
                  importStatus === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  {importStatus === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" /> : <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />}
                  <div>
                    <span className="font-bold block mb-0.5">Resultado do Processamento</span>
                    {importMessage}
                  </div>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="border border-slate-200 text-slate-600 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  disabled={importLoading || !importFile}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  {importLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Processar CSV
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTRATION WIZARD DIALOG */}
      {showWizard && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto py-8">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {wizardStep === 1
                    ? 'Pré-cadastro de Membro'
                    : wizardMode === 'edit'
                    ? `Alterar Cadastro — Matrícula ${formData.matricula}`
                    : 'Novo Cadastro de Membro'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {wizardStep === 1
                    ? 'Validação de duplicidade por CPF antes da abertura do formulário.'
                    : 'Preencha os campos obrigatórios.'}
                </p>
              </div>
              <button
                onClick={() => setShowWizard(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Error Message */}
            {wizardError && (
              <div className="mx-6 mt-4 bg-red-50 text-red-700 border border-red-200 p-4 rounded-xl text-xs flex gap-2 items-center">
                <AlertCircle className="h-4.5 w-4.5 text-red-600 shrink-0" />
                <span>{wizardError}</span>
              </div>
            )}

            {/* Step 1: CPF LOCK PRE-CHECK */}
            {wizardStep === 1 && (
              <form onSubmit={handleWizardCpfSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Digite o CPF do Membro *
                  </label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={wizardCpf}
                    onChange={(e) => setWizardCpf(formatCPF(e.target.value))}
                    maxLength={14}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white"
                    required
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    O sistema buscará na base de dados. Se o CPF já possuir cadastro, você atualizará as informações no modo alteração. Caso contrário, liberará o formulário em branco.
                  </p>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowWizard(false)}
                    className="border border-slate-200 text-slate-600 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={wizardLoading || wizardCpf.length !== 14}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {wizardLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Avançar
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: DETAIL FORM WITH WIZARD TABS */}
            {wizardStep === 2 && (
              <form onSubmit={handleFormSubmit} className="flex flex-col flex-grow overflow-hidden">
                {/* Tabs Bar */}
                <div className="border-b border-slate-100 flex text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50">
                  <button
                    type="button"
                    onClick={() => setWizardTab('pessoais')}
                    className={`flex-1 py-3 text-center border-b-2 transition-colors ${
                      wizardTab === 'pessoais' ? 'border-emerald-700 text-emerald-800 bg-white' : 'border-transparent hover:text-slate-800'
                    }`}
                  >
                    Dados Pessoais
                  </button>
                  <button
                    type="button"
                    onClick={() => setWizardTab('contato')}
                    className={`flex-1 py-3 text-center border-b-2 transition-colors ${
                      wizardTab === 'contato' ? 'border-emerald-700 text-emerald-800 bg-white' : 'border-transparent hover:text-slate-800'
                    }`}
                  >
                    Contato
                  </button>
                  <button
                    type="button"
                    onClick={() => setWizardTab('eclesiasticos')}
                    className={`flex-1 py-3 text-center border-b-2 transition-colors ${
                      wizardTab === 'eclesiasticos' ? 'border-emerald-700 text-emerald-800 bg-white' : 'border-transparent hover:text-slate-800'
                    }`}
                  >
                    Eclesiásticos
                  </button>
                </div>

                {/* Form Fields Scrolling Area */}
                <div className="p-6 overflow-y-auto space-y-4 flex-grow">
                  {/* TAB 1: DADOS PESSOAIS */}
                  {wizardTab === 'pessoais' && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                          Nome Completo *
                        </label>
                        <input
                          type="text"
                          value={formData.nomeCompleto}
                          onChange={(e) => setFormData({ ...formData, nomeCompleto: e.target.value })}
                          className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-600 focus:ring-1"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            CPF *
                          </label>
                          <input
                            type="text"
                            value={formData.cpf}
                            onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                            className={`w-full border rounded-xl px-3 py-2 text-sm transition-colors ${
                              String(formData.cargoId) === '4'
                                ? 'border-slate-300 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                                : 'border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed'
                            }`}
                            readOnly={String(formData.cargoId) !== '4'}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            RG
                          </label>
                          <input
                            type="text"
                            value={formData.rg || ''}
                            onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
                            className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            Sexo *
                          </label>
                          <select
                            value={formData.sexo}
                            onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
                            className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white"
                          >
                            <option value="Masculino">Masculino</option>
                            <option value="Feminino">Feminino</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            Data de Nascimento *
                          </label>
                          <input
                            type="date"
                            value={formData.dataNascimento}
                            onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
                            className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-600"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            Foto de Perfil
                          </label>
                          <div className="flex items-center gap-3">
                            {formData.fotoPerfilUrl && (
                              <img src={formData.fotoPerfilUrl} alt="Preview" className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
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
                                      setFormData({ ...formData, fotoPerfilUrl: event.target.result });
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="hidden"
                                id="fotoPerfilUploadInput"
                              />
                              <label
                                htmlFor="fotoPerfilUploadInput"
                                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-600 bg-white font-semibold text-slate-700 cursor-pointer flex items-center justify-between hover:bg-slate-50 transition-colors"
                              >
                                <span>{formData.fotoPerfilUrl ? 'Alterar Foto' : 'Selecionar Foto'}</span>
                                <Upload className="h-4 w-4 text-slate-400" />
                              </label>
                            </div>
                            {formData.fotoPerfilUrl && (
                              <button
                                type="button"
                                onClick={() => setFormData({ ...formData, fotoPerfilUrl: '' })}
                                className="p-2.5 border border-red-200 text-red-650 hover:bg-red-50 rounded-xl transition-colors"
                                title="Limpar Foto"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                          Observações
                        </label>
                        <textarea
                          placeholder="Informações adicionais, notas ou observações sobre o membro..."
                          value={formData.observacao || ''}
                          onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                          className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 min-h-[80px]"
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 2: CONTATO */}
                  {wizardTab === 'contato' && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                          WhatsApp *
                        </label>
                        <input
                          type="text"
                          placeholder="(00) 00000-0000"
                          value={formData.whatsapp}
                          onChange={(e) => setFormData({ ...formData, whatsapp: formatWhatsapp(e.target.value) })}
                          maxLength={15}
                          className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-600"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                          E-mail
                        </label>
                        <input
                          type="email"
                          placeholder="membro@igreja.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 3: DADOS ECLESIASTICOS */}
                  {wizardTab === 'eclesiasticos' && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            Líder Direto
                          </label>
                          <select
                            value={formData.liderDiretoId}
                            onChange={(e) => setFormData({ ...formData, liderDiretoId: e.target.value })}
                            className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white"
                          >
                            <option value="">Nenhum líder imediato</option>
                            {lideres.map((l) => (
                              <option key={l.matricula} value={parseInt(l.matricula, 10)}>
                                {l.nomeCompleto}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            Data de Adesão *
                          </label>
                          <input
                            type="date"
                            value={formData.dataAdesao}
                            onChange={(e) => setFormData({ ...formData, dataAdesao: e.target.value })}
                            className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            Status do Cadastro
                          </label>
                          <select
                            value={formData.statusCadastro}
                            onChange={(e) => setFormData({ ...formData, statusCadastro: e.target.value })}
                            className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white"
                          >
                            <option value="Ativo">Ativo</option>
                            <option value="Inativo">Inativo</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            Cargo / Peso Hierárquico
                          </label>
                          <select
                            value={formData.cargoId}
                            onChange={(e) => setFormData({ ...formData, cargoId: e.target.value })}
                            className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white"
                          >
                            <option value="">Selecione...</option>
                            <option value="1">Pastor</option>
                            <option value="2">Presbítero</option>
                            <option value="3">Membro</option>
                            <option value="4">Visitante</option>
                          </select>
                        </div>
                      </div>

                      {/* MINISTRIES & SMALL GROUPS CHECKBOX GRIDS */}
                      <div className="border-t border-slate-100 pt-4 space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Ministérios Associados
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
                            {grupos.filter(g => g.tipoGrupo === 'MINISTERIO').length === 0 ? (
                              <span className="text-xs text-slate-400 p-1">Nenhum ministério cadastrado</span>
                            ) : (
                              grupos.filter(g => g.tipoGrupo === 'MINISTERIO').map(g => {
                                const isChecked = (formData.ministeriosIds || []).includes(g.id)
                                return (
                                  <label key={g.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-white rounded-lg cursor-pointer transition-colors text-xs font-semibold text-slate-700">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => handleToggleMinisterio(g.id)}
                                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                                    />
                                    <span>{g.nomeGrupo}</span>
                                  </label>
                                )
                              })
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Sociedades Internas Associadas
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
                            {grupos.filter(g => g.tipoGrupo !== 'MINISTERIO').length === 0 ? (
                              <span className="text-xs text-slate-400 p-1">Nenhum grupo cadastrado</span>
                            ) : (
                              grupos.filter(g => g.tipoGrupo !== 'MINISTERIO').map(g => {
                                const isChecked = (formData.pequenosGruposIds || []).includes(g.id)
                                return (
                                  <label key={g.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-white rounded-lg cursor-pointer transition-colors text-xs font-semibold text-slate-700">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => handleTogglePequenoGrupo(g.id)}
                                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                                    />
                                    <span>{g.nomeGrupo}</span>
                                  </label>
                                )
                              })
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Wizard Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="w-full sm:w-auto border border-slate-200 text-slate-600 font-semibold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-center"
                  >
                    Voltar para CPF
                  </button>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setShowWizard(false)}
                      className="w-full sm:w-auto bg-white border border-slate-200 text-slate-600 font-semibold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      Fechar
                    </button>
                    <button
                      type="submit"
                      disabled={wizardLoading}
                      className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      {wizardLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Salvar Cadastro
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {/* SIMPLIFIED CONVIDADO REGISTRATION MODAL */}
      {showConvidadoModal && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto py-8 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200 flex flex-col">
            {/* Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Adicionar Convidado</h3>
                <p className="text-xs text-slate-500 mt-0.5">Cadastro rápido de visitante ou convidado.</p>
              </div>
              <button
                onClick={() => setShowConvidadoModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Error Message */}
            {convidadoError && (
              <div className="mx-6 mt-4 bg-red-50 text-red-700 border border-red-200 p-4 rounded-xl text-xs flex gap-2 items-center">
                <AlertCircle className="h-4.5 w-4.5 text-red-600 shrink-0" />
                <span>{convidadoError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleConvidadoSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  placeholder="Nome do convidado..."
                  value={convidadoFormData.nomeCompleto}
                  onChange={(e) => setConvidadoFormData({ ...convidadoFormData, nomeCompleto: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  WhatsApp *
                </label>
                <input
                  type="text"
                  placeholder="(00) 00000-0000"
                  value={convidadoFormData.whatsapp}
                  onChange={(e) => setConvidadoFormData({ ...convidadoFormData, whatsapp: formatWhatsapp(e.target.value) })}
                  maxLength={15}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  value={convidadoFormData.dataNascimento}
                  onChange={(e) => setConvidadoFormData({ ...convidadoFormData, dataNascimento: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Observação
                </label>
                <textarea
                  placeholder="Notas adicionais sobre o convidado..."
                  value={convidadoFormData.observacao}
                  onChange={(e) => setConvidadoFormData({ ...convidadoFormData, observacao: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 min-h-[80px]"
                />
              </div>

              {/* Footer */}
              <div className="flex flex-col sm:flex-row gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowConvidadoModal(false)}
                  className="w-full sm:w-auto bg-white border border-slate-200 text-slate-600 font-semibold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  disabled={convidadoLoading}
                  className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {convidadoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Salvar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
