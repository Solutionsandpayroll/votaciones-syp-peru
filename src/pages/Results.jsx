import { useNavigate } from 'react-router-dom'
import { useVoting } from '../context/VotingContext'
import Header from '../components/Header'
import Button from '../components/Button'
import Card from '../components/Card'
import './Results.css'

export default function Results() {
  const navigate = useNavigate()
  const { getResults, getTotalVotes } = useVoting()
  const results = getResults()
  const totalVotes = getTotalVotes()

  return (
    <div className="results-page">
      <Header title="Resultados en Tiempo Real" showLogout={false} />

      <div className="results-container">
        <div className="results-header">
          <div className="results-stats">
            <Card className="stat-card">
              <div className="stat-icon">🗳️</div>
              <div className="stat-content">
                <div className="stat-value">{totalVotes}</div>
                <div className="stat-label">Votos Totales</div>
              </div>
            </Card>
            <Card className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <div className="stat-value">{results.length}</div>
                <div className="stat-label">Candidatos</div>
              </div>
            </Card>
            <Card className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-value">
                  {results[0]?.votes > 0 ? `${results[0].percentage}%` : '0%'}
                </div>
                <div className="stat-label">Líder</div>
              </div>
            </Card>
          </div>
        </div>

        <div className="results-list">
          <h2 className="results-list-title">Resultados por Candidato</h2>
          
          {totalVotes === 0 ? (
            <Card className="no-votes-card">
              <div className="no-votes-content">
                <span className="no-votes-icon">📭</span>
                <h3>Aún no hay votos registrados</h3>
                <p>Los resultados aparecerán aquí cuando se registren votos</p>
              </div>
            </Card>
          ) : (
            results.map((candidate, index) => (
              <Card key={candidate.id} className="result-card">
                <div className="result-rank">
                  {index === 0 && <span className="rank-badge gold">🥇</span>}
                  {index === 1 && <span className="rank-badge silver">🥈</span>}
                  {index === 2 && <span className="rank-badge bronze">🥉</span>}
                  {index > 2 && <span className="rank-number">#{index + 1}</span>}
                </div>
                
                <div className="result-candidate">
                  <img 
                    src={candidate.photo} 
                    alt={candidate.name}
                    className="result-photo"
                  />
                  <div className="result-info">
                    <h3 className="result-name">{candidate.name}</h3>
                  </div>
                </div>

                <div className="result-stats">
                  <div className="result-votes">
                    <span className="votes-number">{candidate.votes}</span>
                    <span className="votes-label">votos</span>
                  </div>
                  <div className="result-percentage">
                    {candidate.percentage}%
                  </div>
                </div>

                <div className="result-bar-container">
                  <div 
                    className="result-bar"
                    style={{
                      width: `${candidate.percentage}%`,
                      backgroundColor: candidate.color
                    }}
                  >
                    <div className="result-bar-glow"></div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        <div className="results-actions">
          <Button onClick={() => navigate('/')} variant="primary">
            Volver al Inicio
          </Button>
        </div>

        <div className="results-footer">
          <p className="footer-text">
            ℹ️ Los resultados se actualizan automáticamente en tiempo real
          </p>
          <p className="footer-timestamp">
            Última actualización: {new Date().toLocaleString('es-PE')}
          </p>
        </div>
      </div>
    </div>
  )
}
