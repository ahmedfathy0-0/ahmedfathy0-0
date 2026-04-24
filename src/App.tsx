import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import PersonalInfo from './components/PersonalInfo'
import SummarySection from './components/SummarySection'
import EducationSection from './components/EducationSection'
import ExperienceSection from './components/ExperienceSection'
import ProjectsSection from './components/ProjectsSection'
import ActivitiesSection from './components/ActivitiesSection'
import SkillsSection from './components/SkillsSection'
import PdfPreview from './components/PdfPreview'
import EditModal from './components/EditModal'
import Toast from './components/Toast'

// Types
export interface ResumeItem {
  title: string
  description: string
}

export interface Project {
  id: string
  name: string
  url?: string
  linkType?: 'source' | 'preview'
  previewUrl?: string | null
  sourceCodeUrl?: string | null
  technologies: string
  year: string
  category: string
  items: ResumeItem[]
}

export interface Experience {
  id: string
  variant: string
  company: string
  location: string
  role: string
  dates: string
  items: ResumeItem[]
}

export interface Activity {
  id: string
  organization: string
  location: string
  role: string
  dates: string
  items: ResumeItem[]
}

export interface SkillCategory {
  label: string
  items: string
}

export interface SkillSet {
  id: string
  variant: string
  label: string
  categories: SkillCategory[]
}

export interface Summary {
  id: string
  variant: string
  content: string
}

export interface PersonalInfoData {
  name: string
  title: string
  email: string
  phone: string
  linkedin: string
  github: string
  portfolio: string
  address: string
}

export interface Education {
  university: string
  location: string
  degree: string
  gpa: string
  startYear: string
  endYear?: string
}

export interface ResumeData {
  personalInfo: PersonalInfoData
  education: Education
  summaries: Summary[]
  experiences: Experience[]
  projects: Project[]
  activities: Activity[]
  skills: SkillSet[]
}

export interface Selection {
  summaryId: string | null
  experienceId: string | null
  projectIds: string[]
  activityIds: string[]
  skillsId: string | null
  sectionOrder: string[]
  projectsSectionTitle: string
  compactPdf: boolean
}

// Context
interface AppContextType {
  data: ResumeData | null
  selection: Selection
  setSelection: React.Dispatch<React.SetStateAction<Selection>>
  refreshData: () => Promise<void>
  addToast: (message: string, type: 'success' | 'error' | 'info') => void
}

export const AppContext = createContext<AppContextType | null>(null)
export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppContext')
  return ctx
}

type ModalConfig = {
  type: 'project' | 'experience' | 'activity' | 'skill' | 'summary'
  mode: 'add' | 'edit'
  data?: any
} | null

