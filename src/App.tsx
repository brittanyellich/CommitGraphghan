import { Route, Routes } from 'react-router-dom'
import { GitHubCallback } from './routes/authentication'
import GraphGenerator from './components/GraphGenerator'

function App() {
  return (
    <Routes>
      <Route path="/" element={<GraphGenerator />} />
      <Route path="/callback" element={<GitHubCallback />} />
    </Routes>
  )
}

export default App