import { useState } from 'react'
import { useApp, type ResumeItem } from '../App'

interface ModalConfig {
  type: 'project' | 'experience' | 'activity' | 'skill' | 'summary'
  mode: 'add' | 'edit'
  data?: any
}

interface Props {
  config: ModalConfig
  onClose: () => void
}

export default function EditModal({ config, onClose }: Props) {
  const { refreshData, addToast } = useApp()
  const [saving, setSaving] = useState(false)

  const isEdit = config.mode === 'edit'

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {config.type === 'project' && (
          <ProjectForm
            data={config.data}
            isEdit={isEdit}
            saving={saving}
            setSaving={setSaving}
            refreshData={refreshData}
            addToast={addToast}
            onClose={onClose}
          />
        )}
        {config.type === 'experience' && (
          <ExperienceForm
            data={config.data}
            isEdit={isEdit}
            saving={saving}
            setSaving={setSaving}
            refreshData={refreshData}
            addToast={addToast}
            onClose={onClose}
          />
        )}
        {config.type === 'activity' && (
          <ActivityForm
            data={config.data}
            isEdit={isEdit}
            saving={saving}
            setSaving={setSaving}
            refreshData={refreshData}
            addToast={addToast}
            onClose={onClose}
          />
        )}
        {config.type === 'skill' && (
          <SkillForm
            data={config.data}
            isEdit={isEdit}
            saving={saving}
            setSaving={setSaving}
            refreshData={refreshData}
            addToast={addToast}
            onClose={onClose}
          />
        )}
        {config.type === 'summary' && (
          <SummaryForm
            data={config.data}
            isEdit={isEdit}
            saving={saving}
            setSaving={setSaving}
            refreshData={refreshData}
            addToast={addToast}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  )
}

interface FormProps {
  data?: any
  isEdit: boolean
  saving: boolean
  setSaving: (v: boolean) => void
  refreshData: () => Promise<void>
  addToast: (msg: string, type: 'success' | 'error' | 'info') => void
  onClose: () => void
}

// Items editor sub-component
function ItemsEditor({ items, setItems }: { items: ResumeItem[]; setItems: (items: ResumeItem[]) => void }) {
  const addItem = () => setItems([...items, { title: '', description: '' }])
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx))
  const updateItem = (idx: number, field: 'title' | 'description', value: string) => {
    const updated = [...items]
    updated[idx] = { ...updated[idx], [field]: value }
    setItems(updated)
  }
  const moveItem = (idx: number, direction: 'up' | 'down') => {
    const newItems = [...items]
    if (direction === 'up' && idx > 0) {
      [newItems[idx - 1], newItems[idx]] = [newItems[idx], newItems[idx - 1]]
    } else if (direction === 'down' && idx < newItems.length - 1) {
      [newItems[idx + 1], newItems[idx]] = [newItems[idx], newItems[idx + 1]]
    }
    setItems(newItems)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <label className="form-label" style={{ margin: 0 }}>Items / Bullet Points</label>
        <button className="btn btn-ghost btn-sm" type="button" onClick={addItem}>➕ Add Item</button>
      </div>
      {items.map((item, idx) => (
        <div key={idx} style={{ padding: 12, background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', marginBottom: 8 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input
              className="form-input"
              placeholder="Title (e.g. Architecture)"
              value={item.title}
              onChange={e => updateItem(idx, 'title', e.target.value)}
              style={{ flex: '0 0 200px' }}
            />
            <button className="btn btn-ghost btn-icon" style={{ marginLeft: 'auto' }} type="button" disabled={idx === 0} onClick={() => moveItem(idx, 'up')}>↑</button>
            <button className="btn btn-ghost btn-icon" type="button" disabled={idx === items.length - 1} onClick={() => moveItem(idx, 'down')}>↓</button>
            <button className="btn btn-danger btn-icon" type="button" onClick={() => removeItem(idx)}>✕</button>
          </div>
          <textarea
            className="form-textarea"
            placeholder="Description"
            value={item.description}
            onChange={e => updateItem(idx, 'description', e.target.value)}
            rows={2}
          />
        </div>
      ))}
      {items.length === 0 && (
        <div className="empty-state" style={{ padding: 20 }}>
          <p style={{ fontSize: 13 }}>No items yet. Click "Add Item" above.</p>
        </div>
      )}
    </div>
  )
}

function ProjectForm({ data, isEdit, saving, setSaving, refreshData, addToast, onClose }: FormProps) {
  const legacyUrl = (data?.url || '').trim()
  const isLegacyGithub = /github\.com/i.test(legacyUrl)
  const inferredLegacyType = data?.linkType || (isLegacyGithub ? 'source' : 'preview')

  const [form, setForm] = useState({
    name: data?.name || '',
    previewUrl: data?.previewUrl ?? (legacyUrl && inferredLegacyType === 'preview' ? legacyUrl : ''),
    sourceCodeUrl: data?.sourceCodeUrl ?? (legacyUrl && inferredLegacyType === 'source' ? legacyUrl : ''),
    technologies: data?.technologies || '',
    year: data?.year || new Date().getFullYear().toString(),
    category: data?.category || 'web',
    items: data?.items || [{ title: '', description: '' }]
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      const previewUrl = form.previewUrl.trim()
      const sourceCodeUrl = form.sourceCodeUrl.trim()
      const payload = {
        ...form,
        previewUrl: previewUrl || null,
        sourceCodeUrl: sourceCodeUrl || null,
      }

      if (isEdit) {
        await fetch(`/api/data/projects/${data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      } else {
        await fetch('/api/data/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      }
      await refreshData()
      addToast(`Project ${isEdit ? 'updated' : 'added'}`, 'success')
      onClose()
    } catch {
      addToast('Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="modal-header">
        <h3>{isEdit ? '✏️ Edit Project' : '➕ Add Project'}</h3>
        <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
      </div>
      <div className="modal-body">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Project Name</label>
            <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Year</label>
            <input className="form-input" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Live Preview URL</label>
          <input
            className="form-input"
            value={form.previewUrl}
            placeholder="https://your-live-app.com"
            onChange={e => setForm({ ...form, previewUrl: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Source Code URL</label>
          <input
            className="form-input"
            value={form.sourceCodeUrl}
            placeholder="https://github.com/user/repo"
            onChange={e => setForm({ ...form, sourceCodeUrl: e.target.value })}
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Technologies</label>
            <input className="form-input" value={form.technologies} onChange={e => setForm({ ...form, technologies: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              <option value="web">🌐 Web</option>
              <option value="hardware">🔧 Hardware</option>
              <option value="ai">🤖 AI</option>
              <option value="games">🎮 Games</option>
            </select>
          </div>
        </div>
        <ItemsEditor items={form.items} setItems={items => setForm({ ...form, items })} />
      </div>
      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : isEdit ? 'Update' : 'Add Project'}
        </button>
      </div>
    </>
  )
}

function ExperienceForm({ data, isEdit, saving, setSaving, refreshData, addToast, onClose }: FormProps) {
  const [form, setForm] = useState({
    variant: data?.variant || '',
    company: data?.company || '',
    location: data?.location || '',
    role: data?.role || '',
    dates: data?.dates || '',
    items: data?.items || [{ title: '', description: '' }]
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      if (isEdit) {
        await fetch(`/api/data/experiences/${data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        })
      } else {
        await fetch('/api/data/experiences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        })
      }
      await refreshData()
      addToast(`Experience ${isEdit ? 'updated' : 'added'}`, 'success')
      onClose()
    } catch {
      addToast('Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="modal-header">
        <h3>{isEdit ? '✏️ Edit Experience' : '➕ Add Experience'}</h3>
        <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
      </div>
      <div className="modal-body">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Variant Label</label>
            <input className="form-input" placeholder="e.g. web, hardware, ai" value={form.variant} onChange={e => setForm({ ...form, variant: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Dates</label>
            <input className="form-input" value={form.dates} onChange={e => setForm({ ...form, dates: e.target.value })} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Company</label>
            <input className="form-input" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Location</label>
            <input className="form-input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Role</label>
          <input className="form-input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} />
        </div>
        <ItemsEditor items={form.items} setItems={items => setForm({ ...form, items })} />
      </div>
      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : isEdit ? 'Update' : 'Add Experience'}
        </button>
      </div>
    </>
  )
}

function ActivityForm({ data, isEdit, saving, setSaving, refreshData, addToast, onClose }: FormProps) {
  const [form, setForm] = useState({
    organization: data?.organization || '',
    location: data?.location || '',
    role: data?.role || '',
    dates: data?.dates || '',
    items: data?.items || [{ title: '', description: '' }]
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      if (isEdit) {
        await fetch(`/api/data/activities/${data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        })
      } else {
        await fetch('/api/data/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        })
      }
      await refreshData()
      addToast(`Activity ${isEdit ? 'updated' : 'added'}`, 'success')
      onClose()
    } catch {
      addToast('Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="modal-header">
        <h3>{isEdit ? '✏️ Edit Activity' : '➕ Add Activity'}</h3>
        <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
      </div>
      <div className="modal-body">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Organization</label>
            <input className="form-input" value={form.organization} onChange={e => setForm({ ...form, organization: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Location</label>
            <input className="form-input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Role</label>
            <input className="form-input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Dates</label>
            <input className="form-input" value={form.dates} onChange={e => setForm({ ...form, dates: e.target.value })} />
          </div>
        </div>
        <ItemsEditor items={form.items} setItems={items => setForm({ ...form, items })} />
      </div>
      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : isEdit ? 'Update' : 'Add Activity'}
        </button>
      </div>
    </>
  )
}

function SkillForm({ data, isEdit, saving, setSaving, refreshData, addToast, onClose }: FormProps) {
  const [form, setForm] = useState({
    variant: data?.variant || '',
    label: data?.label || '',
    categories: data?.categories || [{ label: '', items: '' }]
  })

  const addCategory = () => setForm({ ...form, categories: [...form.categories, { label: '', items: '' }] })
  const removeCategory = (idx: number) => setForm({ ...form, categories: form.categories.filter((_: any, i: number) => i !== idx) })
  const updateCategory = (idx: number, field: string, value: string) => {
    const updated = [...form.categories]
    updated[idx] = { ...updated[idx], [field]: value }
    setForm({ ...form, categories: updated })
  }
  const moveCategory = (idx: number, direction: 'up' | 'down') => {
    const newCat = [...form.categories]
    if (direction === 'up' && idx > 0) {
      [newCat[idx - 1], newCat[idx]] = [newCat[idx], newCat[idx - 1]]
    } else if (direction === 'down' && idx < newCat.length - 1) {
      [newCat[idx + 1], newCat[idx]] = [newCat[idx], newCat[idx + 1]]
    }
    setForm({ ...form, categories: newCat })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (isEdit) {
        await fetch(`/api/data/skills/${data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        })
      } else {
        await fetch('/api/data/skills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        })
      }
      await refreshData()
      addToast(`Skill set ${isEdit ? 'updated' : 'added'}`, 'success')
      onClose()
    } catch {
      addToast('Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="modal-header">
        <h3>{isEdit ? '✏️ Edit Skill Set' : '➕ Add Skill Set'}</h3>
        <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
      </div>
      <div className="modal-body">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Variant ID</label>
            <input className="form-input" placeholder="e.g. web, hardware" value={form.variant} onChange={e => setForm({ ...form, variant: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Display Label</label>
            <input className="form-input" placeholder="e.g. Web Development" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <label className="form-label" style={{ margin: 0 }}>Skill Categories</label>
          <button className="btn btn-ghost btn-sm" type="button" onClick={addCategory}>➕ Add Category</button>
        </div>

        {form.categories.map((cat: any, idx: number) => (
          <div key={idx} style={{ padding: 12, background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', marginBottom: 8 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                className="form-input"
                placeholder="Category label (e.g. Frontend Development)"
                value={cat.label}
                onChange={e => updateCategory(idx, 'label', e.target.value)}
              />
              <button className="btn btn-ghost btn-icon" style={{ marginLeft: 'auto' }} type="button" disabled={idx === 0} onClick={() => moveCategory(idx, 'up')}>↑</button>
              <button className="btn btn-ghost btn-icon" type="button" disabled={idx === form.categories.length - 1} onClick={() => moveCategory(idx, 'down')}>↓</button>
              <button className="btn btn-danger btn-icon" type="button" onClick={() => removeCategory(idx)}>✕</button>
            </div>
            <textarea
              className="form-textarea"
              placeholder="Comma-separated skills (e.g. React, Next.js, TypeScript)"
              value={cat.items}
              onChange={e => updateCategory(idx, 'items', e.target.value)}
              rows={2}
            />
          </div>
        ))}
      </div>
      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : isEdit ? 'Update' : 'Add Skill Set'}
        </button>
      </div>
    </>
  )
}

function SummaryForm({ data, isEdit, saving, setSaving, refreshData, addToast, onClose }: FormProps) {
  const [form, setForm] = useState({
    variant: data?.variant || '',
    content: data?.content || ''
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      if (isEdit) {
        await fetch(`/api/data/summaries/${data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        })
      } else {
        await fetch('/api/data/summaries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        })
      }
      await refreshData()
      addToast(`Summary ${isEdit ? 'updated' : 'added'}`, 'success')
      onClose()
    } catch {
      addToast('Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="modal-header">
        <h3>{isEdit ? '✏️ Edit Summary' : '➕ Add Summary'}</h3>
        <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
      </div>
      <div className="modal-body">
        <div className="form-group">
          <label className="form-label">Variant Name</label>
          <input className="form-input" placeholder="e.g. Software Engineer, Hardware" value={form.variant} onChange={e => setForm({ ...form, variant: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Summary Content</label>
          <textarea
            className="form-textarea"
            placeholder="Write your professional summary here..."
            value={form.content}
            onChange={e => setForm({ ...form, content: e.target.value })}
            rows={5}
          />
        </div>
      </div>
      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : isEdit ? 'Update' : 'Add Summary'}
        </button>
      </div>
    </>
  )
}
