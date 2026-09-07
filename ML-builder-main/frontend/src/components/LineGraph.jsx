// LineGraph.jsx
import React from 'react';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';

/**
 * props:
 *  - data: array
 *  - xKey: string
 *  - lines: [{ dataKey, color, label }]
 */
const LineGraph = ({ data = [], xKey, lines = [] }) => {
  if (!data || data.length === 0) return <div className="no-data">No data for Line chart</div>;

  const cleaned = data.map(row => {
    const copy = { ...row };
    lines.forEach(l => {
      const raw = copy[l.dataKey];
      const n = Number(raw);
      copy[l.dataKey] = Number.isFinite(n) ? n : null;
    });
    return copy;
  });

  const numericLines = lines.filter(l => cleaned.some(r => typeof r[l.dataKey] === 'number'));
  if (numericLines.length === 0) {
    return <div className="no-data">No numeric columns available for Line chart. Try Table or JSON view.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={cleaned} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        {numericLines.map((l, i) => (
          <Line key={l.dataKey} type="monotone" dataKey={l.dataKey} stroke={l.color || "#3b82f6"} strokeWidth={2} connectNulls />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineGraph;
