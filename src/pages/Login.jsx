import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVoting } from '../context/VotingContext'
import { checkIfUserVoted } from '../config/neonApi'
import EMPLOYEES from '../data/employees'
import Card from '../components/Card'
import Button from '../components/Button'
import LoadingModal from '../components/LoadingModal'
import './Login.css'

export default function Login() {
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [showResultsModal, setShowResultsModal] = useState(false)
  const [resultsPassword, setResultsPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const navigate = useNavigate()
  const { login } = useVoting()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!fullName) {
      setError('Por favor seleccione su nombre')
      return
    }

    setIsVerifying(true)

    try {
      const verification = await checkIfUserVoted(fullName)

      if (verification.hasVoted) {
        setError('Este usuario ya ha votado anteriormente')
        setIsVerifying(false)
        return
      }

      const result = login(fullName)
      if (result.success) {
        navigate('/voting')
      } else {
        setError(result.message)
      }
    } catch (error) {
      console.error('Error al verificar usuario:', error)
      setError('Error al verificar el usuario. Por favor intente nuevamente.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleNameChange = (e) => {
    setFullName(e.target.value)
    setError('')
  }

  const handleResultsAccess = (e) => {
    e.preventDefault()
    setPasswordError('')
    const correctPassword = import.meta.env.VITE_RESULTS_PASSWORD
    if (resultsPassword === correctPassword) {
      setShowResultsModal(false)
      setResultsPassword('')
      navigate('/results')
    } else {
      setPasswordError('Contraseña incorrecta')
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="login-logo">
            <img 
              src="/Logo syp.png" 
              alt="Logo S&P" 
              className="logo-image"
            />
          </div>
          <h1 className="login-title">Sistema de Votación</h1>
          <p className="login-subtitle">S&P Perú - Elecciones Supervisor SST 2026 - 2028</p>
        </div>

        <Card className="login-card">
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="fullName" className="form-label">
                Seleccione su Nombre
              </label>
              <select
                id="fullName"
                value={fullName}
                onChange={handleNameChange}
                className="form-select"
                autoFocus
              >
                <option value="">-- Seleccione su nombre --</option>
                {EMPLOYEES.map((employee) => (
                  <option key={employee} value={employee}>
                    {employee}
                  </option>
                ))}
              </select>
              <p className="form-help">
                Seleccione su nombre completo de la lista
              </p>
            </div>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠</span>
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              fullWidth 
              disabled={!fullName || isVerifying}
            >
              {isVerifying ? 'Verificando...' : 'Ingresar al Sistema'}
            </Button>
          </form>

          <div className="results-access">
            <button
              className="results-link"
              onClick={() => { setShowResultsModal(true); setPasswordError(''); setResultsPassword('') }}
            >
              📊 Ver Resultados
            </button>
          </div>
        </Card>
      </div>

      {/* Modal contraseña resultados */}
      {showResultsModal && (
        <div className="modal-overlay" onClick={() => setShowResultsModal(false)}>
          <div className="modal-content results-modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">🔒 Acceso a Resultados</h2>
            <p className="modal-subtitle">Ingrese la contraseña de administrador</p>
            <form onSubmit={handleResultsAccess} className="password-form">
              <input
                type="password"
                value={resultsPassword}
                onChange={e => { setResultsPassword(e.target.value); setPasswordError('') }}
                placeholder="Contraseña"
                className="form-input password-input"
                autoFocus
              />
              {passwordError && (
                <div className="error-message">
                  <span className="error-icon">⚠</span>
                  {passwordError}
                </div>
              )}
              <div className="modal-actions">
                <Button type="submit" variant="primary" fullWidth>
                  Acceder
                </Button>
                <button
                  type="button"
                  className="cancel-link"
                  onClick={() => setShowResultsModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de carga */}
      <LoadingModal 
        isOpen={isVerifying} 
        message="Verificando usuario"
      />
    </div>
  )
}
