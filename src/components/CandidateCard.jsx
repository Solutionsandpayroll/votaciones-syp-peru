import Card from './Card'
import Button from './Button'
import './CandidateCard.css'

export default function CandidateCard({ candidate, onSelect, isSelected, showVoteButton = true }) {
  return (
    <Card hover={showVoteButton} selected={isSelected} className="candidate-card">
      <div className="candidate-photo-container">
        <img 
          src={candidate.photo} 
          alt={candidate.name}
          className="candidate-photo"
        />
      </div>
      
      <div className="candidate-info">
        <h3 className="candidate-name">{candidate.name}</h3>

        {showVoteButton && (
          <Button 
            onClick={() => onSelect(candidate)}
            variant={isSelected ? 'success' : 'primary'}
            fullWidth
          >
            {isSelected ? '✓ Seleccionado' : 'Seleccionar'}
          </Button>
        )}
      </div>
    </Card>
  )
}
