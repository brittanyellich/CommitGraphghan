import { Route, Routes } from 'react-router-dom'
import { GitHubCallback } from './routes/authentication'
import GraphGenerator from './components/GraphGenerator'
import FAQ from './components/FAQ'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<GraphGenerator />} />
        <Route path="/callback" element={<GitHubCallback />} />
        <Route path="/faq" element={<FAQ />} />
      </Routes>
      <footer className="w-full py-4 mt-8 border-t text-center text-sm text-muted-foreground bg-background">
        <a href="/faq" className="underline hover:text-primary mx-2">FAQ</a>
        &middot;
        <a href="https://github.com/brittanyellich/commitgraphghan" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary mx-2">GitHub Repo</a>
      </footer>
    </>
  )
}

export default App