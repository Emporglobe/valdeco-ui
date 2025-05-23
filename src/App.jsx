// UI Web pentru Valdeco SaaS - cu auto-login admin pentru dev

import { useState, useEffect, useContext, createContext } from 'react'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Card, CardContent } from './components/ui/card'
import { createClient } from '@supabase/supabase-js'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom'

const supabase = createClient(
  'https://iptulisluwyopmlxwvfh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwdHVsaXNsdXd5b3BtbHh3dmZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2MDc0NDksImV4cCI6MjA2MTE4MzQ0OX0.tQ6AehwrMCv-e08DY5LxVCEgWPDNy2YyMoJhBjmhR5U'
)

const UserContext = createContext()

function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        setLoading(false)
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: 'adriannegru1706@gmail.com',
          password: 'Dididada1'
        })
        const { data: { user: loggedInUser } } = await supabase.auth.getUser()
        setUser(loggedInUser)
        setLoading(false)
      }
    }
    checkUser()
  }, [])

  const signInWithEmail = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    return { error }
  }

  return (
    <UserContext.Provider value={{ user, loading, signInWithEmail }}>
      {children}
    </UserContext.Provider>
  )
}

function useUser() {
  return useContext(UserContext)
}

function Login() {
  const { signInWithEmail } = useUser()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const navigate = useNavigate()

  const handleLogin = async () => {
    const { error } = await signInWithEmail(email, password)
    if (error) setErrorMsg('Login failed. Check credentials.')
    else navigate('/dashboard')
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <Card>
        <CardContent>
          <h2 className="text-xl mb-4 font-bold">Login to Valdeco Flows</h2>
          <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="mb-2" />
          <Input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="mb-4" />
          <Button onClick={handleLogin}>Login</Button>
          {errorMsg && <p className="text-red-600 mt-2">{errorMsg}</p>}
        </CardContent>
      </Card>
    </div>
  )
}

function Dashboard() {
  const { user, loading } = useUser()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) navigate('/login')
  }, [user, loading])

  if (loading) return <p className="p-8">Loading...</p>
  if (!user) return null

  const flows = [
    { id: 'telegram-bot-voice', name: 'Telegram Bot Text + Voice', status: 'active' },
    { id: 'gmap-scraper', name: 'Google Maps Scraper', status: 'pending' },
  ]

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Welcome, {user.email}</h1>
      <div className="space-y-4">
        {flows.map(flow => (
          <Card key={flow.id}>
            <CardContent>
              <h2 className="text-xl font-semibold">{flow.name}</h2>
              <p>Status: {flow.status}</p>
              <Link to={`/docs/${flow.id}`} className="text-blue-500 underline">Manual PDF</Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function FlowDocs() {
  const { flowId } = useParams()
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Documentație pentru {flowId}</h1>
      <p>Vezi instrucțiunile PDF mai jos:</p>
      <a
        href={`https://flows.vade-coin.com/pdfs/${flowId}.pdf`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline"
      >
        Descarcă PDF
      </a>
    </div>
  )
}

export default function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/docs/:flowId" element={<FlowDocs />} />
        </Routes>
      </Router>
    </UserProvider>
  )
}
