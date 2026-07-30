import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchJobs, saveJobs, getSavedJobs, matchJob, markApplied } from '../api/client'

export default function JobScanner({ user }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [minSalary, setMinSalary] = useState(user?.min_salary_expectation || 0)
  const [results, setResults] = useState([])
  const [saved, setSaved] = useState([])
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('search')

  useEffect(() => {
    if (tab === 'saved') loadSaved()
  }, [tab])

  const loadSaved = async () => {
    try {
      const res = await getSavedJobs()
      setSaved(res.data)
    } catch {}
  }

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    try {
      const res = await searchJobs(query, location, minSalary, 50)
      setResults(res.data.jobs || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleSave = async (jobs) => {
    try {
      await saveJobs(jobs)
      alert('Jobs saved!')
    } catch (e) { console.error(e) }
  }

  const handleMatch = async (jobId) => {
    try {
      await matchJob(jobId)
      loadSaved()
    } catch (e) { alert(e.response?.data?.detail || 'Match failed') }
  }

  const toggleTab = (t) => setTab(t)

  const JobCard = ({ job, isSaved }) => (
    <div className="bg-dark-800 border border-dark-700 rounded-lg p-4 text-sm">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-white font-medium">{job.title}</h3>
          <p className="text-dark-400">{job.company} • {job.location || 'Remote'}</p>
        </div>
        {job.match_score > 0 && (
          <span className={`text-xs font-bold px-2 py-1 rounded ${job.match_score >= 70 ? 'bg-green-900/50 text-green-400' : 'bg-amber-900/50 text-amber-400'}`}>
            {Math.round(job.match_score)}%
          </span>
        )}
      </div>
      <p className="text-dark-500 mt-2 text-xs line-clamp-2">{job.description?.slice(0, 200)}</p>
      <div className="flex gap-2 mt-3">
        {job.salary_min > 0 && <span className="text-xs text-emerald-400">${Math.round(job.salary_min).toLocaleString()}-${Math.round(job.salary_max).toLocaleString()}</span>}
        <span className="text-xs text-dark-500">{job.source}</span>
      </div>
    </div>
  )

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Job Scanner</h1>

      <div className="flex gap-1 mb-6 bg-dark-900 rounded-lg p-1 w-fit">
        <button onClick={() => toggleTab('search')} className={`px-4 py-2 rounded-md text-sm ${tab === 'search' ? 'bg-blue-600 text-white' : 'text-dark-400 hover:text-white'}`}>Search</button>
        <button onClick={() => toggleTab('saved')} className={`px-4 py-2 rounded-md text-sm ${tab === 'saved' ? 'bg-blue-600 text-white' : 'text-dark-400 hover:text-white'}`}>Saved ({saved.length})</button>
      </div>

      {tab === 'search' && (
        <div>
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-5 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <label className="block text-sm text-dark-300 mb-1">Job Title / Keywords</label>
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="e.g. AI Engineer"
                  className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-dark-300 mb-1">Location</label>
                <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Bangalore"
                  className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-dark-300 mb-1">Min Salary ($)</label>
                <input type="number" value={minSalary} onChange={e => setMinSalary(Number(e.target.value))} placeholder="0"
                  className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none" />
              </div>
            </div>
            <button onClick={handleSearch} disabled={loading}
              className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              {loading ? 'Searching Indeed + LinkedIn + Google...' : 'Search All Sources'}
            </button>
          </div>

          {results.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <p className="text-dark-400 text-sm">{results.length} jobs found</p>
                <button onClick={() => handleSave(results)} className="text-blue-400 hover:text-blue-300 text-sm">Save All to Account</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {results.map((job, i) => <JobCard key={i} job={job} />)}
              </div>
            </div>
          )}

          {results.length === 0 && !loading && (
            <div className="bg-dark-900 border border-dark-800 rounded-xl p-10 text-center">
              <p className="text-dark-500">Search for jobs to see results from Indeed, LinkedIn, and Google Jobs</p>
            </div>
          )}
        </div>
      )}

      {tab === 'saved' && (
        <div>
          {saved.length === 0 ? (
            <div className="bg-dark-900 border border-dark-800 rounded-xl p-10 text-center">
              <p className="text-dark-500">No saved jobs. Search and save jobs first.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {saved.map((job) => (
                <div key={job.id} className="bg-dark-800 border border-dark-700 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-white font-medium">{job.title}</h3>
                      <p className="text-dark-400 text-sm">{job.company} • {job.location || 'Remote'}</p>
                    </div>
                    {job.match_score > 0 && (
                      <span className={`text-xs font-bold px-2 py-1 rounded ${job.match_score >= 70 ? 'bg-green-900/50 text-green-400' : 'bg-amber-900/50 text-amber-400'}`}>
                        {Math.round(job.match_score)}%
                      </span>
                    )}
                  </div>
                  <p className="text-dark-500 text-xs mt-2 line-clamp-2">{job.description}</p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {job.salary_min > 0 && <span className="text-xs text-emerald-400">${Math.round(job.salary_min).toLocaleString()}-${Math.round(job.salary_max).toLocaleString()}</span>}
                    <span className="text-xs text-dark-500">{job.source}</span>
                    {!job.match_score && (
                      <button onClick={() => handleMatch(job.id)} className="text-xs text-blue-400 hover:text-blue-300">Match with Resume</button>
                    )}
                    <button onClick={() => navigate(`/jobs/generate/${job.id}`)} className="text-xs text-violet-400 hover:text-violet-300">
                      Generate ATS Resume
                    </button>
                    {!job.is_applied && <button onClick={() => markApplied(job.id).then(loadSaved)} className="text-xs text-green-400 hover:text-green-300">Mark Applied</button>}
                    {job.is_applied && <span className="text-xs text-green-500">✓ Applied</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
