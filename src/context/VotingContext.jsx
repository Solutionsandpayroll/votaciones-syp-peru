import { createContext, useContext, useState, useEffect } from 'react'
import { candidates as initialCandidates } from '../data/candidates'
import { sendVoteToPowerAutomate } from '../config/powerAutomate'

const VotingContext = createContext()

export function VotingProvider({ children }) {
  const [user, setUser] = useState(null)
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [votes, setVotes] = useState(() => {
    // Cargar votos del localStorage
    const savedVotes = localStorage.getItem('votes')
    if (savedVotes) {
      return JSON.parse(savedVotes)
    }
    // Inicializar votos en 0 para cada candidato
    const initialVotes = {}
    initialCandidates.forEach(candidate => {
      initialVotes[candidate.id] = 0
    })
    return initialVotes
  })

  const [votedUsers, setVotedUsers] = useState(() => {
    // Cargar usuarios que ya votaron
    const savedVotedUsers = localStorage.getItem('votedUsers')
    return savedVotedUsers ? JSON.parse(savedVotedUsers) : []
  })

  // Guardar votos en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('votes', JSON.stringify(votes))
  }, [votes])

  // Guardar usuarios que votaron en localStorage
  useEffect(() => {
    localStorage.setItem('votedUsers', JSON.stringify(votedUsers))
  }, [votedUsers])

  const login = (identifier) => {
    // Verificar si el usuario ya votó (usando nombre completo o DNI)
    if (votedUsers.includes(identifier)) {
      return { success: false, message: 'Este usuario ya ha votado anteriormente' }
    }
    setUser({ identifier })
    setHasVoted(false)
    return { success: true }
  }

  const logout = () => {
    setUser(null)
    setSelectedCandidate(null)
    setHasVoted(false)
  }

  const selectCandidate = (candidate) => {
    setSelectedCandidate(candidate)
  }

  const confirmVote = async () => {
    if (selectedCandidate && user && !hasVoted) {
      // Preparar datos para enviar a Power Automate
      const now = new Date()
      const voteData = {
        nombreVotante: user.identifier,
        candidatoId: selectedCandidate.id,
        candidatoNombre: selectedCandidate.name,
        fecha: now.toLocaleDateString('es-PE'),
        hora: now.toLocaleTimeString('es-PE')
      }

      // Función auxiliar para crear delay
      const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

      // Enviar a Power Automate y esperar mínimo 4 segundos
      try {
        await Promise.all([
          sendVoteToPowerAutomate(voteData),
          delay(4000) // Delay de 4 segundos para asegurar que se procese todo
        ])
        console.log('✅ Voto enviado correctamente a Power Automate')
      } catch (error) {
        console.error('❌ Error enviando a Power Automate:', error)
        // Esperar los 4 segundos de todas formas para UX consistente
        await delay(4000)
        // Continuar con el voto local aunque falle Power Automate
      }

      // Incrementar votos del candidato seleccionado (local)
      setVotes(prevVotes => ({
        ...prevVotes,
        [selectedCandidate.id]: prevVotes[selectedCandidate.id] + 1
      }))
      
      // Marcar usuario como votante
      setVotedUsers(prev => [...prev, user.identifier])
      setHasVoted(true)
      return true
    }
    return false
  }

  const getCandidateVotes = (candidateId) => {
    return votes[candidateId] || 0
  }

  const getTotalVotes = () => {
    return Object.values(votes).reduce((sum, count) => sum + count, 0)
  }

  const getResults = () => {
    const totalVotes = getTotalVotes()
    return initialCandidates.map(candidate => ({
      ...candidate,
      votes: votes[candidate.id] || 0,
      percentage: totalVotes > 0 ? ((votes[candidate.id] || 0) / totalVotes * 100).toFixed(1) : 0
    })).sort((a, b) => b.votes - a.votes)
  }

  const value = {
    user,
    selectedCandidate,
    hasVoted,
    login,
    logout,
    selectCandidate,
    confirmVote,
    getCandidateVotes,
    getTotalVotes,
    getResults,
    candidates: initialCandidates
  }

  return (
    <VotingContext.Provider value={value}>
      {children}
    </VotingContext.Provider>
  )
}

export function useVoting() {
  const context = useContext(VotingContext)
  if (!context) {
    throw new Error('useVoting must be used within a VotingProvider')
  }
  return context
}
