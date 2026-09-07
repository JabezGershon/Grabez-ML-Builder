// TableView.jsx
import React from 'react';

const TableView = ({ data = [] }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return <div className="no-data">No tabular data available</div>;
  }

  const headers = Object.keys(data[0] || {});
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="viz-table">
        <thead>
          <tr>
            {headers.map(h => <th key={h}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {headers.map(h => <td key={h + i}>{String(row[h] ?? '')}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableView;
