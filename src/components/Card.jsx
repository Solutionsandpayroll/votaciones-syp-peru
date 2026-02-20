import './Card.css'

export default function Card({ children, className = '', hover = false, selected = false }) {
  return (
    <div className={`card ${hover ? 'card-hover' : ''} ${selected ? 'card-selected' : ''} ${className}`}>
      {children}
    </div>
  )
}
