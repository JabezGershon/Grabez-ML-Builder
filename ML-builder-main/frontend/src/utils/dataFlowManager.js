// src/utils/dataFlowManager.js
// Real-time data flow management system

export class DataFlowManager {
  constructor(nodes, edges, setNodes) {
    this.nodes = nodes;
    this.edges = edges;
    this.setNodes = setNodes;
    this.dataCache = new Map(); // Cache processed data
  }

  // Update nodes and edges
  updateFlow(nodes, edges) {
    this.nodes = nodes;
    this.edges = edges;
  }

  // Propagate data from source node to all connected target nodes
  propagateData(sourceNodeId, outputData) {
    console.log(`📡 Propagating data from ${sourceNodeId}:`, outputData);
    
    // Find all edges where this node is the source
    const outgoingEdges = this.edges.filter(edge => edge.source === sourceNodeId);
    
    // Update each target node with the new input data
    outgoingEdges.forEach(edge => {
      const targetNodeId = edge.target;
      const targetHandle = edge.targetHandle;
      
      console.log(`🎯 Sending data to ${targetNodeId} via ${targetHandle}`);
      
      this.setNodes(nodes => 
        nodes.map(node => {
          if (node.id === targetNodeId) {
            const newInputData = {
              ...node.data.inputData,
              [targetHandle]: outputData,
              [`${sourceNodeId}_output`]: outputData // Also store by source node ID
            };
            
            return {
              ...node,
              data: {
                ...node.data,
                inputData: newInputData,
                inputConnected: true
              }
            };
          }
          return node;
        })
      );
    });
  }

  // Get input data for a specific node
  getNodeInputData(nodeId) {
    const node = this.nodes.find(n => n.id === nodeId);
    return node?.data?.inputData || {};
  }

  // Check if node has all required inputs
  hasRequiredInputs(nodeId, requiredInputs = []) {
    const inputData = this.getNodeInputData(nodeId);
    return requiredInputs.every(input => inputData[input] !== undefined);
  }

  // Execute a node's processing function
  async executeNode(nodeId, processingFunction) {
    const node = this.nodes.find(n => n.id === nodeId);
    if (!node) return;

    try {
      // Mark node as running
      this.setNodes(nodes =>
        nodes.map(n =>
          n.id === nodeId
            ? { ...n, data: { ...n.data, status: 'running' } }
            : n
        )
      );

      // Execute the processing function
      const result = await processingFunction(node.data.inputData, node.data);
      
      // Cache the result
      this.dataCache.set(nodeId, result);

      // Update node with results and mark as completed
      this.setNodes(nodes =>
        nodes.map(n =>
          n.id === nodeId
            ? { 
                ...n, 
                data: { 
                  ...n.data, 
                  status: 'completed',
                  outputData: result,
                  lastProcessed: Date.now()
                } 
              }
            : n
        )
      );

      // Propagate results to connected nodes
      this.propagateData(nodeId, result);

      return result;
    } catch (error) {
      console.error(`❌ Error executing node ${nodeId}:`, error);
      
      // Mark node as error
      this.setNodes(nodes =>
        nodes.map(n =>
          n.id === nodeId
            ? { 
                ...n, 
                data: { 
                  ...n.data, 
                  status: 'error',
                  error: error.message 
                } 
              }
            : n
        )
      );
    }
  }

  // Get the execution order based on node connections
  getExecutionOrder() {
    const visited = new Set();
    const order = [];
    
    const visit = (nodeId) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      // Visit all dependencies first
      const incomingEdges = this.edges.filter(edge => edge.target === nodeId);
      incomingEdges.forEach(edge => visit(edge.source));
      
      order.push(nodeId);
    };
    
    // Start with nodes that have no incoming edges (source nodes)
    const sourceNodes = this.nodes.filter(node => 
      !this.edges.some(edge => edge.target === node.id)
    );
    
    sourceNodes.forEach(node => visit(node.id));
    
    // Also visit any remaining nodes
    this.nodes.forEach(node => visit(node.id));
    
    return order;
  }
}

// Utility functions for common data processing
export const DataProcessors = {
  // Parse CSV data into structured format
  parseCSV: (csvText) => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const row = {};
      headers.forEach((header, index) => {
        const value = values[index];
        // Try to convert to number if possible
        row[header] = isNaN(value) ? value : parseFloat(value);
      });
      return row;
    });
    
    return { headers, data, rowCount: data.length };
  },

  // Prepare data for ML algorithms
  prepareMLData: (data, targetColumn) => {
    if (!data || !Array.isArray(data)) {
      throw new Error('Invalid data format for ML processing');
    }

    const features = data.map(row => {
      const { [targetColumn]: target, ...features } = row;
      return Object.values(features).filter(val => typeof val === 'number');
    });

    const targets = data.map(row => row[targetColumn]).filter(val => typeof val === 'number');

    if (features.length === 0 || targets.length === 0) {
      throw new Error('No valid numeric data found for ML processing');
    }

    return { features, targets, featureCount: features[0].length };
  }
};
