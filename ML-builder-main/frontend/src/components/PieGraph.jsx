// PieGraph.jsx
import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

/**
 * props:
 *  - data: array (rows)
 *  - nameKey: key to group by (string category)
 *  - dataKey: numeric column to sum for each category
 */
const PieGraph = ({ data = [], nameKey, dataKey }) => {
  if (!data || data.length === 0) return <div className="no-data">No data for Pie chart</div>;
  if (!nameKey || !dataKey) return <div className="no-data">Pie chart needs a category (nameKey) and a numeric column (dataKey).</div>;

  // Aggregate sums by category
  const map = new Map();
  data.forEach(row => {
    const k = row[nameKey] == null ? '(blank)' : String(row[nameKey]);
    const n = Number(row[dataKey]);
    if (!Number.isFinite(n)) return; // skip non-numeric
    map.set(k, (map.get(k) || 0) + n);
  });

  const pieData = Array.from(map.entries()).map(([name, value]) => ({ name, value }));

  if (pieData.length === 0) {
    return <div className="no-data">No numeric values found for the selected column.</div>;
  }

  const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4'];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} fill="#8884d8" label>
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PieGraph;
