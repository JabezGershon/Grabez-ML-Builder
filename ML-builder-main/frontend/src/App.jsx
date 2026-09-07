// src/App.jsx

import React, { useState, useRef, useEffect } from "react";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from "reactflow";

import "reactflow/dist/style.css";
import Toolbar from "./Toolbar";
import { useDragDrop } from "./utils/dragDropHandler";
import { nodeTypes, nodeConfigs } from "./components";
import { DataFlowManager } from "./utils/dataFlowManager";
import CodeGeneratorModal from "./components/CodeGeneratorModal";


function FlowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const reactFlowInstance = useReactFlow();
  const reactFlowWrapper = useRef(null);
  const [nodeId, setNodeId] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [showCodeGenerator, setShowCodeGenerator] = useState(false);
  const dataFlowManager = useRef(null);

  // Initialize data flow manager
  useEffect(() => {
    dataFlowManager.current = new DataFlowManager(nodes, edges, setNodes);
    // Make it globally accessible for nodes
    window.dataFlowManager = dataFlowManager.current;
  }, []);

  // Update data flow manager when nodes or edges change
  useEffect(() => {
    if (dataFlowManager.current) {
      dataFlowManager.current.updateFlow(nodes, edges);
      window.dataFlowManager = dataFlowManager.current;
    }
  }, [nodes, edges]);

  const { onDrop, onDragOver } = useDragDrop(
    reactFlowInstance,
    setNodes,
    nodeId,
    setNodeId
  );

const onConnect = (params) => {
  console.log('🔗 Connecting nodes:', params);

  setEdges(eds => addEdge(params, eds));
  setNodes(nds =>
    nds.map(n =>
      n.id === params.target
        ? { ...n, data: { ...n.data, inputConnected: true } }
        : n
    )
  );

  // Trigger real-time data flow when connection is made
  setTimeout(() => {
    if (dataFlowManager.current) {
      const sourceNode = nodes.find(n => n.id === params.source);
      if (sourceNode && sourceNode.data.outputData) {
        console.log('🚀 Auto-propagating existing data from source node');
        dataFlowManager.current.propagateData(params.source, sourceNode.data.outputData);
      }
    }
  }, 100); // Small delay to ensure state updates
};


  const executeWorkflow = async () => {
    if (nodes.length === 0) {
      alert('Please add some nodes to the canvas first!');
      return;
    }

    if (!dataFlowManager.current) {
      alert('Data flow manager not initialized!');
      return;
    }

    setIsRunning(true);
    console.log('🚀 Starting real-time workflow execution...');
    console.log('📊 Nodes:', nodes);
    console.log('🔗 Edges:', edges);

    try {
      // Get execution order based on node dependencies
      const executionOrder = dataFlowManager.current.getExecutionOrder();
      console.log('📋 Execution order:', executionOrder);

      // Execute nodes in dependency order
      for (const nodeId of executionOrder) {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) continue;

        console.log(`⚡ Executing ${node.type}: ${node.data.label}`);

        // Skip if node is already completed and has recent output
        if (node.data.status === 'completed' &&
            node.data.lastProcessed &&
            Date.now() - node.data.lastProcessed < 5000) {
          console.log(`⏭️ Skipping ${nodeId} - recently processed`);
          continue;
        }

        // Execute based on node type
        await executeNodeByType(node);
      }

      console.log('✅ Real-time workflow execution completed!');
    } catch (error) {
      console.error('❌ Workflow execution failed:', error);
      alert(`Workflow execution failed: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Execute individual node based on its type
  const executeNodeByType = async (node) => {
    if (!dataFlowManager.current) return;

    const { id, type, data } = node;

    // Node-specific processing functions will be implemented in each component
    // For now, just mark as completed
    await dataFlowManager.current.executeNode(id, async (inputData, nodeData) => {
      // This will be overridden by each node type
      console.log(`Processing ${type} with data:`, inputData);

      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        type: `${type}_output`,
        processedAt: Date.now(),
        inputData: inputData,
        message: `${type} processing completed`
      };
    });
  };

  return (
    <>      
      <div
        ref={reactFlowWrapper}
        style={{ width: "100vw", height: "100vh" }}
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background variant="dots" gap={16} size={1} color="#aaa" />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>

      {/* Toolbar with error boundary */}
      <Toolbar />

      {/* Run Button */}
      <button
        onClick={executeWorkflow}
        disabled={isRunning}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          padding: '12px 24px',
          backgroundColor: isRunning ? '#6b7280' : '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 'bold',
          cursor: isRunning ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        {isRunning ? (
          <>
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid #ffffff40',
              borderTop: '2px solid #ffffff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            Running...
          </>
        ) : (
          <>
            ▶️ Run Workflow
          </>
        )}
      </button>

      {/* Generate Code Button */}
      <button
        onClick={() => setShowCodeGenerator(true)}
        disabled={nodes.length === 0}
        style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          zIndex: 1000,
          padding: '12px 24px',
          backgroundColor: nodes.length === 0 ? '#6b7280' : '#8b5cf6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 'bold',
          cursor: nodes.length === 0 ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        🐍 Generate Code
      </button>

      {/* Code Generator Modal */}
      {showCodeGenerator && (
        <CodeGeneratorModal 
          isOpen={showCodeGenerator}
          onClose={() => setShowCodeGenerator(false)}
          nodes={nodes}
          edges={edges}
        />
      )}

      <Toolbar />

      {/* Add CSS animation for spinner */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  );
}
