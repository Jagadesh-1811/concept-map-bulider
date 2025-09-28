import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  FileText, 
  Settings, 
  HelpCircle,
  ChevronDown,
  Map,
  BookOpen,
  Lightbulb
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { ConceptMapData } from './types';

interface NavigationBarProps {
  onLoadTemplate: (template: ConceptMapData) => void;
  onNewMap: () => void;
}

const DEFAULT_TEMPLATES: Array<{ name: string; description: string; data: ConceptMapData }> = [
  {
    name: "Learning Pathway",
    description: "A structured approach to learning new concepts",
    data: {
      nodes: [
        { id: '1', x: 200, y: 150, text: 'Prerequisites', color: 'hsl(var(--concept-blue))', shape: 'rectangle' },
        { id: '2', x: 400, y: 150, text: 'Core Concept', color: 'hsl(var(--concept-green))', shape: 'circle' },
        { id: '3', x: 600, y: 150, text: 'Applications', color: 'hsl(var(--concept-orange))', shape: 'diamond' },
        { id: '4', x: 400, y: 300, text: 'Practice', color: 'hsl(var(--concept-purple))', shape: 'hexagon' },
      ],
      connections: [
        { from: '1', to: '2' },
        { from: '2', to: '3' },
        { from: '2', to: '4' },
      ],
      metadata: {
        title: 'Learning Pathway Template',
        description: 'A structured approach to learning',
        created: new Date().toISOString(),
        version: '1.0'
      }
    }
  },
  {
    name: "Problem Solving",
    description: "Break down complex problems into manageable parts",
    data: {
      nodes: [
        { id: '1', x: 400, y: 100, text: 'Problem', color: 'hsl(var(--concept-pink))', shape: 'oval' },
        { id: '2', x: 200, y: 250, text: 'Analysis', color: 'hsl(var(--concept-blue))', shape: 'rectangle' },
        { id: '3', x: 400, y: 250, text: 'Research', color: 'hsl(var(--concept-teal))', shape: 'circle' },
        { id: '4', x: 600, y: 250, text: 'Brainstorm', color: 'hsl(var(--concept-green))', shape: 'diamond' },
        { id: '5', x: 400, y: 400, text: 'Solution', color: 'hsl(var(--concept-orange))', shape: 'hexagon' },
      ],
      connections: [
        { from: '1', to: '2' },
        { from: '1', to: '3' },
        { from: '1', to: '4' },
        { from: '2', to: '5' },
        { from: '3', to: '5' },
        { from: '4', to: '5' },
      ],
      metadata: {
        title: 'Problem Solving Template',
        description: 'Break down complex problems',
        created: new Date().toISOString(),
        version: '1.0'
      }
    }
  },
  {
    name: "Knowledge Web",
    description: "Connect related topics and concepts",
    data: {
      nodes: [
        { id: '1', x: 400, y: 200, text: 'Central Topic', color: 'hsl(var(--concept-purple))', shape: 'circle' },
        { id: '2', x: 250, y: 120, text: 'Related A', color: 'hsl(var(--concept-blue))', shape: 'rectangle' },
        { id: '3', x: 550, y: 120, text: 'Related B', color: 'hsl(var(--concept-green))', shape: 'diamond' },
        { id: '4', x: 200, y: 300, text: 'Sub-topic A1', color: 'hsl(var(--concept-teal))', shape: 'oval' },
        { id: '5', x: 300, y: 350, text: 'Sub-topic A2', color: 'hsl(var(--concept-orange))', shape: 'hexagon' },
        { id: '6', x: 500, y: 350, text: 'Sub-topic B1', color: 'hsl(var(--concept-pink))', shape: 'rectangle' },
      ],
      connections: [
        { from: '1', to: '2' },
        { from: '1', to: '3' },
        { from: '2', to: '4' },
        { from: '2', to: '5' },
        { from: '3', to: '6' },
        { from: '4', to: '5' },
      ],
      metadata: {
        title: 'Knowledge Web Template',
        description: 'Connect related topics and concepts',
        created: new Date().toISOString(),
        version: '1.0'
      }
    }
  }
];

export const NavigationBar: React.FC<NavigationBarProps> = ({
  onLoadTemplate,
  onNewMap,
}) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-border shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Map className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-semibold text-foreground">Concept Map Builder</h1>
        </div>

        {/* Main Navigation */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onNewMap}>
            <FileText className="w-4 h-4 mr-2" />
            New Map
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <BookOpen className="w-4 h-4 mr-2" />
                Templates
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-white border border-border shadow-lg">
              <div className="p-2">
                <h3 className="font-medium text-sm mb-2 text-foreground">Default Templates</h3>
                {DEFAULT_TEMPLATES.map((template, index) => (
                  <DropdownMenuItem 
                    key={index}
                    onClick={() => onLoadTemplate(template.data)}
                    className="p-3 cursor-pointer hover:bg-accent/50 rounded-md"
                  >
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-4 h-4 mt-1 text-primary" />
                      <div>
                        <p className="font-medium text-sm">{template.name}</p>
                        <p className="text-xs text-muted-foreground">{template.description}</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};