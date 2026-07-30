import { useState } from 'react'
import { getMe, updateMe } from '../api/client'

export default function Profile({ user, setUser }) {
  const [form, setForm] = useState({
    name: user?.name || '',
    headline: user?.headline || '',
    about: user?.about || '',
    skills: user?.skills || '',
    resume_text: user?.resume_text || '',
    github_username: user?.github_username || '',
    linkedin_url: user?.linkedin_url || '',
    portfolio_url: user?.portfolio_url || '',
    min_salary_expectation: user?.min_salary_expectation || 0,
  })
  const [saving, setSaving] = useState(false)

  const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateMe(form)
      const updated = await getMe()
      localStorage.setItem('user', JSON.stringify(updated.data))
      setUser(updated.data)
      alert('Profile updated!')
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-6">Profile & Settings</h1>

      <div className="bg-dark-900 border border-dark-800 rounded-xl p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-dark-300 mb-1">Name</label>
            <input value={form.name} onChange={e => handleChange('name', e.target.value)}
              className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm text-dark-300 mb-1">Headline</label>
            <input value={form.headline} onChange={e => handleChange('headline', e.target.value)} placeholder="e.g. AI Systems Engineer"
              className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm text-dark-300 mb-1">About</label>
          <textarea value={form.about} onChange={e => handleChange('about', e.target.value)} rows={3}
            className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none resize-none" />
        </div>

        <div>
          <label className="block text-sm text-dark-300 mb-1">Skills (comma separated)</label>
          <input value={form.skills} onChange={e => handleChange('skills', e.target.value)} placeholder="Python, Rust, Swift, LangGraph, FastAPI"
            className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none" />
        </div>

        <div>
          <label className="block text-sm text-dark-300 mb-1">Resume Text (base version for ATS generation)</label>
          <textarea value={form.resume_text} onChange={e => handleChange('resume_text', e.target.value)} rows={8}
            className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-white text-sm font-mono focus:border-blue-500 focus:outline-none resize-none" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-dark-300 mb-1">GitHub Username</label>
            <input value={form.github_username} onChange={e => handleChange('github_username', e.target.value)} placeholder="Sneh30"
              className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm text-dark-300 mb-1">LinkedIn URL</label>
            <input value={form.linkedin_url} onChange={e => handleChange('linkedin_url', e.target.value)}
              className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm text-dark-300 mb-1">Portfolio URL</label>
            <input value={form.portfolio_url} onChange={e => handleChange('portfolio_url', e.target.value)}
              className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm text-dark-300 mb-1">Minimum Salary Expectation ($/year)</label>
          <input type="number" value={form.min_salary_expectation} onChange={e => handleChange('min_salary_expectation', Number(e.target.value))}
            className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none" />
        </div>

        <button onClick={handleSave} disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  )
}
