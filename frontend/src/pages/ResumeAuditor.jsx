import { useState } from 'react'
import { auditResume, optimizeResume, getMe, updateMe } from '../api/client'

export default function ResumeAuditor({ user }) {
  const [resumeText, setResumeText] = useState(user?.resume_text || '')
  const [audit, setAudit] = useState(null)
  const [optimized, setOptimized] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('audit')

  const handleAudit = async () => {
    if (!resumeText.trim()) return
    setLoading(true)
    setAudit(null)
    try {
      const res = await auditResume(resumeText)
      setAudit(res.data.audit)
      await updateMe({ resume_text: resumeText })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleOptimize = async () => {
    if (!resumeText.trim()) return
    setLoading(true)
    try {
      const res = await optimizeResume(resumeText)
      setOptimized(res.data.optimized)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Resume Auditor</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-dark-900 border border-dark-800 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-white mb-3">Your Resume</h2>
          <textarea
            value={resumeText}
            onChange={e => setResumeText(e.target.value)}
            className="w-full h-80 bg-dark-800 border border-dark-700 rounded-lg p-3 text-sm text-dark-200 font-mono focus:border-blue-500 focus:outline-none resize-none"
            placeholder="Paste your resume text here..."
          />
          <div className="flex gap-3 mt-3">
            <button onClick={handleAudit} disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              {loading ? 'Processing...' : 'Audit Resume'}
            </button>
            <button onClick={handleOptimize} disabled={loading}
              className="bg-dark-700 hover:bg-dark-600 text-dark-200 px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50">
              Optimize ATS
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {audit && (
            <div className="bg-dark-900 border border-dark-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Audit Results</h2>
                <span className={`text-2xl font-bold ${audit.score >= 70 ? 'text-green-400' : audit.score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                  {audit.score}/100
                </span>
              </div>

              <div className="space-y-4 text-sm">
                {audit.strengths?.length > 0 && (
                  <div>
                    <p className="text-green-400 font-medium mb-1">Strengths</p>
                    <ul className="space-y-1">{audit.strengths.map((s, i) => <li key={i} className="text-dark-300">✓ {s}</li>)}</ul>
                  </div>
                )}
                {audit.weaknesses?.length > 0 && (
                  <div>
                    <p className="text-red-400 font-medium mb-1">Weaknesses</p>
                    <ul className="space-y-1">{audit.weaknesses.map((w, i) => <li key={i} className="text-dark-300">✗ {w}</li>)}</ul>
                  </div>
                )}
                {audit.suggestions?.length > 0 && (
                  <div>
                    <p className="text-blue-400 font-medium mb-1">Suggestions</p>
                    <ul className="space-y-1">{audit.suggestions.map((s, i) => <li key={i} className="text-dark-300">→ {s}</li>)}</ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {optimized && (
            <div className="bg-dark-900 border border-dark-800 rounded-xl p-5">
              <h2 className="text-lg font-semibold text-white mb-3">ATS Optimized</h2>
              <pre className="whitespace-pre-wrap text-sm text-dark-200 font-mono bg-dark-800 p-3 rounded-lg max-h-80 overflow-y-auto">{optimized}</pre>
            </div>
          )}

          {!audit && !optimized && (
            <div className="bg-dark-900 border border-dark-800 rounded-xl p-5 flex items-center justify-center h-48">
              <p className="text-dark-500 text-sm">Paste your resume and click Audit to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
