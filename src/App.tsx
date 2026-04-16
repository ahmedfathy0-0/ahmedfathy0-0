import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import PersonalInfo from './components/PersonalInfo'
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
  url: string
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
}

export interface ResumeData {
  personalInfo: PersonalInfoData
  education: Education
  experiences: Experience[]
  projects: Project[]
  activities: Activity[]
  skills: SkillSet[]
}

export interface Selection {
  experienceId: string | null
  projectIds: string[]
  activityIds: string[]
  skillsId: string | null
  sectionOrder: string[]
  projectsSectionTitle: string
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
  type: 'project' | 'experience' | 'activity' | 'skill'
  mode: 'add' | 'edit'
  data?: any
} | null

function App() {
  const [data, setData] = useState<ResumeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('personal')
  const [selection, setSelection] = useState<Selection>({
    experienceId: null,
    projectIds: [],
    activityIds: [],
    skillsId: null,
    sectionOrder: ['education', 'experience', 'activities', 'projects', 'skills'],
    projectsSectionTitle: 'Projects'
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
    { id: 'education', label: 'Education', icon: '🎓' },
    { id: 'experience', label: 'Experience', icon: '💼' },
    { id: 'activities', label: 'Activities', icon: '🏆' },
    { id: 'projects', label: 'Projects', icon: '🚀' },
    { id: 'skills', label: 'Skills', icon: '⚡' },
  ]

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
