import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Kanban from './components/Kanban/Kanban'
import KanbanDashboard from './components/KanbanDashboard/KanbanDashboard'
import LandingPage from './pages/LandingPage/LandingPage'
import Auth from './pages/Auth/Auth'
import Profile from './pages/Profile/Profile'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<KanbanDashboard />} />
          <Route path="/kanban" element={<KanbanDashboard />} />
          <Route path="/kanban/:boardName" element={<Kanban />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
