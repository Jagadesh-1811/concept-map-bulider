import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Plus, Download, Upload, Trash2, ZoomIn, ZoomOut, RotateCcw, 
  FileImage, Square, Circle, Diamond, Hexagon, 
  Ellipsis, Save, Link
} from 'lucide-react';
import { NodeColor, NodeShape, NODE_COLORS } from './types';

interface ToolbarProps {
  selectedColor: NodeColor;
  selectedShape: NodeShape;
  isConnectMode: boolean;
  onColorSelect: (color: NodeColor) => void;
  onShapeSelect: (shape: NodeShape) => void;
  onToggleConnectMode: () => void;
  onClearCanvas: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onExport: () => void;
  onExportPDF: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const SHAPE_ICONS = {
  rectangle: Square,
  circle: Circle,
  diamond: Diamond,
  hexagon: Hexagon,
  oval: Ellipsis,
};

const SHAPE_LABELS = {
  rectangle: 'Rectangle',
  circle: 'Circle',
  diamond: 'Diamond',
  hexagon: 'Hexagon',
  oval: 'Oval',
};

export const Toolbar: React.FC<ToolbarProps> = ({
  selectedColor,
  selectedShape,
  isConnectMode,
  onColorSelect,
  onShapeSelect,
  onToggleConnectMode,
  onClearCanvas,
  onZoomIn,
  onZoomOut,
  onResetView,
  onExport,
  onExportPDF,
  onImport,
}) => {
  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-10">
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-toolbar border border-border p-4">
        {/* Current Selection Status */}
        <div className="mb-3 pb-3 border-b border-border">
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Color:</span>
              <div 
                className="w-4 h-4 rounded-full border border-border"
                style={{ backgroundColor: NODE_COLORS[selectedColor] }}
              />
              <span className="font-medium capitalize">{selectedColor}</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <span>Shape:</span>
              {React.createElement(SHAPE_ICONS[selectedShape], { className: "w-4 h-4" })}
              <span className="font-medium">{SHAPE_LABELS[selectedShape]}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Color Palette */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Colors:</span>
            <div className="flex gap-1">
              {(Object.keys(NODE_COLORS) as NodeColor[]).map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                    selectedColor === color ? 'border-primary scale-110 shadow-md' : 'border-border'
                  }`}
                  style={{ backgroundColor: NODE_COLORS[color] }}
                  onClick={() => onColorSelect(color)}
                  title={`${color} nodes`}
                />
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-border" />

          {/* Shape Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Shapes:</span>
            <div className="flex gap-1">
              {(Object.keys(SHAPE_ICONS) as NodeShape[]).map((shape) => {
                const IconComponent = SHAPE_ICONS[shape];
                return (
                  <button
                    key={shape}
                    className={`w-8 h-8 rounded-md flex items-center justify-center border-2 transition-all duration-200 hover:scale-110 ${
                      selectedShape === shape ? 'border-primary bg-primary/10 shadow-md' : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => onShapeSelect(shape)}
                    title={`${SHAPE_LABELS[shape]} shape`}
                  >
                    <IconComponent className={`w-4 h-4 ${selectedShape === shape ? 'text-primary' : 'text-muted-foreground'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-border" />

          {/* Connect Mode Button */}
          <Button
            variant={isConnectMode ? "default" : "ghost"}
            size="sm"
            onClick={onToggleConnectMode}
            className={`transition-all duration-200 ${
              isConnectMode 
                ? 'bg-primary text-primary-foreground shadow-md' 
                : 'hover:bg-primary/10'
            }`}
            title="Click to toggle connection mode. When active, click nodes to connect them."
          >
            <Link className="h-4 w-4" />
            {isConnectMode && <span className="ml-2 text-xs">ON</span>}
          </Button>

          {/* Divider */}
          <div className="w-px h-8 bg-border" />

          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onZoomOut}
              className="hover:bg-primary/10"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onZoomIn}
              className="hover:bg-primary/10"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetView}
              className="hover:bg-primary/10"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-border" />

          {/* File Operations */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onExport}
              className="hover:bg-primary/10"
              title="Export as JSON"
            >
              <Save className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onExportPDF}
              className="hover:bg-primary/10"
              title="Export as PDF"
            >
              <FileImage className="h-4 w-4" />
            </Button>
            <label>
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-primary/10 cursor-pointer"
                title="Import JSON file"
                asChild
              >
                <span>
                  <Upload className="h-4 w-4" />
                </span>
              </Button>
              <input
                type="file"
                accept=".json"
                onChange={onImport}
                className="hidden"
              />
            </label>
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-border" />

          {/* Clear Canvas */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearCanvas}
            className="hover:bg-destructive/10 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};