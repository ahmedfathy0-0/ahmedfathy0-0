import { useApp, type Summary } from '../App'

interface Props {
  onEdit: (summary: Summary) => void
  onAdd: () => void
}

export default function SummarySection({ onEdit, onAdd }: Props) {
  const { data, selection, setSelection, refreshData, addToast } = useApp()

  if (!data) return null

  const handleSelect = (id: string) => {
    setSelection(prev => ({ ...prev, summaryId: id }))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this summary?')) return
    try {
      await fetch(`/api/data/summaries/${id}`, { method: 'DELETE' })
      await refreshData()
      if (selection.summaryId === id) {
        setSelection(prev => ({ ...prev, summaryId: null }))
      }
      addToast('Summary deleted', 'success')
    } catch {
      addToast('Failed to delete', 'error')
    }
  }

  return (
    <div>
      <div className="section-header">
        <div>
          <h2>📝 Professional Summary</h2>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 4 }}>
            Select a professional summary variant for your CV
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={onAdd}>
          ➕ Add New
        </button>
      </div>

      <div className="radio-card-group">
        {data.summaries?.map(summary => (
          <div
            key={summary.id}
            className={`radio-card ${selection.summaryId === summary.id ? 'selected' : ''}`}
            onClick={() => handleSelect(summary.id)}
            style={{ alignItems: 'flex-start' }}
          >
            <input
              type="radio"
              name="summaries"
              checked={selection.summaryId === summary.id}
              onChange={() => handleSelect(summary.id)}
              style={{ marginTop: 4 }}
            />
            <div style={{ flex: 1 }}>
              <div className="card-title">
                <span className="meta-tag" style={{ fontSize: 10, textTransform: 'uppercase' }}>{summary.variant}</span>
              </div>
              <div className="card-item" style={{ marginTop: 8 }}>
                <span>{summary.content}</span>
              </div>
            </div>
            <div className="card-actions">
              <button className="btn btn-ghost btn-icon" onClick={(e) => { e.stopPropagation(); onEdit(summary) }} title="Edit">✏️</button>
              <button className="btn btn-danger btn-icon" onClick={(e) => { e.stopPropagation(); handleDelete(summary.id) }} title="Delete">🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
