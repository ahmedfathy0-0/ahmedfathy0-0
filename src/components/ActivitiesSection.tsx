import { useApp, type Activity } from '../App'

interface Props {
  onEdit: (act: Activity) => void
  onAdd: () => void
}

export default function ActivitiesSection({ onEdit, onAdd }: Props) {
  const { data, selection, setSelection, refreshData, addToast } = useApp()

  if (!data) return null

  const toggleActivity = (id: string) => {
    setSelection(prev => ({
      ...prev,
      activityIds: prev.activityIds.includes(id)
        ? prev.activityIds.filter(a => a !== id)
        : [...prev.activityIds, id]
    }))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this activity?')) return
    try {
      await fetch(`/api/data/activities/${id}`, { method: 'DELETE' })
      await refreshData()
      setSelection(prev => ({
        ...prev,
        activityIds: prev.activityIds.filter(a => a !== id)
      }))
      addToast('Activity deleted', 'success')
    } catch {
      addToast('Failed to delete', 'error')
    }
  }

  return (
    <div>
      <div className="section-header">
        <div>
          <h2>🏆 Student Activities</h2>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 4 }}>
            Toggle activities to include · {selection.activityIds.length} selected
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={onAdd}>
          ➕ Add New
        </button>
      </div>

      {data.activities.map(act => {
        const included = selection.activityIds.includes(act.id)
        return (
          <div key={act.id} className="card" style={{ borderLeft: `3px solid ${included ? 'var(--accent-green)' : 'transparent'}`, opacity: included ? 1 : 0.6 }}>
            <div className="card-header">
              <div style={{ flex: 1 }}>
                <div className="card-title">
                  <input
                    type="checkbox"
                    className="toggle-checkbox"
                    checked={included}
                    onChange={() => toggleActivity(act.id)}
                  />
                  {act.organization}
                </div>
                <div className="card-subtitle">{act.role} · {act.dates} · {act.location}</div>
              </div>
              <div className="card-actions">
                <button className="btn btn-ghost btn-icon" onClick={() => onEdit(act)} title="Edit">✏️</button>
                <button className="btn btn-danger btn-icon" onClick={() => handleDelete(act.id)} title="Delete">🗑️</button>
              </div>
            </div>
            <div className="card-items">
              {act.items.map((item, i) => (
                <div key={i} className="card-item">
                  <strong>{item.title}</strong>: <span>{item.description}</span>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
