import { useEffect, useState } from 'react';
import { apiGet } from '../api/client';

export default function AnalysisPage() {
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    apiGet('/analysis').then(setAnalysis);
  }, []);

  if (!analysis) return <p>Loading analysis...</p>;

  return (
    <section>
      <h2>Analysis Dashboard</h2>
      <div className="card">
        <p>Total items: {analysis.totalItems}</p>
        <h3>Category breakdown</h3>
        <ul>
          {Object.entries(analysis.categoryBreakdown).map(([category, count]) => (
            <li key={category}>
              {category}: {count}
            </li>
          ))}
        </ul>
      </div>
      <div className="card">
        <h3>Detected Gaps</h3>
        {analysis.gaps.length === 0 ? (
          <p>No core gaps detected.</p>
        ) : (
          <ul>
            {analysis.gaps.map((gap) => (
              <li key={gap.gapId}>
                <strong>{gap.category}</strong> —{' '}
                {gap.missingCount > 0
                  ? `missing ${gap.missingCount}`
                  : `enough pieces, but ${gap.missingPreferredColors} more versatile colors would help`}
                ; priority {gap.priority}
                <br />
                {gap.reason}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
