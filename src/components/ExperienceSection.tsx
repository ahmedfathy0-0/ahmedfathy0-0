import { useApp, type Experience } from '../App'

interface Props {
  onEdit: (exp: Experience) => void
  onAdd: () => void
}

export default function ExperienceSection({ onEdit, onAdd }: Props) {
  const { data, selection, setSelection, refreshData, addToast } = useApp()

  if (!data) return null

  const handleSelect = (id: string) => {
    setSelection(prev => ({ ...prev, experienceId: id }))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this experience entry?')) return
    try {
      await fetch(`/api/data/experiences/${id}`, { method: 'DELETE' })
      await refreshData()
      if (selection.experienceId === id) {
        setSelection(prev => ({ ...prev, experienceId: null }))
      }
      addToast('Experience deleted', 'success')
    } catch {
      addToast('Failed to delete', 'error')
    }
  }

  return (
    <div>
      <div className="section-header">
        <div>
          <h2>💼 Experience</h2>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 4 }}>
            Select one experience variant to include in your CV
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={onAdd}>
          ➕ Add New
        </button>
      </div>

      <div className="radio-card-group">
        {data.experiences.map(exp => (
          <div
            key={exp.id}
            className={`radio-card ${selection.experienceId === exp.id ? 'selected' : ''}`}
            onClick={() => handleSelect(exp.id)}
          >
            <input
              type="radio"
              name="experience"
              checked={selection.experienceId === exp.id}
              onChange={() => handleSelect(exp.id)}
            />
            <div style={{ flex: 1 }}>
              <div className="card-title">
                <span className="meta-tag" style={{ fontSize: 10, textTransform: 'uppercase' }}>{exp.variant}</span>
                {exp.company}
              </div>
              <div className="card-subtitle">{exp.role} · {exp.dates}</div>
              <div className="card-items">
                {exp.items.map((item, i) => (
                  <div key={i} className="card-item">
                    <strong>{item.title}</strong>: <span>{item.description}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card-actions">
              <button className="btn btn-ghost btn-icon" onClick={(e) => { e.stopPropagation(); onEdit(exp) }} title="Edit">✏️</button>
              <button className="btn btn-danger btn-icon" onClick={(e) => { e.stopPropagation(); handleDelete(exp.id) }} title="Delete">🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
