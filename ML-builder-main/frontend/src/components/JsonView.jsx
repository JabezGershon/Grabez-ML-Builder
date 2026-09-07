// JsonView.jsx
import React from 'react';

const JsonView = ({ data }) => {
  return (
    <div className="json-display">
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default JsonView;
