// src/Toolbar.jsx - Enhanced with logical ordering and better organization
import React from "react";
import "./Toolbar.css";
import { nodeConfigs } from "./components";

export default function Toolbar() {
  const onDragStart = (event, type) => {
    const payload = JSON.stringify({ type });
    event.dataTransfer.setData("application/x-block", payload);
    event.dataTransfer.effectAllowed = "move";
  };

  // Define the preferred order of categories for the ML pipeline workflow
  const categoryOrder = [
    "🔧 Input Nodes",
    "⚙️ Preprocessing",
    "📊 Linear Models",
    "🌲 Tree-Based Models", 
    "⚡ Support Vector Machines",
    "🧠 Instance-Based & Probabilistic",
    "🎪 Clustering",
    "📉 Dimensionality Reduction",
    "📈 Output Nodes"
  ];

  // Define main category headers
  const categoryHeaders = {
    "📊 Linear Models": "🎯 Supervised Learning",
    "🌲 Tree-Based Models": "🎯 Supervised Learning",
    "⚡ Support Vector Machines": "🎯 Supervised Learning", 
    "🧠 Instance-Based & Probabilistic": "🎯 Supervised Learning",
    "🎪 Clustering": "🔮 Unsupervised Learning",
    "📉 Dimensionality Reduction": "🔮 Unsupervised Learning"
  };

  // Group by category with custom ordering
  const grouped = categoryOrder.map(categoryName => {
    const nodes = Object.entries(nodeConfigs)
      .filter(([type, config]) => config.category === categoryName)
      .map(([type, config]) => ({ type, label: config.defaultData.label }));
    
    return [categoryName, nodes];
  }).filter(([category, nodes]) => nodes.length > 0);

  return (
    <aside className="toolbar">
      <div className="toolbar-header">
        <h2>🔧 ML Pipeline Builder</h2>
        <p className="toolbar-subtitle">Drag nodes to create your workflow</p>
      </div>
      
      {grouped.map(([category, nodes]) => {
        const mainHeader = categoryHeaders[category];
        
        return (
          <div key={category} className="category-section">
            {/* Show main category header if this is the first subcategory */}
            {mainHeader && category === "📊 Linear Models" && (
              <div className="main-category-header">
                <h2 className="main-category-title">{mainHeader}</h2>
              </div>
            )}
            {mainHeader && category === "🎪 Clustering" && (
              <div className="main-category-header">
                <h2 className="main-category-title">{mainHeader}</h2>
              </div>
            )}
            
            <h3 className="category-title">{category}</h3>
            <div className="category-nodes">
              {nodes.map(({ type, label }) => (
                <div
                  key={type}
                  className="block"
                  draggable
                  onDragStart={(event) => onDragStart(event, type)}
                  title={`Drag to add ${label}`}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div className="toolbar-footer">
        <div className="workflow-tips">
          <h4>💡 Workflow Tips</h4>
          <ul>
            <li>Start with Input nodes (File, Text)</li>
            <li>Use Parser for data preprocessing</li>
            <li>Apply ML algorithms for analysis</li>
            <li>Visualize results with Output nodes</li>
          </ul>
        </div>
        <div className="copyright">© 2025 Advanced ML Pipeline</div>
      </div>
    </aside>
  );
}
