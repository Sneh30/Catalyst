import { useState, useEffect } from 'react'
import { generateContent, getContentHistory, getContent, updateContentStatus } from '../api/client'

const CONTENT_TYPES = [
  { value: 'linkedin_post', label: 'LinkedIn Post' },
  { value: 'blog', label: 'Blog Post' },
  { value: 'twitter_thread', label: 'Twitter/X Thread' },
  { value: 'architecture_post', label: 'Architecture Deep-Dive' },
]

export default function ContentStudio({ user }) {
  const [type, setType] = useState('linkedin_post')
  const [project, setProject] = useState('')
  const [topic, setTopic] = useState('')
  const [generated, setGenerated] = useState('')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('generate')

  useEffect(() => {
    if (tab === 'history') loadHistory()
  }, [tab])

  const loadHistory = async () => {
    try {
      const res = await getContentHistory()
      setHistory(res.data)
    } catch {}
  }

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const res = await generateContent(type, project, topic)
      setGenerated(res.data.content)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generated)
    alert('Copied!')
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Content Studio</h1>

      <div className="flex gap-1 mb-6 bg-dark-900 rounded-lg p-1 w-fit">
        <button onClick={() => setTab('generate')} className={`px-4 py-2 rounded-md text-sm ${tab === 'generate' ? 'bg-blue-600 text-white' : 'text-dark-400 hover:text-white'}`}>Generate</button>
        <button onClick={() => setTab('history')} className={`px-4 py-2 rounded-md text-sm ${tab === 'history' ? 'bg-blue-600 text-white' : 'text-dark-400 hover:text-white'}`}>History ({history.length})</button>
      </div>

      {tab === 'generate' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-5 space-y-4">
            <div>
              <label className="block text-sm text-dark-300 mb-1">Content Type</label>
              <select value={type} onChange={e => setType(e.target.value)}
                className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none">
                {CONTENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-dark-300 mb-1">Source Project</label>
              <input value={project} onChange={e => setProject(e.target.value)} placeholder="e.g. PromptOS, DeepOps"
                className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-dark-300 mb-1">Topic (optional)</label>
              <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Architecture decisions, lessons learned"
                className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <button onClick={handleGenerate} disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              {loading ? 'Generating...' : 'Generate Content'}
            </button>
          </div>

          <div>
            {generated ? (
              <div className="bg-dark-900 border border-dark-800 rounded-xl p-5">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-sm font-medium text-white">Generated {type.replace('_', ' ')}</h2>
                  <button onClick={handleCopy} className="text-xs text-blue-400 hover:text-blue-300">Copy</button>
                </div>
                <pre className="whitespace-pre-wrap text-sm text-dark-200 bg-dark-800 p-4 rounded-lg max-h-96 overflow-y-auto">{generated}</pre>
              </div>
            ) : (
              <div className="bg-dark-900 border border-dark-800 rounded-xl p-10 text-center h-full flex items-center justify-center">
                <p className="text-dark-500">Generated content will appear here</p>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div>
          {history.length === 0 ? (
            <div className="bg-dark-900 border border-dark-800 rounded-xl p-10 text-center">
              <p className="text-dark-500">No content generated yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div key={item.id} className="bg-dark-800 border border-dark-700 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-white font-medium text-sm">{item.title || item.type}</h3>
                      <p className="text-dark-400 text-xs mt-1">{item.type} • {item.source_project || 'General'}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded ${item.status === 'posted' ? 'bg-green-900/50 text-green-400' : item.status === 'draft' ? 'bg-amber-900/50 text-amber-400' : 'bg-blue-900/50 text-blue-400'}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-dark-500 text-xs mt-2 line-clamp-2">{item.body_preview}...</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
