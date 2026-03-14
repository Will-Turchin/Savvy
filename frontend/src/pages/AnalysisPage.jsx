import { useEffect, useState } from 'react';
import { apiGet } from '../api/client';

export default function AnalysisPage() {
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    apiGet('/analysis').then(setAnalysis);
  }, []);

  if (!analysis) return <p className="loading-page">Loading analysis...</p>;

  return (
    <section className="page-layout">
      <div className="section-heading">
        <p className="eyebrow">Analysis Dashboard</p>
        <h2>See the gaps fast.</h2>
        <p className="section-copy">Coverage first. Versatility second.</p>
      </div>

      <div className="stats-grid">
        <article className="card stat-card stat-card-accent">
          <p className="stat-label">Total Items</p>
          <h3>{analysis.totalItems}</h3>
          <p className="stat-copy">Your current tracked wardrobe footprint.</p>
        </article>
        {Object.entries(analysis.categoryBreakdown).map(([category, count]) => (
          <article key={category} className="card stat-card">
            <p className="stat-label">{category}</p>
            <h3>{count}</h3>
            <p className="stat-copy">Pieces currently categorized as {category}.</p>
          </article>
        ))}
      </div>

      <div className="card surface-panel">
        <div className="panel-heading">
          <div>
            <p className="panel-kicker">Detected Gaps</p>
            <h3>What to fix next</h3>
          </div>
          <p className="panel-copy">Simple priorities, clear direction.</p>
        </div>

        {analysis.gaps.length === 0 ? (
          <p className="empty-state">No core gaps detected. The wardrobe has enough coverage across the essentials.</p>
        ) : (
          <div className="stack-list">
            {analysis.gaps.map((gap) => (
              <article key={gap.gapId} className="gap-card">
                <div className="gap-header">
                  <div>
                    <h4>{gap.category}</h4>
                    <p className="muted-line">
                      {gap.missingCount > 0
                        ? `Missing ${gap.missingCount} piece${gap.missingCount === 1 ? '' : 's'}`
                        : `${gap.missingPreferredColors} more versatile color picks would help`}
                    </p>
                  </div>
                  <span className={`priority-pill priority-${gap.priority}`}>{gap.priority}</span>
                </div>
                <p className="gap-reason">{gap.reason}</p>
                <div className="chip-row">
                  {gap.preferredColors.map((color) => (
                    <span key={color} className="chip">
                      {color}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
