import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Upload,
  Music,
  BarChart3,
  Download,
  Trash2,
  RefreshCw,
  Play,
  Pause,
  Clock,
  FileAudio,
  TrendingUp,
  User,
  Settings,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  FileText,
  Plus,
  ChevronDown,
  ChevronUp,
  Music2,
  Guitar,
  Drum,
  Piano
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import MusicRegistration from './MusicRegistration'
import AudioPlayer from './AudioPlayer'
import ChatWidget from './ChatWidget'

const Dashboard = ({ user, token, onLogout }) => {
  const [uploads, setUploads] = useState([])
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [showSpectrum, setShowSpectrum] = useState(null)
  const [showTranscription, setShowTranscription] = useState(null)
  const [showChords, setShowChords] = useState(null)
  const [showInstruments, setShowInstruments] = useState(null)
  const [transcriptionData, setTranscriptionData] = useState({})
  const [showMusicRegistration, setShowMusicRegistration] = useState(false)

  useEffect(() => {
    fetchUploads()
    fetchStats()
  }, [currentPage])

  const fetchUploads = async () => {
    try {
      const response = await fetch(`/api/my-uploads?page=${currentPage}&per_page=10`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUploads(data.audios)
        setTotalPages(data.pages)
      } else {
        setError('Erro ao carregar uploads')
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err)
    }
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      setError('Arquivo muito grande. Máximo permitido: 10MB')
      return
    }

    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/mp4', 'audio/aac', 'audio/ogg']
    if (!allowedTypes.includes(file.type)) {
      setError('Tipo de arquivo não suportado. Use MP3, WAV, FLAC, M4A, AAC ou OGG')
      return
    }

    setUploadLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('audio', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setUploads(prev => [data.audio, ...prev])
        fetchStats()
        event.target.value = ''
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao fazer upload')
      }
    } catch (err) {
      setError('Erro de conexão durante o upload')
    } finally {
      setUploadLoading(false)
    }
  }

  const handleDelete = async (audioId) => {
    if (!confirm('Tem certeza que deseja excluir este áudio?')) return

    try {
      const response = await fetch(`/api/audio/${audioId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setUploads(prev => prev.filter(a => a.id !== audioId))
        fetchStats()
      } else {
        setError('Erro ao excluir áudio')
      }
    } catch (err) {
      setError('Erro de conexão')
    }
  }

  const handleReanalyze = async (audioId) => {
    try {
      const response = await fetch(`/api/audio/${audioId}/reanalyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        fetchUploads()
      } else {
        setError('Erro ao reprocessar áudio')
      }
    } catch (err) {
      setError('Erro de conexão')
    }
  }

  const handleViewTranscription = async (audioId) => {
    if (showTranscription === audioId) {
      setShowTranscription(null)
      return
    }

    if (transcriptionData[audioId]) {
      setShowTranscription(audioId)
      return
    }

    try {
      const response = await fetch(`/api/audio/${audioId}/transcription`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setTranscriptionData(prev => ({
          ...prev,
          [audioId]: data.transcription
        }))
        setShowTranscription(audioId)
      } else {
        setError('Erro ao carregar transcrição')
      }
    } catch (err) {
      setError('Erro de conexão')
    }
  }

  const handleDownloadTranscriptionPDF = (audioId, originalFilename) => {
    window.open(`/api/audio/${audioId}/transcription/pdf`, "_blank")
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { label: 'Concluído', variant: 'default', icon: CheckCircle, className: 'bg-green-100 text-green-800' },
      processing: { label: 'Processando', variant: 'secondary', icon: Loader2, className: 'bg-blue-100 text-blue-800' },
      failed: { label: 'Falhou', variant: 'destructive', icon: XCircle, className: 'bg-red-100 text-red-800' },
      pending: { label: 'Pendente', variant: 'outline', icon: Clock, className: 'bg-yellow-100 text-yellow-800' }
    }

    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge className={`flex items-center space-x-1 ${config.className}`}>
        <Icon className="h-3 w-3" />
        <span>{config.label}</span>
      </Badge>
    )
  }

  const renderFrequencySpectrum = (spectrumData) => {
    try {
      const data = JSON.parse(spectrumData)
      const binSize = Math.ceil(data.length / 50)
      const binnedData = []

      for (let i = 0; i < data.length; i += binSize) {
        const bin = data.slice(i, i + binSize)
        const avgAmplitude = bin.reduce((sum, val) => sum + val, 0) / bin.length
        binnedData.push({
          frequency: Math.floor(i / binSize),
          amplitude: avgAmplitude.toFixed(2)
        })
      }

      return binnedData
    } catch (err) {
      console.error('Erro ao processar espectro de frequência:', err)
      return []
    }
  }

  // 🎵 NOVO: Renderizar acordes
  const renderChords = (chordsData) => {
    try {
      // Aceita tanto string JSON quanto objeto já parseado
      const chords = typeof chordsData === 'string' ? JSON.parse(chordsData) : chordsData

      if (!chords || chords.length === 0) return <p className="text-sm text-gray-500">Nenhum acorde detectado</p>
      
      return (
        <div className="flex flex-wrap gap-2">
          {chords.map((chord, index) => (
            <Badge key={index} variant="outline" className="text-sm px-3 py-1 bg-purple-50 text-purple-700 border-purple-200">
              {chord}
            </Badge>
          ))}
        </div>
      )
    } catch (err) {
      console.error('Erro ao processar acordes:', err)

      return <p className="text-sm text-gray-500">Erro ao carregar acordes</p>
    }
  }

  // 🎹 NOVO: Renderizar instrumentos
  const renderInstruments = (instrumentsData) => {
    try {
      // Aceita tanto string JSON quanto objeto já parseado
      const instruments = typeof instrumentsData === 'string' ? JSON.parse(instrumentsData) : instrumentsData

      if (!instruments || instruments.length === 0) return <p className="text-sm text-gray-500">Nenhum instrumento sugerido</p>
      
      return (
        <div className="space-y-3">
          {instruments.map((instrument, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
              <span className="text-3xl">{instrument.icon}</span>
              <div className="flex-1">
                <h5 className="font-semibold text-gray-900">{instrument.name}</h5>
                <p className="text-sm text-gray-600 mt-1">{instrument.reason}</p>
                {instrument.tags && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {instrument.tags.map((tag, tagIndex) => (
                      <span key={tagIndex} className="text-xs px-2 py-0.5 bg-white rounded-full text-gray-600 border border-gray-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )
    } catch (err) {
      console.error('Erro ao processar instrumentos:', err)

      return <p className="text-sm text-gray-500">Erro ao carregar instrumentos</p>
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  if (showMusicRegistration) {
    return (
      <MusicRegistration 
        user={user} 
        token={token} 
        onBack={() => setShowMusicRegistration(false)} 
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Bem-vindo, {user.name}!
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Gerencie seus uploads de áudio e visualize as análises
                </p>
              </div>
              <Button 
                onClick={() => setShowMusicRegistration(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Criar Registro
              </Button>
            </div>
          </motion.div>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="uploads" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="uploads" className="flex items-center justify-center space-x-2">
              <FileAudio className="h-4 w-4" />
              <span className="hidden sm:inline">Meus Uploads</span>
              <span className="sm:hidden">Uploads</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center justify-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Estatísticas</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center justify-center space-x-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Perfil</span>
              <span className="sm:hidden">Perfil</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="uploads" className="space-y-6">
            {/* Upload Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                  <Upload className="h-5 w-5" />
                  <span>Novo Upload</span>
                </CardTitle>
                <CardDescription className="text-sm">
                  Envie um arquivo de áudio para análise (máximo 10MB)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    id="audio-upload"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    disabled={uploadLoading}
                    className="hidden"
                  />
                  <label
                    htmlFor="audio-upload"
                    className="cursor-pointer flex flex-col items-center space-y-3"
                  >
                    {uploadLoading ? (
                      <>
                        <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 animate-spin" />
                        <p className="text-sm sm:text-base text-gray-600">Processando upload...</p>
                        <p className="text-xs sm:text-sm text-gray-500">Isso pode levar alguns minutos</p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                        <div>
                          <p className="text-sm sm:text-base font-medium text-gray-700">
                            Clique para selecionar um arquivo
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            MP3, WAV, FLAC, M4A, AAC, OGG até 10MB
                          </p>
                        </div>
                      </>
                    )}
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Uploads List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Music className="h-5 w-5" />
                    <span className="text-lg sm:text-xl">Seus Uploads</span>
                  </div>
                  <Button
                    onClick={fetchUploads}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span className="hidden sm:inline">Atualizar</span>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {uploads.length === 0 ? (
                  <div className="text-center py-8">
                    <FileAudio className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum upload encontrado</p>
                    <p className="text-sm text-gray-400">Faça seu primeiro upload acima</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence>
                      {uploads.map((audio) => (
                        <motion.div
                          key={audio.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white"
                        >
                          {/* 📄 Header: Nome e Status */}
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                                  {audio.original_filename}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">
                                  {formatDate(audio.uploaded_at)} • {formatFileSize(audio.filesize)}
                                </p>
                              </div>
                              {getStatusBadge(audio.status)}
                            </div>
                          </div>

                          {/* 🎵 Player de Áudio */}
                          <div className="p-4 bg-gray-50 border-b">
                            <AudioPlayer 
                              audioId={audio.id} 
                              filename={audio.original_filename} 
                              token={token} 
                              onError={(error) => setError(error)} 
                            />
                          </div>

                          {/* 📊 Análise Técnica */}
                          <div className="p-4 border-b">
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center text-sm sm:text-base">
                              <BarChart3 className="h-4 w-4 mr-2 text-blue-600" />
                              Análise Técnica
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                              <div className="bg-blue-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-600 mb-1">BPM</p>
                                <p className="text-lg sm:text-xl font-bold text-blue-600">
                                  {audio.bpm ? Math.round(audio.bpm) : '-'}
                                </p>
                              </div>
                              <div className="bg-purple-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-600 mb-1">Tonalidade</p>
                                <p className="text-lg sm:text-xl font-bold text-purple-600">
                                  {audio.key || '-'}
                                </p>
                              </div>
                              <div className="bg-green-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-600 mb-1">LUFS</p>
                                <p className="text-lg sm:text-xl font-bold text-green-600">
                                  {audio.lufs ? audio.lufs.toFixed(1) : '-'}
                                </p>
                              </div>
                              <div className="bg-orange-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-600 mb-1">Espectro</p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="p-0 h-auto text-orange-600 hover:text-orange-700 font-bold text-sm"
                                  onClick={() => setShowSpectrum(showSpectrum === audio.id ? null : audio.id)}
                                >
                                  {showSpectrum === audio.id ? (
                                    <><ChevronUp className="h-4 w-4 mr-1" />Ocultar</>
                                  ) : (
                                    <><ChevronDown className="h-4 w-4 mr-1" />Ver</>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* 📈 Espectro de Frequência (Expandível) */}
                          <AnimatePresence>
                            {showSpectrum === audio.id && audio.frequency_spectrum && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="p-4 bg-gray-50 border-b"
                              >
                                <h4 className="font-semibold mb-4 flex items-center text-sm sm:text-base">
                                  <BarChart3 className="h-5 w-5 mr-2 text-orange-600" />
                                  Espectro de Frequência
                                </h4>
                                <ResponsiveContainer width="100%" height={250}>
                                  <BarChart data={renderFrequencySpectrum(audio.frequency_spectrum)}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                      dataKey="frequency"
                                      label={{ value: 'Frequência (bins)', position: 'insideBottom', offset: -5 }}
                                      tick={{ fontSize: 12 }}
                                    />
                                    <YAxis
                                      label={{ value: 'Amplitude (dB)', angle: -90, position: 'insideLeft' }}
                                      tick={{ fontSize: 12 }}
                                    />
                                    <Tooltip
                                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #ccc', fontSize: 12 }}
                                      labelFormatter={(value) => `Bin: ${value}`}
                                      formatter={(value) => [`${value} dB`, 'Amplitude']}
                                    />
                                    <Bar dataKey="amplitude" fill="#f97316" />
                                  </BarChart>
                                </ResponsiveContainer>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* 🎹 Análise Musical (NOVO) */}
                          {(audio.chords || audio.instruments) && (
                            <div className="p-4 border-b space-y-4">
                              <h4 className="font-semibold text-gray-900 flex items-center text-sm sm:text-base">
                                <Music2 className="h-4 w-4 mr-2 text-purple-600" />
                                Análise Musical
                              </h4>
                              
                              {/* Acordes */}
                              {audio.chords && (
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium text-gray-700">Acordes Detectados</p>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-xs"
                                      onClick={() => setShowChords(showChords === audio.id ? null : audio.id)}
                                    >
                                      {showChords === audio.id ? (
                                        <><ChevronUp className="h-3 w-3 mr-1" />Ocultar</>
                                      ) : (
                                        <><ChevronDown className="h-3 w-3 mr-1" />Expandir</>
                                      )}
                                    </Button>
                                  </div>
                                  <AnimatePresence>
                                    {showChords === audio.id && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                      >
                                        {renderChords(audio.chords)}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                  {showChords !== audio.id && (
                                    <p className="text-xs text-gray-500">Clique para ver os acordes</p>
                                  )}
                                </div>
                              )}

                              {/* Instrumentos */}
                              {audio.instruments && (
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium text-gray-700">Instrumentos Sugeridos</p>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-xs"
                                      onClick={() => setShowInstruments(showInstruments === audio.id ? null : audio.id)}
                                    >
                                      {showInstruments === audio.id ? (
                                        <><ChevronUp className="h-3 w-3 mr-1" />Ocultar</>
                                      ) : (
                                        <><ChevronDown className="h-3 w-3 mr-1" />Expandir</>
                                      )}
                                    </Button>
                                  </div>
                                  <AnimatePresence>
                                    {showInstruments === audio.id && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                      >
                                        {renderInstruments(audio.instruments)}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                  {showInstruments !== audio.id && (
                                    <p className="text-xs text-gray-500">Clique para ver as sugestões</p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {/* 📝 Transcrição (NOVO - Expandível) */}
                          {(
                            <div className="p-4 border-b">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-gray-900 flex items-center text-sm sm:text-base">
                                  <FileText className="h-4 w-4 mr-2 text-green-600" />
                                  Transcrição
                                </h4>
                                {audio.transcription && audio.transcription !== '.' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs"
                                    onClick={() => handleViewTranscription(audio.id)}
                                  >
                                    {showTranscription === audio.id ? (
                                      <><ChevronUp className="h-3 w-3 mr-1" />Ocultar</>
                                    ) : (
                                      <><ChevronDown className="h-3 w-3 mr-1" />Expandir</>
                                    )}
                                  </Button>
                                )}
                              </div>
                              {audio.transcription && audio.transcription !== '.' ? (
                                <>
                                  <AnimatePresence>
                                    {showTranscription === audio.id && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="bg-green-50 p-4 rounded-lg border border-green-200 max-h-64 overflow-y-auto"
                                      >
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                          {transcriptionData[audio.id] || audio.transcription}
                                        </p>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                  {showTranscription !== audio.id && (
                                    <p className="text-xs text-gray-500">Clique para ver a transcrição completa</p>
                                  )}
                                </>
                              ) : (
                                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                  <p className="text-sm text-yellow-800 flex items-center">
                                    <span className="mr-2">⚠️</span>
                                    Transcrição não disponível
                                  </p>
                                  <p className="text-xs text-yellow-600 mt-1">
                                    A transcrição pode não estar disponível se o áudio não contém conteúdo vocal detectável ou se houve erro no processamento.
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* 🔧 Ações */}
                          <div className="p-4 bg-gray-50 flex flex-wrap gap-2">
                            {audio.status === 'completed' && (
                              <>
                                <Button
                                  onClick={() => window.open(`/api/audio/${audio.id}/download`, '_blank')}
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 sm:flex-none"
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  <span className="hidden sm:inline">Download</span>
                                </Button>
                                <Button
                                  onClick={() => handleDownloadTranscriptionPDF(audio.id, audio.original_filename)}
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 sm:flex-none"
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  <span className="hidden sm:inline">PDF</span>
                                </Button>
                              </>
                            )}
                            {audio.status === 'failed' && (
                              <Button
                                onClick={() => handleReanalyze(audio.id)}
                                variant="outline"
                                size="sm"
                                className="flex-1 sm:flex-none"
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Reprocessar
                              </Button>
                            )}
                            <Button
                              onClick={() => handleDelete(audio.id)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-1 sm:flex-none"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              <span className="hidden sm:inline">Excluir</span>
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-6">
                    <Button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                    >
                      Anterior
                    </Button>
                    <span className="text-sm text-gray-600">
                      Página {currentPage} de {totalPages}
                    </span>
                    <Button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      size="sm"
                    >
                      Próxima
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Estatísticas de Uso</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Total de Uploads</p>
                      <p className="text-3xl font-bold text-blue-600">{stats.total_uploads || 0}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Concluídos</p>
                      <p className="text-3xl font-bold text-green-600">{stats.completed_uploads || 0}</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Processando</p>
                      <p className="text-3xl font-bold text-yellow-600">{stats.processing_uploads || 0}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Falhados</p>
                      <p className="text-3xl font-bold text-red-600">{stats.failed_uploads || 0}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Carregando estatísticas...</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Perfil do Usuário</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Nome</p>
                    <p className="text-lg font-medium">{user.name} {user.surname}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-lg font-medium">{user.email}</p>
                  </div>
                  {user.phone && (
                    <div>
                      <p className="text-sm text-gray-600">Telefone</p>
                      <p className="text-lg font-medium">{user.phone}</p>
                    </div>
                  )}
                  <div className="pt-4 border-t">
                    <Button
                      onClick={onLogout}
                      variant="outline"
                      className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Sair da Conta
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Widget de IA Chat */}
      <ChatWidget />
    </div>
  )
}

export default Dashboard
