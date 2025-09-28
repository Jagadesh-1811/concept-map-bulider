import React, { useState, useCallback } from 'react';
import { ConceptMapCanvas } from './ConceptMapCanvas';
import { Toolbar } from './Toolbar';
import { NavigationBar } from './NavigationBar';
import { ConceptNode, Connection, NodeColor, NodeShape, NODE_COLORS, ConceptMapData } from './types';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const ConceptMapBuilder: React.FC = () => {
  const [nodes, setNodes] = useState<ConceptNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedColor, setSelectedColor] = useState<NodeColor>('blue');
  const [selectedShape, setSelectedShape] = useState<NodeShape>('rectangle');
  const [isConnectMode, setIsConnectMode] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const handleNodeUpdate = useCallback((nodeId: string, updates: Partial<ConceptNode>) => {
    setNodes(prev => {
      const existingNode = prev.find(n => n.id === nodeId);
      if (existingNode) {
        // Update existing node
        return prev.map(node => 
          node.id === nodeId ? { ...node, ...updates } : node
        );
      } else {
        // Creating new node - ensure it has the selected shape and color
        const newNode: ConceptNode = { 
          id: nodeId, 
          x: updates.x || 0, 
          y: updates.y || 0, 
          text: updates.text || 'New Concept', 
          color: updates.color || NODE_COLORS[selectedColor],
          shape: updates.shape || selectedShape,
          ...updates 
        };
        console.log('Adding new node:', newNode);
        return [...prev, newNode];
      }
    });
  }, [selectedColor, selectedShape]);

  const handleNodeDelete = useCallback((nodeId: string) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    setConnections(prev => prev.filter(conn => conn.from !== nodeId && conn.to !== nodeId));
    toast('Node deleted');
  }, []);

  const handleConnectionCreate = useCallback((fromId: string, toId: string) => {
    const exists = connections.some(conn => 
      (conn.from === fromId && conn.to === toId) || 
      (conn.from === toId && conn.to === fromId)
    );
    
    if (!exists) {
      setConnections(prev => [...prev, { from: fromId, to: toId }]);
      toast('Connection created');
    }
  }, [connections]);

  const handleConnectionDelete = useCallback((fromId: string, toId: string) => {
    setConnections(prev => prev.filter(conn => 
      !(conn.from === fromId && conn.to === toId) && 
      !(conn.from === toId && conn.to === fromId)
    ));
    toast('Connection deleted');
  }, []);

  const handleClearCanvas = useCallback(() => {
    if (nodes.length > 0 || connections.length > 0) {
      if (window.confirm('Are you sure you want to clear the entire canvas?')) {
        setNodes([]);
        setConnections([]);
        toast('Canvas cleared');
      }
    }
  }, [nodes.length, connections.length]);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(3, prev * 1.2));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(0.3, prev / 1.2));
  }, []);

  const handleResetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    toast('View reset');
  }, []);

  const handleExport = useCallback(() => {
    const data = {
      nodes,
      connections,
      metadata: {
        created: new Date().toISOString(),
        version: '1.0',
      },
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `concept-map-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Concept map exported');
  }, [nodes, connections]);

  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.nodes && Array.isArray(data.nodes)) {
          setNodes(data.nodes);
          setConnections(data.connections || []);
          toast('Concept map imported successfully');
        } else {
          throw new Error('Invalid file format');
        }
      } catch (error) {
        toast.error('Failed to import concept map. Please check the file format.');
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = '';
  }, []);

  const handleExportPDF = useCallback(async () => {
    const canvasElement = document.querySelector('.concept-map-canvas') as HTMLElement;
    if (!canvasElement) {
      toast.error('Canvas not found');
      return;
    }

    try {
      const canvas = await html2canvas(canvasElement, {
        backgroundColor: '#f8fafc',
        scale: 2,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`concept-map-${Date.now()}.pdf`);
      toast('Concept map exported as PDF');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export PDF');
    }
  }, []);

  // Template and map management functions
  const handleLoadTemplate = useCallback((templateData: ConceptMapData) => {
    setNodes(templateData.nodes);
    setConnections(templateData.connections);
    toast(`Loaded template: ${templateData.metadata.title}`);
  }, []);

  const handleNewMap = useCallback(() => {
    if (nodes.length > 0 || connections.length > 0) {
      if (window.confirm('Are you sure you want to create a new map? This will clear the current map.')) {
        setNodes([]);
        setConnections([]);
        toast('New map created');
      }
    }
  }, [nodes.length, connections.length]);

  const handleToggleConnectMode = useCallback(() => {
    setIsConnectMode(prev => !prev);
    toast(isConnectMode ? 'Connect mode disabled' : 'Connect mode enabled - click nodes to connect them');
  }, [isConnectMode]);

  return (
    <div className="w-full h-screen relative bg-gradient-canvas">
      <NavigationBar
        onLoadTemplate={handleLoadTemplate}
        onNewMap={handleNewMap}
      />
      
      <Toolbar
        selectedColor={selectedColor}
        selectedShape={selectedShape}
        isConnectMode={isConnectMode}
        onColorSelect={setSelectedColor}
        onShapeSelect={setSelectedShape}
        onToggleConnectMode={handleToggleConnectMode}
        onClearCanvas={handleClearCanvas}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetView={handleResetView}
        onExport={handleExport}
        onExportPDF={handleExportPDF}
        onImport={handleImport}
      />
      
      <ConceptMapCanvas
        nodes={nodes}
        connections={connections}
        onNodeUpdate={handleNodeUpdate}
        onNodeDelete={handleNodeDelete}
        onConnectionCreate={handleConnectionCreate}
        onConnectionDelete={handleConnectionDelete}
        selectedNodeColor={NODE_COLORS[selectedColor]}
        selectedNodeShape={selectedShape}
        isConnectMode={isConnectMode}
      />

      {/* Instructions panel */}
      <div className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-lg rounded-xl shadow-lg border border-border p-4 max-w-xs">
        <h4 className="font-semibold text-sm mb-2">Quick Guide</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Double-click canvas to create nodes</li>
          <li>• Drag nodes to move them around</li>
          <li>• Use Connect button + click nodes to link them</li>
          <li>• Double-click nodes to edit text</li>
          <li>• Press Delete to remove nodes</li>
          <li>• Scroll to zoom, drag canvas to pan</li>
          <li>• Use toolbar to change colors & shapes</li>
          <li>• Export as JSON or PDF</li>
        </ul>
      </div>
    </div>
  );
};