interface Props {
  toasts: Array<{ id: number; message: string; type: string }>
}

export default function Toast({ toasts }: Props) {
  if (toasts.length === 0) return null

  const icons: Record<string, string> = {
    success: '✅',
    error: '❌',
    info: 'ℹ️'
  }

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast ${toast.type}`}>
          <span>{icons[toast.type] || 'ℹ️'}</span>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  )
}
