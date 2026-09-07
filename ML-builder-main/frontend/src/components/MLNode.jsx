// src/components/MLNode.jsx
import React from "react";
import "./MLNode.css";

const MLNode = ({ data, label }) => {
  return (
    <div className="ml-node">
      {label || data?.label || "ML Node"}
    </div>
  );
};

export default MLNode;
