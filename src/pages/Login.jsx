import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVoting } from '../context/VotingContext'
import { checkIfUserVoted } from '../config/powerAutomate'
import EMPLOYEES from '../data/employees'
import Card from '../components/Card'
import Button from '../components/Button'
import LoadingModal from '../components/LoadingModal'
import './Login.css'

export default function Login() {
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
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
      // Verificar contra Excel si el usuario ya votó
      const verification = await checkIfUserVoted(fullName)
      
      if (verification.hasVoted) {
        setError('Este usuario ya ha votado anteriormente')
        setIsVerifying(false)
        return
      }

      // Intentar login local
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
        </Card>
      </div>

      {/* Modal de carga */}
      <LoadingModal 
        isOpen={isVerifying} 
        message="Verificando usuario"
      />
    </div>
  )
}
