// BarGraph.jsx
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';

/**
 * props:
 *  - data: array of objects
 *  - xKey: string (category key)
 *  - bars: [{ dataKey, color, label }]
 */
const BarGraph = ({ data = [], xKey, bars = [] }) => {
  if (!data || data.length === 0) return <div className="no-data">No data for Bar chart</div>;

  // sanitize data: make non-numeric -> null so recharts can handle them
  const cleaned = data.map(row => {
    const copy = { ...row };
    bars.forEach(b => {
      const raw = copy[b.dataKey];
      const n = Number(raw);
      copy[b.dataKey] = Number.isFinite(n) ? n : null;
    });
    return copy;
  });

  // if there are no numeric bars, show helpful message
  const numericBars = bars.filter(b => cleaned.some(r => typeof r[b.dataKey] === 'number'));
  if (numericBars.length === 0) {
    return <div className="no-data">No numeric columns available for Bar chart. Try Table or JSON view.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={cleaned} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        {numericBars.map((b, i) => (
          <Bar key={b.dataKey} dataKey={b.dataKey} fill={b.color || "#8884d8"} name={b.label || b.dataKey} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BarGraph;
