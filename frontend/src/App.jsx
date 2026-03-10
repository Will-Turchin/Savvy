import { NavLink, Route, Routes } from 'react-router-dom';
import WardrobePage from './pages/WardrobePage';
import AnalysisPage from './pages/AnalysisPage';
import RecommendationsPage from './pages/RecommendationsPage';

export default function App() {
  return (
    <div className="app-shell">
      <header>
        <h1>Savvy Wardrobe Improvement MVP</h1>
        <nav>
          <NavLink to="/">Wardrobe Manager</NavLink>
          <NavLink to="/analysis">Analysis Dashboard</NavLink>
          <NavLink to="/recommendations">Recommendations</NavLink>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<WardrobePage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />
        </Routes>
      </main>
    </div>
  );
}
