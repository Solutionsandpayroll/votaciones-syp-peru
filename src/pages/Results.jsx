import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Button from '../components/Button'
import Card from '../components/Card'
import { obtenerResultados, obtenerHistorial } from '../config/neonApi'
import { candidates } from '../data/candidates'
import './Results.css'

export default function Results() {
  const navigate = useNavigate()
  const [resultados, setResultados] = useState([])
  const [historial, setHistorial] = useState([])
  const [totalVotos, setTotalVotos] = useState(0)
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null)
  const [loading, setLoading] = useState(true)

  // Mapa de fotos por candidatoId para mostrar imágenes
  const fotoMap = Object.fromEntries(candidates.map(c => [c.id, c.photo]))
  const colorMap = Object.fromEntries(candidates.map(c => [c.id, c.color]))

  const cargarDatos = useCallback(async () => {
    const [resResultados, resHistorial] = await Promise.all([
      obtenerResultados(),
      obtenerHistorial()
    ])
    setResultados(resResultados.resultados || [])
    setTotalVotos(resResultados.totalVotos || 0)
    setHistorial(resHistorial.historial || [])
    setUltimaActualizacion(new Date())
    setLoading(false)
  }, [])

  useEffect(() => {
    cargarDatos()
    // Actualizar cada 10 segundos
    const interval = setInterval(cargarDatos, 10000)
    return () => clearInterval(interval)
  }, [cargarDatos])

  const resultadosOrdenados = [...resultados].sort((a, b) => b.votos - a.votos)

  return (
    <div className="results-page">
      <Header title="Resultados en Tiempo Real" showLogout={false} />

      <div className="results-container">

        {/* Estadísticas */}
        <div className="results-header">
          <div className="results-stats">
            <Card className="stat-card">
              <div className="stat-icon">🗳️</div>
              <div className="stat-content">
                <div className="stat-value">{totalVotos}</div>
                <div className="stat-label">Votos Totales</div>
              </div>
            </Card>
            <Card className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <div className="stat-value">{historial.length}</div>
                <div className="stat-label">Personas que Votaron</div>
              </div>
            </Card>
            <Card className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-value">
                  {resultadosOrdenados[0]?.votos > 0 ? `${resultadosOrdenados[0].porcentaje}%` : '0%'}
                </div>
                <div className="stat-label">Líder</div>
              </div>
            </Card>
          </div>
        </div>

        {/* Resultados por candidato */}
        <div className="results-list">
          <h2 className="results-list-title">Resultados por Candidato</h2>

          {loading ? (
            <Card className="no-votes-card">
              <div className="no-votes-content">
                <span className="no-votes-icon">⏳</span>
                <h3>Cargando resultados...</h3>
              </div>
            </Card>
          ) : totalVotos === 0 ? (
            <Card className="no-votes-card">
              <div className="no-votes-content">
                <span className="no-votes-icon">📭</span>
                <h3>Aún no hay votos registrados</h3>
                <p>Los resultados aparecerán aquí cuando se registren votos</p>
              </div>
            </Card>
          ) : (
            resultadosOrdenados.map((candidato, index) => (
              <Card key={candidato.candidatoId} className="result-card">
                <div className="result-rank">
                  {index === 0 && <span className="rank-badge gold">🥇</span>}
                  {index === 1 && <span className="rank-badge silver">🥈</span>}
                </div>

                <div className="result-candidate">
                  <img
                    src={fotoMap[candidato.candidatoId] || '/placeholder.png'}
                    alt={candidato.candidatoNombre}
                    className="result-photo"
                  />
                  <div className="result-info">
                    <h3 className="result-name">{candidato.candidatoNombre}</h3>
                  </div>
                </div>

                <div className="result-stats">
                  <div className="result-votes">
                    <span className="votes-number">{candidato.votos}</span>
                    <span className="votes-label">votos</span>
                  </div>
                  <div className="result-percentage">{candidato.porcentaje}%</div>
                </div>

                <div className="result-bar-container">
                  <div
                    className="result-bar"
                    style={{
                      width: `${candidato.porcentaje}%`,
                      backgroundColor: colorMap[candidato.candidatoId] || '#1e3a8a'
                    }}
                  >
                    <div className="result-bar-glow"></div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Historial de votantes */}
        <div className="results-list" style={{ marginTop: '32px' }}>
          <h2 className="results-list-title">👤 Historial de Votantes</h2>

          {historial.length === 0 ? (
            <Card className="no-votes-card">
              <div className="no-votes-content">
                <span className="no-votes-icon">📋</span>
                <h3>Sin registros aún</h3>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="historial-table-wrapper">
                <table className="historial-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nombre</th>
                      <th>Fecha y Hora</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historial.map((v, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{v.nombre}</td>
                        <td>
                          {new Date(v.fechaHora).toLocaleString('es-PE', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit', second: '2-digit'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>

        <div className="results-actions">
          <Button onClick={() => navigate('/')} variant="primary">
            Volver al Inicio
          </Button>
        </div>

        <div className="results-footer">
          <p className="footer-text">
            ℹ️ Los resultados se actualizan automáticamente cada 10 segundos
          </p>
          {ultimaActualizacion && (
            <p className="footer-timestamp">
              Última actualización: {ultimaActualizacion.toLocaleString('es-PE')}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
