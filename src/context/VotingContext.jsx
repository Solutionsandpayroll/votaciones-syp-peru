import { createContext, useContext, useState, useEffect } from 'react'
import { candidates as initialCandidates } from '../data/candidates'
import { registrarVoto } from '../config/neonApi'

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
      // Registrar en Neon: votante (sin candidato) + contador candidato (sin votante)
      const result = await registrarVoto(user.identifier, selectedCandidate.id)

      if (!result.success) {
        console.error('❌ Error registrando voto en Neon:', result.error)
        // Si el error es que ya votó, bloquear
        if (result.error?.includes('ya ha votado')) {
          return false
        }
        // Para otros errores, continuar con registro local
      } else {
        console.log('✅ Voto registrado en Neon correctamente')
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
