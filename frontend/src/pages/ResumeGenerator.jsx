import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getSavedJobs, generateResume, acceptGeneratedResume } from '../api/client'

export default function ResumeGenerator({ user }) {
  const { jobId } = useParams()
  const [job, setJob] = useState(null)
  const [generated, setGenerated] = useState(null)
  const [loading, setLoading] = useState(false)
  const [resumeText, setResumeText] = useState(user?.resume_text || '')

  useEffect(() => {
    loadJob()
  }, [jobId])

  const loadJob = async () => {
    try {
      const res = await getSavedJobs()
      const found = res.data.find(j => j.id === Number(jobId))
      if (found) setJob(found)
    } catch {}
  }

  const handleGenerate = async () => {
    if (!job || !resumeText.trim()) return
    setLoading(true)
    try {
      const res = await generateResume(job.id, job.title, job.company, job.description)
      setGenerated(res.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleAccept = async () => {
    if (!generated) return
    try {
      await acceptGeneratedResume(generated.id)
      alert('Resume accepted!')
    } catch {}
  }

  if (!job) return <div className="text-dark-400">Loading job details...</div>

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/jobs" className="text-dark-400 hover:text-white text-sm">← Back to Jobs</Link>
        <h1 className="text-2xl font-bold text-white">ATS Resume Generator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-white mb-2">{job.title}</h2>
            <p className="text-dark-400 text-sm">{job.company} • {job.location || 'Remote'}</p>
            <div className="mt-3 bg-dark-800 rounded-lg p-3 text-sm text-dark-300 max-h-60 overflow-y-auto">
              {job.description || 'No description available'}
            </div>
          </div>

          <div className="bg-dark-900 border border-dark-800 rounded-xl p-5">
            <h3 className="text-sm font-medium text-white mb-2">Your Base Resume</h3>
            <textarea value={resumeText} onChange={e => setResumeText(e.target.value)}
              className="w-full h-48 bg-dark-800 border border-dark-700 rounded-lg p-3 text-sm text-dark-200 font-mono focus:border-blue-500 focus:outline-none resize-none"
              placeholder="Paste your resume to generate a tailored version..." />
            <button onClick={handleGenerate} disabled={loading || !resumeText.trim()}
              className="mt-3 bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              {loading ? 'Generating ATS Resume...' : 'Generate ATS-Optimized Resume'}
            </button>
          </div>
        </div>

        <div>
          {generated ? (
            <div className="bg-dark-900 border border-dark-800 rounded-xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-white">Generated Resume</h2>
                <span className="text-2xl font-bold text-violet-400">{generated.ats_score}/100</span>
              </div>

              <div className="bg-dark-800 rounded-lg p-3 text-sm text-dark-200 font-mono max-h-96 overflow-y-auto whitespace-pre-wrap mb-4">
                {generated.resume}
              </div>

              <div className="bg-dark-800 rounded-lg p-3 text-sm text-dark-300 mb-4">
                <p className="text-blue-400 font-medium mb-1">Match Explanation</p>
                <p>{generated.match_explanation}</p>
              </div>

              <div className="flex gap-3">
                <button onClick={handleAccept} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm">Accept Resume</button>
                <button onClick={handleGenerate} className="bg-dark-700 hover:bg-dark-600 text-dark-200 px-4 py-2 rounded-lg text-sm">Regenerate</button>
              </div>
            </div>
          ) : (
            <div className="bg-dark-900 border border-dark-800 rounded-xl p-10 text-center h-full flex items-center justify-center">
              <div>
                <p className="text-dark-500 mb-2">Generated resume will appear here</p>
                <p className="text-dark-600 text-xs">The AI will tailor your resume to match this job's keywords and requirements</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
