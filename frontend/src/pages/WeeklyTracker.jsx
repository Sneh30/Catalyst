import { useState, useEffect } from 'react'
import { getCurrentWeek, saveWeekly, generateWeeklyReview } from '../api/client'

const METRIC_FIELDS = [
  { key: 'applications', label: 'Applications Sent', type: 'number' },
  { key: 'interviews', label: 'Interviews', type: 'number' },
  { key: 'recruiter_messages', label: 'Recruiter Messages', type: 'number' },
  { key: 'github_commits', label: 'GitHub Commits', type: 'number' },
  { key: 'linkedin_posts', label: 'LinkedIn Posts', type: 'number' },
  { key: 'projects_shipped', label: 'Projects Shipped', type: 'number' },
  { key: 'leetcode_solved', label: 'LeetCode Problems', type: 'number' },
  { key: 'networking_calls', label: 'Networking Calls', type: 'number' },
]

export default function WeeklyTracker({ user }) {
  const [week, setWeek] = useState(null)
  const [metrics, setMetrics] = useState({})
  const [achievementInput, setAchievementInput] = useState('')
  const [achievements, setAchievements] = useState([])
  const [missedInput, setMissedInput] = useState('')
  const [missed, setMissed] = useState([])
  const [prioritiesInput, setPrioritiesInput] = useState('')
  const [priorities, setPriorities] = useState([])
  const [notes, setNotes] = useState('')
  const [review, setReview] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadCurrentWeek()
  }, [])

  const loadCurrentWeek = async () => {
    try {
      const res = await getCurrentWeek()
      const data = res.data
      setWeek(data.week_start)
      setMetrics(data.metrics || {})
      setAchievements(data.achievements || [])
      setMissed(data.missed_opportunities || [])
      setPriorities(data.next_week_priorities || [])
      setNotes(data.notes || '')
    } catch {}
  }

  const addItem = (list, setter, input, setInput) => {
    if (input.trim()) {
      setter([...list, input.trim()])
      setInput('')
    }
  }

  const removeItem = (list, setter, index) => {
    setter(list.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await saveWeekly(metrics, achievements, missed, priorities, notes)
      alert('Week saved!')
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleReview = async () => {
    setLoading(true)
    try {
      const res = await generateWeeklyReview()
      setReview(res.data.review)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Weekly Tracker</h1>
      <p className="text-dark-400 text-sm mb-6">Week starting {week || '...'}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-white mb-4">KPIs</h2>
            <div className="grid grid-cols-2 gap-3">
              {METRIC_FIELDS.map((f) => (
                <div key={f.key}>
                  <label className="block text-xs text-dark-400 mb-1">{f.label}</label>
                  <input type={f.type} value={metrics[f.key] || ''} onChange={e => setMetrics({...metrics, [f.key]: Number(e.target.value)})}
                    className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-1.5 text-white text-sm focus:border-blue-500 focus:outline-none" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-dark-900 border border-dark-800 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-white mb-3">Achievements</h2>
            <div className="flex gap-2 mb-3">
              <input value={achievementInput} onChange={e => setAchievementInput(e.target.value)} placeholder="Add achievement..."
                className="flex-1 bg-dark-800 border border-dark-700 rounded-lg px-3 py-1.5 text-white text-sm focus:border-blue-500 focus:outline-none"
                onKeyDown={e => e.key === 'Enter' && addItem(achievements, setAchievements, achievementInput, setAchievementInput)} />
              <button onClick={() => addItem(achievements, setAchievements, achievementInput, setAchievementInput)}
                className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm">Add</button>
            </div>
            <ul className="space-y-1">
              {achievements.map((a, i) => (
                <li key={i} className="flex justify-between items-center text-sm text-dark-300 bg-dark-800 rounded px-2 py-1">
                  <span>• {a}</span>
                  <button onClick={() => removeItem(achievements, setAchievements, i)} className="text-red-400 text-xs hover:text-red-300">✕</button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-white mb-3">Missed Opportunities</h2>
            <div className="flex gap-2 mb-3">
              <input value={missedInput} onChange={e => setMissedInput(e.target.value)} placeholder="What could have gone better?"
                className="flex-1 bg-dark-800 border border-dark-700 rounded-lg px-3 py-1.5 text-white text-sm focus:border-blue-500 focus:outline-none"
                onKeyDown={e => e.key === 'Enter' && addItem(missed, setMissed, missedInput, setMissedInput)} />
              <button onClick={() => addItem(missed, setMissed, missedInput, setMissedInput)}
                className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm">Add</button>
            </div>
            <ul className="space-y-1">
              {missed.map((m, i) => (
                <li key={i} className="flex justify-between items-center text-sm text-dark-300 bg-dark-800 rounded px-2 py-1">
                  <span>• {m}</span>
                  <button onClick={() => removeItem(missed, setMissed, i)} className="text-red-400 text-xs hover:text-red-300">✕</button>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-dark-900 border border-dark-800 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-white mb-3">Next Week Priorities</h2>
            <div className="flex gap-2 mb-3">
              <input value={prioritiesInput} onChange={e => setPrioritiesInput(e.target.value)} placeholder="Top priority for next week..."
                className="flex-1 bg-dark-800 border border-dark-700 rounded-lg px-3 py-1.5 text-white text-sm focus:border-blue-500 focus:outline-none"
                onKeyDown={e => e.key === 'Enter' && addItem(priorities, setPriorities, prioritiesInput, setPrioritiesInput)} />
              <button onClick={() => addItem(priorities, setPriorities, prioritiesInput, setPrioritiesInput)}
                className="bg-violet-600 text-white px-3 py-1.5 rounded-lg text-sm">Add</button>
            </div>
            <ul className="space-y-1">
              {priorities.map((p, i) => (
                <li key={i} className="flex justify-between items-center text-sm text-dark-300 bg-dark-800 rounded px-2 py-1">
                  <span>→ {p}</span>
                  <button onClick={() => removeItem(priorities, setPriorities, i)} className="text-red-400 text-xs hover:text-red-300">✕</button>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-dark-900 border border-dark-800 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-white mb-3">Notes</h2>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              className="w-full h-24 bg-dark-800 border border-dark-700 rounded-lg p-3 text-sm text-dark-200 focus:border-blue-500 focus:outline-none resize-none" />
          </div>

          <div className="flex gap-3">
            <button onClick={handleSave} disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Week'}
            </button>
            <button onClick={handleReview} disabled={loading}
              className="bg-dark-700 hover:bg-dark-600 text-dark-200 px-6 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50">
              Generate AI Review
            </button>
          </div>

          {review && (
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-5 mt-4">
              <h3 className="text-sm font-medium text-white mb-2">AI Weekly Review</h3>
              <pre className="whitespace-pre-wrap text-sm text-dark-300">{review}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
