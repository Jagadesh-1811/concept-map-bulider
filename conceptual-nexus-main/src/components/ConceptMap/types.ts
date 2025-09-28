export interface ConceptNode {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  shape: NodeShape;
}

export interface Connection {
  from: string;
  to: string;
}

export type NodeColor = 'blue' | 'green' | 'orange' | 'purple' | 'pink' | 'teal';
export type NodeShape = 'rectangle' | 'circle' | 'diamond' | 'hexagon' | 'oval';

export const NODE_COLORS: Record<NodeColor, string> = {
  blue: 'hsl(var(--concept-blue))',
  green: 'hsl(var(--concept-green))',
  orange: 'hsl(var(--concept-orange))',
  purple: 'hsl(var(--concept-purple))',
  pink: 'hsl(var(--concept-pink))',
  teal: 'hsl(var(--concept-teal))',
};

export interface ConceptMapData {
  nodes: ConceptNode[];
  connections: Connection[];
  metadata: {
    title: string;
    description?: string;
    created: string;
    version: string;
  };
}

export interface MapTemplate {
  id: string;
  name: string;
  description: string;
  data: ConceptMapData;
}