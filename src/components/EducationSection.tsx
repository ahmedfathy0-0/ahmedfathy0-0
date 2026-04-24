import { useState } from 'react'
import { useApp } from '../App'

export default function EducationSection() {
  const { data, refreshData, addToast } = useApp()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(data?.education || {} as any)
  const [saving, setSaving] = useState(false)

  if (!data) return null

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch('/api/data/education', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      await refreshData()
      setEditing(false)
      addToast('Education updated', 'success')
    } catch {
      addToast('Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }

  const edu = data.education
  const educationYears = edu.endYear ? `${edu.startYear} -- ${edu.endYear}` : edu.startYear

  return (
    <div>
      <div className="section-header">
        <h2>🎓 Education</h2>
        {!editing ? (
          <button className="btn btn-secondary btn-sm" onClick={() => { setForm(edu); setEditing(true) }}>
            ✏️ Edit
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : '💾 Save'}
            </button>
          </div>
        )}
      </div>

      {!editing ? (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">{edu.university}</div>
              <div className="card-subtitle">{edu.degree} — GPA: {edu.gpa}</div>
              <div className="card-meta">
                <span className="meta-tag">📍 {edu.location}</span>
                <span className="meta-tag">📅 {educationYears}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="personal-info-grid">
            <div className="form-group full-width">
              <label className="form-label">University</label>
              <input className="form-input" value={form.university} onChange={e => setForm({ ...form, university: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input className="form-input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Start Year</label>
              <input className="form-input" value={form.startYear} onChange={e => setForm({ ...form, startYear: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">End Year</label>
              <input className="form-input" value={form.endYear || ''} onChange={e => setForm({ ...form, endYear: e.target.value })} placeholder="e.g. 2027" />
            </div>
            <div className="form-group full-width">
              <label className="form-label">Degree</label>
              <input className="form-input" value={form.degree} onChange={e => setForm({ ...form, degree: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">GPA</label>
              <input className="form-input" value={form.gpa} onChange={e => setForm({ ...form, gpa: e.target.value })} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
