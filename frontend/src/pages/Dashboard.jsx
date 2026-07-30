import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCurrentWeek, getGeneratedResumes } from '../api/client'

export default function Dashboard({ user }) {
  const [week, setWeek] = useState(null)
  const [resumes, setResumes] = useState([])

  useEffect(() => {
    getCurrentWeek().then(r => setWeek(r.data)).catch(() => {})
    getGeneratedResumes().then(r => setResumes(r.data)).catch(() => {})
  }, [])

  const modules = [
    { title: 'Resume Auditor', desc: 'Score, audit, and optimize your resume for ATS', path: '/resume', color: 'from-blue-600 to-blue-800' },
    { title: 'Job Scanner', desc: 'Search all job portals with pay filters', path: '/jobs', color: 'from-emerald-600 to-emerald-800' },
    { title: 'ATS Resume Generator', desc: 'Generate tailored resumes per job listing', path: '/jobs', color: 'from-violet-600 to-violet-800' },
    { title: 'Content Studio', desc: 'Generate LinkedIn posts, blogs, and threads', path: '/content', color: 'from-amber-600 to-amber-800' },
    { title: 'Weekly Tracker', desc: 'Track progress, KPIs, and generate reviews', path: '/tracker', color: 'from-rose-600 to-rose-800' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-dark-400 mt-1">Welcome back, {user?.name || 'Engineer'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {modules.map((m) => (
          <Link key={m.path} to={m.path}
            className={`bg-gradient-to-br ${m.color} rounded-xl p-5 hover:opacity-90 transition-opacity`}>
            <h3 className="text-white font-semibold text-lg">{m.title}</h3>
            <p className="text-white/70 text-sm mt-2">{m.desc}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-dark-900 border border-dark-800 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-white mb-4">This Week</h2>
          {week ? (
            <div className="space-y-3 text-sm">
              <p className="text-dark-300">Week starting {week.week_start}</p>
              {week.achievements?.length > 0 && (
                <div>
                  <p className="text-dark-400 text-xs uppercase tracking-wider mb-1">Achievements</p>
                  <ul className="space-y-1">
                    {week.achievements.map((a, i) => <li key={i} className="text-dark-200">• {a}</li>)}
                  </ul>
                </div>
              )}
              {!week.achievements?.length && <p className="text-dark-500 italic">No entries yet. Go to Tracker to log your week.</p>}
            </div>
          ) : <p className="text-dark-500 text-sm">Loading...</p>}
        </div>

        <div className="bg-dark-900 border border-dark-800 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Resumes</h2>
          {resumes.length > 0 ? (
            <div className="space-y-2">
              {resumes.slice(0, 5).map((r) => (
                <div key={r.id} className="flex justify-between items-center text-sm p-2 bg-dark-800 rounded-lg">
                  <span className="text-dark-200">{r.job_title} @ {r.company}</span>
                  <span className="text-dark-400">{r.ats_score}/100</span>
                </div>
              ))}
            </div>
          ) : <p className="text-dark-500 text-sm">No tailored resumes yet. Search jobs to generate one.</p>}
        </div>
      </div>
    </div>
  )
}
