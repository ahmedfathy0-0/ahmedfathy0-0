import { useApp, type Project } from '../App'

interface Props {
  onEdit: (proj: Project) => void
  onAdd: () => void
}

const categoryColors: Record<string, string> = {
  hardware: 'var(--accent-cyan)',
  web: 'var(--accent-purple)',
  ai: 'var(--accent-green)',
  games: 'var(--accent-amber)'
}

const categoryLabels: Record<string, string> = {
  hardware: '🔧 Hardware',
  web: '🌐 Web',
  ai: '🤖 AI',
  games: '🎮 Games'
}

export default function ProjectsSection({ onEdit, onAdd }: Props) {
  const { data, selection, setSelection, refreshData, addToast } = useApp()

  if (!data) return null

  const toggleProject = (id: string) => {
    setSelection(prev => ({
      ...prev,
      projectIds: prev.projectIds.includes(id)
        ? prev.projectIds.filter(p => p !== id)
        : [...prev.projectIds, id]
    }))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return
    try {
      await fetch(`/api/data/projects/${id}`, { method: 'DELETE' })
      await refreshData()
      setSelection(prev => ({
        ...prev,
        projectIds: prev.projectIds.filter(p => p !== id)
      }))
      addToast('Project deleted', 'success')
    } catch {
      addToast('Failed to delete', 'error')
    }
  }

  // Group by category
  const categories = [...new Set(data.projects.map(p => p.category))]

  return (
    <div>
      <div className="section-header">
        <div>
          <h2>🚀 Projects</h2>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 4 }}>
            Toggle projects to include in your CV · {selection.projectIds.length} selected
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={onAdd}>
          ➕ Add New
        </button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label className="form-label">Projects Section Title</label>
        <input
          className="form-input"
          style={{ maxWidth: 300 }}
          value={selection.projectsSectionTitle}
          onChange={e => setSelection(prev => ({ ...prev, projectsSectionTitle: e.target.value }))}
          placeholder="Projects"
        />
      </div>

      {categories.map(cat => (
        <div key={cat} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: categoryColors[cat] || 'var(--text-secondary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            {categoryLabels[cat] || cat}
            <span className="badge">{data.projects.filter(p => p.category === cat).length}</span>
          </h3>

          {data.projects.filter(p => p.category === cat).map(proj => {
            const included = selection.projectIds.includes(proj.id)
            return (
              <div key={proj.id} className="card" style={{ borderLeft: `3px solid ${included ? (categoryColors[proj.category] || 'var(--accent-purple)') : 'transparent'}`, opacity: included ? 1 : 0.6 }}>
                <div className="card-header">
                  <div style={{ flex: 1 }}>
                    <div className="card-title">
                      <input
                        type="checkbox"
                        className="toggle-checkbox"
                        checked={included}
                        onChange={() => toggleProject(proj.id)}
                      />
                      {proj.name}
                    </div>
                    <div className="card-subtitle">{proj.technologies} · {proj.year}</div>
                    {proj.url && (
                      <a href={proj.url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--accent-blue)', textDecoration: 'none', marginTop: 4, display: 'inline-block' }}>
                        🔗 {proj.url}
                      </a>
                    )}
                  </div>
                  <div className="card-actions">
                    <button className="btn btn-ghost btn-icon" onClick={() => onEdit(proj)} title="Edit">✏️</button>
                    <button className="btn btn-danger btn-icon" onClick={() => handleDelete(proj.id)} title="Delete">🗑️</button>
                  </div>
                </div>

                <div className="card-items">
                  {proj.items.map((item, i) => (
                    <div key={i} className="card-item">
                      <strong>{item.title}</strong>: <span>{item.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
