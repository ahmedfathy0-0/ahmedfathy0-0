import { useApp, type SkillSet } from '../App'

interface Props {
  onEdit: (skill: SkillSet) => void
  onAdd: () => void
}

export default function SkillsSection({ onEdit, onAdd }: Props) {
  const { data, selection, setSelection, refreshData, addToast } = useApp()

  if (!data) return null

  const handleSelect = (id: string) => {
    setSelection(prev => ({ ...prev, skillsId: id }))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this skill set?')) return
    try {
      await fetch(`/api/data/skills/${id}`, { method: 'DELETE' })
      await refreshData()
      if (selection.skillsId === id) {
        setSelection(prev => ({ ...prev, skillsId: null }))
      }
      addToast('Skill set deleted', 'success')
    } catch {
      addToast('Failed to delete', 'error')
    }
  }

  return (
    <div>
      <div className="section-header">
        <div>
          <h2>⚡ Technical Skills</h2>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 4 }}>
            Select one skill set variant for your CV
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={onAdd}>
          ➕ Add New
        </button>
      </div>

      <div className="radio-card-group">
        {data.skills.map(skill => (
          <div
            key={skill.id}
            className={`radio-card ${selection.skillsId === skill.id ? 'selected' : ''}`}
            onClick={() => handleSelect(skill.id)}
            style={{ alignItems: 'flex-start' }}
          >
            <input
              type="radio"
              name="skills"
              checked={selection.skillsId === skill.id}
              onChange={() => handleSelect(skill.id)}
              style={{ marginTop: 4 }}
            />
            <div style={{ flex: 1 }}>
              <div className="card-title">
                <span className="meta-tag" style={{ fontSize: 10, textTransform: 'uppercase' }}>{skill.variant}</span>
                {skill.label}
              </div>
              <div style={{ marginTop: 10 }}>
                {skill.categories.map((cat, i) => (
                  <div key={i} className="skills-category">
                    <div className="skills-category-label">{cat.label}</div>
                    <div className="skills-category-items">{cat.items}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card-actions">
              <button className="btn btn-ghost btn-icon" onClick={(e) => { e.stopPropagation(); onEdit(skill) }} title="Edit">✏️</button>
              <button className="btn btn-danger btn-icon" onClick={(e) => { e.stopPropagation(); handleDelete(skill.id) }} title="Delete">🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
