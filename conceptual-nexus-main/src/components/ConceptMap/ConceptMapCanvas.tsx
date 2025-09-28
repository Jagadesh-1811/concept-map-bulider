import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ConceptNode, NodeShape } from './types';
import { NodeRenderer } from './NodeRenderer';

interface ConceptMapCanvasProps {
  nodes: ConceptNode[];
  connections: Array<{ from: string; to: string }>;
  onNodeUpdate: (nodeId: string, updates: Partial<ConceptNode>) => void;
  onNodeDelete: (nodeId: string) => void;
  onConnectionCreate: (fromId: string, toId: string) => void;
  onConnectionDelete: (fromId: string, toId: string) => void;
  selectedNodeColor: string;
  selectedNodeShape: NodeShape;
  isConnectMode: boolean;
}

export const ConceptMapCanvas: React.FC<ConceptMapCanvasProps> = ({
  nodes,
  connections,
  onNodeUpdate,
  onNodeDelete,
  onConnectionCreate,
  onConnectionDelete,
  selectedNodeColor,
  selectedNodeShape,
  isConnectMode,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    if (e.button === 0) { // Left click
      if (isConnectMode) {
        // In connect mode, handle connections
        if (connectingFrom) {
          if (connectingFrom !== nodeId) {
            onConnectionCreate(connectingFrom, nodeId);
          }
          setConnectingFrom(null);
        } else {
          setConnectingFrom(nodeId);
        }
      } else {
        // Normal mode, handle dragging
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          const node = nodes.find(n => n.id === nodeId);
          if (node) {
            setDragOffset({
              x: (e.clientX - rect.left) / zoom - pan.x - node.x,
              y: (e.clientY - rect.top) / zoom - pan.y - node.y,
            });
            setDraggedNode(nodeId);
          }
        }
      }
    }
  }, [nodes, zoom, pan, isConnectMode, connectingFrom, onConnectionCreate]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (draggedNode) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left) / zoom - pan.x - dragOffset.x;
        const y = (e.clientY - rect.top) / zoom - pan.y - dragOffset.y;
        onNodeUpdate(draggedNode, { x, y });
      }
    } else if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      setPan(prev => ({
        x: prev.x + deltaX / zoom,
        y: prev.y + deltaY / zoom,
      }));
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  }, [draggedNode, dragOffset, onNodeUpdate, zoom, pan, isPanning, lastPanPoint]);

  const handleMouseUp = useCallback(() => {
    setDraggedNode(null);
    setIsPanning(false);
  }, []);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0 && e.target === canvasRef.current) {
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.3, Math.min(3, prev * zoomFactor)));
  }, []);

  const handleDoubleClick = useCallback((e: React.MouseEvent, nodeId?: string) => {
    if (nodeId) {
      setEditingNode(nodeId);
    } else {
      // Create new node with selected shape and color
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left) / zoom - pan.x;
        const y = (e.clientY - rect.top) / zoom - pan.y;
        const newNodeId = `node-${Date.now()}`;
        const newNode: ConceptNode = {
          id: newNodeId,
          x,
          y,
          text: 'New Concept',
          color: selectedNodeColor,
          shape: selectedNodeShape,
        };
        console.log('Creating new node with shape:', selectedNodeShape, 'and color:', selectedNodeColor);
        onNodeUpdate(newNodeId, newNode);
        setEditingNode(newNodeId);
      }
    }
  }, [zoom, pan, selectedNodeColor, selectedNodeShape, onNodeUpdate]);

  const handleNodeTextChange = useCallback((nodeId: string, text: string) => {
    onNodeUpdate(nodeId, { text });
  }, [onNodeUpdate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, nodeId: string) => {
    if (e.key === 'Enter') {
      setEditingNode(null);
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      if (editingNode !== nodeId) {
        onNodeDelete(nodeId);
      }
    }
  }, [editingNode, onNodeDelete]);

  const handleNodeRightClick = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    // Right-click is now only for context menu or other actions
    // Connection logic moved to left-click when in connect mode
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={canvasRef}
      className="concept-map-canvas w-full h-full bg-gradient-canvas relative overflow-hidden cursor-grab active:cursor-grabbing"
      onMouseDown={handleCanvasMouseDown}
      onDoubleClick={(e) => handleDoubleClick(e)}
      onWheel={handleWheel}
      style={{
        transform: `scale(${zoom})`,
        transformOrigin: '0 0',
      }}
    >
      {/* Connections with arrows */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="hsl(var(--connection-line))"
            />
          </marker>
        </defs>
        {connections.map((connection, index) => {
          const fromNode = nodes.find(n => n.id === connection.from);
          const toNode = nodes.find(n => n.id === connection.to);
          if (!fromNode || !toNode) return null;

          const fromX = fromNode.x + pan.x + 60;
          const fromY = fromNode.y + pan.y + 30;
          const toX = toNode.x + pan.x + 60;
          const toY = toNode.y + pan.y + 30;

          // Calculate arrow position (shorten line to not overlap with nodes)
          const angle = Math.atan2(toY - fromY, toX - fromX);
          const distance = Math.sqrt((toX - fromX) ** 2 + (toY - fromY) ** 2);
          const shortenedDistance = Math.max(30, distance - 40);
          const endX = fromX + Math.cos(angle) * shortenedDistance;
          const endY = fromY + Math.sin(angle) * shortenedDistance;

          return (
            <line
              key={index}
              x1={fromX}
              y1={fromY}
              x2={endX}
              y2={endY}
              stroke="hsl(var(--connection-line))"
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
              className="transition-all duration-200"
            />
          );
        })}
      </svg>

      {/* Nodes */}
      {nodes.map((node) => (
        <NodeRenderer
          key={node.id}
          node={node}
          isEditing={editingNode === node.id}
          isConnecting={connectingFrom === node.id}
          panX={pan.x}
          panY={pan.y}
          onMouseDown={(e) => handleMouseDown(e, node.id)}
          onDoubleClick={(e) => handleDoubleClick(e, node.id)}
          onContextMenu={(e) => handleNodeRightClick(e, node.id)}
          onKeyDown={(e) => handleKeyDown(e, node.id)}
          onTextChange={(text) => onNodeUpdate(node.id, { text })}
          onBlur={() => setEditingNode(null)}
        />
      ))}

      {/* Instructions overlay */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-muted-foreground bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Start Building Your Concept Map</h3>
            <p className="text-sm">Double-click to create a new concept node</p>
            <p className="text-sm">Drag nodes to move them around</p>
            <p className="text-sm">Right-click nodes to create connections</p>
          </div>
        </div>
      )}
    </div>
  );
};