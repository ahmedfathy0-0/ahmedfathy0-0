interface Props {
  pdfUrl: string | null
  compiling: boolean
  onCompile: () => void
}

export default function PdfPreview({ pdfUrl, compiling, onCompile }: Props) {
  return (
    <>
      <div className="preview-header">
        <h2>📋 PDF Preview</h2>
        <button
          className="btn btn-primary btn-sm"
          onClick={onCompile}
          disabled={compiling}
        >
          {compiling ? '⏳ Compiling...' : '🔄 Compile'}
        </button>
      </div>
      <div className="preview-content" style={{ position: 'relative' }}>
        {compiling && (
          <div className="loading-overlay">
            <div className="spinner" style={{ width: 40, height: 40 }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Compiling LaTeX...</p>
          </div>
        )}
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            title="PDF Preview"
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <div className="preview-placeholder">
            <div className="icon">📄</div>
            <p style={{ fontSize: 16, fontWeight: 500 }}>No PDF generated yet</p>
            <p style={{ fontSize: 13, maxWidth: 280, textAlign: 'center', lineHeight: 1.5 }}>
              Select your projects, experience, and skills, then click <strong>"Compile CV"</strong> to generate your resume.
            </p>
            <button className="btn btn-primary" onClick={onCompile} style={{ marginTop: 12 }}>
              📄 Compile CV
            </button>
          </div>
        )}
      </div>
    </>
  )
}
