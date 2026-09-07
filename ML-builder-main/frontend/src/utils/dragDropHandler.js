// src/utils/dragDropHandler.js
import { useCallback } from "react";
import { nodeConfigs } from "../components";

export const useDragDrop = (reactFlowInstance, setNodes, nodeId, setNodeId) => {
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const payload = event.dataTransfer.getData("application/x-block");
      if (!payload) return;

      const { type } = JSON.parse(payload);
      const reactFlowBounds = reactFlowInstance.project({
        x: event.clientX,
        y: event.clientY,
      });

      // Create onChange handler for the new node
      const onChange = (nodeId, updates) => {
        console.log(`📝 Node ${nodeId} onChange:`, updates);
        setNodes((nds) =>
          nds.map((node) =>
            node.id === nodeId
              ? { ...node, data: { ...node.data, ...updates } }
              : node
          )
        );

        // Trigger data propagation if outputData is provided
        if (updates.outputData && window.dataFlowManager) {
          console.log(`🚀 Propagating data from ${nodeId}:`, updates.outputData);
          window.dataFlowManager.propagateData(nodeId, updates.outputData);
        }
      };

      const newNode = {
        id: `${nodeId}`,
        type,
        position: reactFlowBounds,
        data: {
          ...(nodeConfigs[type]?.defaultData || { label: type }),
          onChange: onChange,
          id: `${nodeId}`,
        },
      };

      console.log(`🆕 Creating new node:`, newNode);
      setNodes((nds) => nds.concat(newNode));
      setNodeId(nodeId + 1);
    },
    [reactFlowInstance, setNodes, nodeId, setNodeId]
  );

  return { onDragOver, onDrop };
};
