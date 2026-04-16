import { useState } from 'react'
import { useApp } from '../App'

export default function PersonalInfo() {
  const { data, refreshData, addToast } = useApp()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(data?.personalInfo || {} as any)
  const [saving, setSaving] = useState(false)

  if (!data) return null

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch('/api/data/personalInfo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      await refreshData()
      setEditing(false)
      addToast('Personal info updated', 'success')
    } catch {
      addToast('Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }

  const info = data.personalInfo

  return (
    <div>
      <div className="section-header">
        <h2>👤 Personal Information</h2>
        {!editing ? (
          <button className="btn btn-secondary btn-sm" onClick={() => { setForm(info); setEditing(true) }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'var(--gradient-main)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 800, color: 'white'
            }}>
              {info.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h3 style={{ fontSize: 22, fontWeight: 700 }}>{info.name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{info.title}</p>
            </div>
          </div>

          <div className="personal-info-grid">
            <InfoField label="Email" value={info.email} icon="📧" />
            <InfoField label="Phone" value={info.phone} icon="📱" />
            <InfoField label="LinkedIn" value={info.linkedin} icon="🔗" link />
            <InfoField label="GitHub" value={info.github} icon="💻" link />
            <InfoField label="Portfolio" value={info.portfolio} icon="🌐" link />
            <InfoField label="Address" value={info.address} icon="📍" />
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="personal-info-grid">
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">LinkedIn URL</label>
              <input className="form-input" value={form.linkedin} onChange={e => setForm({ ...form, linkedin: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">GitHub URL</label>
              <input className="form-input" value={form.github} onChange={e => setForm({ ...form, github: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Portfolio URL</label>
              <input className="form-input" value={form.portfolio} onChange={e => setForm({ ...form, portfolio: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input className="form-input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoField({ label, value, icon, link }: { label: string; value: string; icon: string; link?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{label}</div>
        {link ? (
          <a href={value} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-purple)', fontSize: 13, textDecoration: 'none' }}>{value}</a>
        ) : (
          <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{value}</div>
        )}
      </div>
    </div>
  )
}
