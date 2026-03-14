import { NavLink, Route, Routes } from 'react-router-dom';
import WardrobePage from './pages/WardrobePage';
import AnalysisPage from './pages/AnalysisPage';
import OutfitPage from './pages/OutfitPage';
import RecommendationsPage from './pages/RecommendationsPage';

export default function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="hero-panel">
          <div>
            <p className="eyebrow">Savvy</p>
            <h1>Savvy Wardrobe Improvement MVP</h1>
            <p className="hero-copy">Build a sharper wardrobe. See better outfits. Buy smarter pieces.</p>
          </div>
          <nav className="nav-tabs" aria-label="Primary navigation">
            <NavLink to="/">Wardrobe Manager</NavLink>
            <NavLink to="/analysis">Analysis Dashboard</NavLink>
            <NavLink to="/outfits">Outfit Builder</NavLink>
            <NavLink to="/recommendations">Recommendations</NavLink>
          </nav>
        </div>
      </header>
      <main className="page-shell">
        <Routes>
          <Route path="/" element={<WardrobePage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/outfits" element={<OutfitPage />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />
        </Routes>
      </main>
      <footer className="app-footer">
        <p>Built for quick wardrobe cleanup, sharper analysis, and more deliberate shopping.</p>
      </footer>
    </div>
  );
}