function App() {
  const allSections = ['summary', 'education', 'experience', 'projects', 'activities', 'skills']

  const [data, setData] = useState<ResumeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('personal')
  const [selection, setSelection] = useState<Selection>({
    summaryId: null,
    experienceId: null,
    projectIds: [],
    activityIds: [],
    skillsId: null,
    sectionOrder: [...allSections],
    projectsSectionTitle: 'Projects',
    compactPdf: false
  })
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [compiling, setCompiling] = useState(false)
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; type: string }>>([])
  const [modal, setModal] = useState<ModalConfig>(null)

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/data')
      const json = await res.json()
      setData(json)
    } catch (err) {
      addToast('Failed to load data', 'error')
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => { fetchData() }, [fetchData])

  // Auto-select defaults when data loads
  useEffect(() => {
    if (data && selection.experienceId === null) {
      setSelection(prev => ({
        ...prev,
        summaryId: data.summaries?.[0]?.id || null,
        experienceId: data.experiences[0]?.id || null,
        projectIds: data.projects.slice(0, 5).map(p => p.id),
        activityIds: data.activities.map(a => a.id),
        skillsId: data.skills[0]?.id || null,
      }))
    }
  }, [data, selection.experienceId])

  const handleCompile = async () => {
    setCompiling(true)
    try {
      const res = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selection)
      })
      const json = await res.json()
      if (json.success) {
        setPdfUrl(json.pdfUrl)
        addToast('CV compiled successfully!', 'success')
      } else {
        addToast('Compilation failed: ' + (json.error || 'Unknown error'), 'error')
      }
    } catch (err) {
      addToast('Compilation failed', 'error')
    } finally {
      setCompiling(false)
    }
  }

  const handleDownload = () => {
    if (pdfUrl) {
      const filename = pdfUrl.split('/').pop()
      window.open(`/api/download/${filename}`, '_blank')
    }
  }

  const openModal = (config: ModalConfig) => setModal(config)
  const closeModal = () => setModal(null)

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: '👤' },
    { id: 'summary', label: 'Summary', icon: '📝' },
    { id: 'education', label: 'Education', icon: '🎓' },
    { id: 'experience', label: 'Experience', icon: '💼' },
    { id: 'projects', label: 'Projects', icon: '🚀' },
    { id: 'activities', label: 'Activities', icon: '🏆' },
    { id: 'skills', label: 'Skills', icon: '⚡' },
  ]

  const moveSection = (idx: number, direction: 'up' | 'down') => {
    const newOrder = [...selection.sectionOrder]
    if (direction === 'up' && idx > 0) {
        [newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]]
    } else if (direction === 'down' && idx < newOrder.length - 1) {
        [newOrder[idx + 1], newOrder[idx]] = [newOrder[idx], newOrder[idx + 1]]
    }
    setSelection({ ...selection, sectionOrder: newOrder })
  }

  const hideSection = (section: string) => {
    setSelection(prev => ({
      ...prev,
      sectionOrder: prev.sectionOrder.filter(s => s !== section)
    }))
  }

  const showSection = (section: string) => {
    setSelection(prev => {
      if (prev.sectionOrder.includes(section)) return prev
      return {
        ...prev,
        sectionOrder: [...prev.sectionOrder, section]
      }
    })
  }

  const hiddenSections = allSections.filter(s => !selection.sectionOrder.includes(s))

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="spinner" style={{ width: 48, height: 48 }} />
      </div>
    )
  }

  return (
    <AppContext.Provider value={{ data, selection, setSelection, refreshData: fetchData, addToast }}>
      <div className="app-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">CV</div>
            <h1>CV Builder</h1>
          </div>

          <nav className="sidebar-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="icon">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>

          <div style={{ padding: '0 16px', marginTop: 16 }}>
            <h3 style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 8, letterSpacing: '0.5px' }}>Section Order</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {selection.sectionOrder.map((section, idx) => (
                <div key={section} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', fontSize: 12 }}>
                  <span style={{ textTransform: 'capitalize' }}>{section}</span>
                  <div style={{ display: 'flex', gap: 2 }}>
                    <button className="btn btn-ghost" style={{ padding: '0 4px' }} disabled={idx === 0} onClick={() => moveSection(idx, 'up')}>↑</button>
                    <button className="btn btn-ghost" style={{ padding: '0 4px' }} disabled={idx === selection.sectionOrder.length - 1} onClick={() => moveSection(idx, 'down')}>↓</button>
                    <button className="btn btn-ghost" style={{ padding: '0 4px' }} onClick={() => hideSection(section)} title="Hide section">✕</button>
                  </div>
                </div>
              ))}
            </div>

            {hiddenSections.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <h3 style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 6, letterSpacing: '0.5px' }}>Hidden Sections</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {hiddenSections.map(section => (
                    <div key={section} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', fontSize: 12 }}>
                      <span style={{ textTransform: 'capitalize' }}>{section}</span>
                      <button className="btn btn-ghost" style={{ padding: '0 4px' }} onClick={() => showSection(section)} title="Show section">＋</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: 10 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={selection.compactPdf}
                  onChange={e => setSelection(prev => ({ ...prev, compactPdf: e.target.checked }))}
                />
                Compact PDF layout (fit one page)
              </label>
            </div>
          </div>

          <div className="sidebar-actions">
            <div className="nav-divider" />
            <button
              className="btn btn-primary btn-full"
              onClick={handleCompile}
              disabled={compiling}
            >
              {compiling ? (
                <><div className="spinner" style={{ width: 16, height: 16 }} /> Compiling...</>
              ) : (
                <>📄 Compile CV</>
              )}
            </button>
            {pdfUrl && (
              <button className="btn btn-secondary btn-full" onClick={handleDownload}>
                ⬇️ Download PDF
              </button>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <div className="editor-panel">
            {activeTab === 'personal' && <PersonalInfo />}
            {activeTab === 'summary' && <SummarySection onEdit={(s) => openModal({ type: 'summary', mode: 'edit', data: s })} onAdd={() => openModal({ type: 'summary', mode: 'add' })} />}
            {activeTab === 'education' && <EducationSection />}
            {activeTab === 'experience' && <ExperienceSection onEdit={(exp) => openModal({ type: 'experience', mode: 'edit', data: exp })} onAdd={() => openModal({ type: 'experience', mode: 'add' })} />}
            {activeTab === 'activities' && <ActivitiesSection onEdit={(act) => openModal({ type: 'activity', mode: 'edit', data: act })} onAdd={() => openModal({ type: 'activity', mode: 'add' })} />}
            {activeTab === 'projects' && <ProjectsSection onEdit={(proj) => openModal({ type: 'project', mode: 'edit', data: proj })} onAdd={() => openModal({ type: 'project', mode: 'add' })} />}
            {activeTab === 'skills' && <SkillsSection onEdit={(skill) => openModal({ type: 'skill', mode: 'edit', data: skill })} onAdd={() => openModal({ type: 'skill', mode: 'add' })} />}
          </div>

          {/* PDF Preview */}
          <div className="preview-panel">
            <PdfPreview pdfUrl={pdfUrl} compiling={compiling} onCompile={handleCompile} />
          </div>
        </main>

        {/* Modal */}
        {modal && (
          <EditModal config={modal} onClose={closeModal} />
        )}

        {/* Toasts */}
        <Toast toasts={toasts} />
      </div>
    </AppContext.Provider>
  )
}

export default App
