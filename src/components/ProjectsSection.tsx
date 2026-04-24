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

const getPrimaryProjectUrl = (project: Project) => {
  const previewUrl = project.previewUrl?.trim() || ''
  const sourceCodeUrl = project.sourceCodeUrl?.trim() || ''

  if (sourceCodeUrl) return sourceCodeUrl
  if (previewUrl) return previewUrl

  const legacyUrl = project.url?.trim() || ''
  return legacyUrl
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

  const moveProject = (id: string, direction: 'up' | 'down') => {
    setSelection(prev => {
      const idx = prev.projectIds.indexOf(id)
      if (idx === -1) return prev

      const targetIdx = direction === 'up' ? idx - 1 : idx + 1
      if (targetIdx < 0 || targetIdx >= prev.projectIds.length) return prev

      const projectIds = [...prev.projectIds]
      ;[projectIds[idx], projectIds[targetIdx]] = [projectIds[targetIdx], projectIds[idx]]
      return { ...prev, projectIds }
    })
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
  const selectedProjects = selection.projectIds
    .map(id => data.projects.find(p => p.id === id))
    .filter((proj): proj is Project => Boolean(proj))

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

      {selectedProjects.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Selected Projects Order</h3>
          <div className="radio-card-group">
            {selectedProjects.map((project, idx) => (
              <div key={project.id} className="radio-card" style={{ padding: '10px 12px' }}>
                <span className="badge" style={{ minWidth: 32, textAlign: 'center' }}>#{idx + 1}</span>
                {(() => {
                  const primaryUrl = getPrimaryProjectUrl(project)
                  return (
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>
                    {primaryUrl ? (
                      <a href={primaryUrl} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none', font: 'inherit' }}>
                        {project.name}
                      </a>
                    ) : (
                      project.name
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{project.category} · {project.year}</div>
                </div>
                  )
                })()}
                <div className="card-actions">
                  <button
                    className="btn btn-ghost btn-icon"
                    onClick={() => moveProject(project.id, 'up')}
                    disabled={idx === 0}
                    title="Move up"
                  >
                    ⬆️
                  </button>
                  <button
                    className="btn btn-ghost btn-icon"
                    onClick={() => moveProject(project.id, 'down')}
                    disabled={idx === selectedProjects.length - 1}
                    title="Move down"
                  >
                    ⬇️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {categories.map(cat => (
        <div key={cat} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: categoryColors[cat] || 'var(--text-secondary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            {categoryLabels[cat] || cat}
            <span className="badge">{data.projects.filter(p => p.category === cat).length}</span>
          </h3>

          {data.projects.filter(p => p.category === cat).map(proj => {
            const included = selection.projectIds.includes(proj.id)
            const selectedIndex = selection.projectIds.indexOf(proj.id)
            const primaryUrl = getPrimaryProjectUrl(proj)
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
                      {primaryUrl ? (
                        <a href={primaryUrl} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none', font: 'inherit' }}>
                          {proj.name}
                        </a>
                      ) : (
                        proj.name
                      )}
                      {included && <span className="badge">#{selectedIndex + 1}</span>}
                    </div>
                    <div className="card-subtitle">{proj.technologies} · {proj.year}</div>
                  </div>
                  <div className="card-actions">
                    {included && (
                      <>
                        <button
                          className="btn btn-ghost btn-icon"
                          onClick={() => moveProject(proj.id, 'up')}
                          disabled={selectedIndex === 0}
                          title="Move up"
                        >
                          ⬆️
                        </button>
                        <button
                          className="btn btn-ghost btn-icon"
                          onClick={() => moveProject(proj.id, 'down')}
                          disabled={selectedIndex === selection.projectIds.length - 1}
                          title="Move down"
                        >
                          ⬇️
                        </button>
                      </>
                    )}
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
