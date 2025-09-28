import React from 'react';
import { ConceptNode, NodeShape } from './types';

interface NodeRendererProps {
  node: ConceptNode;
  isEditing: boolean;
  isConnecting: boolean;
  panX: number;
  panY: number;
  onMouseDown: (e: React.MouseEvent) => void;
  onDoubleClick: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onTextChange: (text: string) => void;
  onBlur: () => void;
}

const getShapeStyles = (shape: NodeShape) => {
  const baseClasses = "transition-all duration-300 hover:scale-105 hover:shadow-concept backdrop-blur-sm border-2 border-white/30";
  
  switch (shape) {
    case 'circle':
      return `${baseClasses} rounded-full w-24 h-24 min-w-24 min-h-24 max-w-24 max-h-24 flex items-center justify-center`;
    case 'diamond':
      return `${baseClasses} w-20 h-20 flex items-center justify-center`;
    case 'hexagon':
      return `${baseClasses} w-28 h-20 relative overflow-hidden`;
    case 'oval':
      return `${baseClasses} rounded-full w-32 h-20 flex items-center justify-center`;
    case 'rectangle':
    default:
      return `${baseClasses} rounded-lg w-32 h-16 flex items-center justify-center`;
  }
};

const renderShapeContent = (
  node: ConceptNode,
  isEditing: boolean,
  onTextChange: (text: string) => void,
  onBlur: () => void
) => {
  const textElement = isEditing ? (
    <input
      type="text"
      value={node.text}
      onChange={(e) => onTextChange(e.target.value)}
      onBlur={onBlur}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onBlur();
        }
        e.stopPropagation();
      }}
      className="w-full bg-transparent border-none outline-none text-white font-medium text-center text-sm px-1"
      autoFocus
    />
  ) : (
    <span className="text-white font-medium text-center text-sm leading-tight px-2 drop-shadow-sm">
      {node.text}
    </span>
  );

  if (node.shape === 'hexagon') {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <div 
          className="absolute inset-0 rounded-sm"
          style={{
            backgroundColor: node.color,
            clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
          }}
        />
        <div className="relative z-10 flex items-center justify-center px-3">
          {textElement}
        </div>
      </div>
    );
  }

  if (node.shape === 'diamond') {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <div 
          className="absolute inset-0 rotate-45 rounded-sm" 
          style={{ 
            backgroundColor: node.color,
            left: '15%',
            top: '15%',
            right: '15%',
            bottom: '15%'
          }}
        />
        <div className="relative z-10 flex items-center justify-center px-2">
          {textElement}
        </div>
      </div>
    );
  }

  // For circle and oval shapes, ensure proper rounded styling
  if (node.shape === 'circle' || node.shape === 'oval') {
    return (
      <div 
        className={`w-full h-full flex items-center justify-center px-2 py-2 ${node.shape === 'circle' ? 'rounded-full' : 'rounded-full'}`}
        style={{ backgroundColor: node.color }}
      >
        {textElement}
      </div>
    );
  }

  return (
    <div 
      className="w-full h-full flex items-center justify-center px-3 py-2 rounded-lg"
      style={{ backgroundColor: node.color }}
    >
      {textElement}
    </div>
  );
};

export const NodeRenderer: React.FC<NodeRendererProps> = ({
  node,
  isEditing,
  isConnecting,
  panX,
  panY,
  onMouseDown,
  onDoubleClick,
  onContextMenu,
  onKeyDown,
  onTextChange,
  onBlur,
}) => {
  return (
    <div
      className={`absolute cursor-pointer select-none shadow-node ${getShapeStyles(node.shape)} ${
        isConnecting ? 'ring-2 ring-white animate-pulse' : ''
      } ${isEditing ? 'ring-2 ring-primary shadow-lg' : ''}`}
      style={{
        left: node.x + panX,
        top: node.y + panY,
      }}
      onMouseDown={onMouseDown}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick(e);
      }}
      onContextMenu={onContextMenu}
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      {renderShapeContent(node, isEditing, onTextChange, onBlur)}
    </div>
  );
};