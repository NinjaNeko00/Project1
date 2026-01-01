// Predefined puzzle levels for the Königsberg Challenge
import { Graph } from './graph';

export interface Level {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'impossible';
  graph: Graph;
}

// The original Königsberg Bridge problem (unsolvable!)
const koenigsbergOriginal: Level = {
  id: 'konigsberg-original',
  name: 'Königsberg Original',
  description: 'The classic problem that started it all - can you cross all 7 bridges exactly once?',
  difficulty: 'impossible',
  graph: {
    nodes: [
      { id: 'A', x: 200, y: 150, label: 'North Bank' },
      { id: 'B', x: 200, y: 350, label: 'South Bank' },
      { id: 'C', x: 100, y: 250, label: 'Kneiphof Island' },
      { id: 'D', x: 350, y: 250, label: 'Lomse Island' },
    ],
    edges: [
      { id: 'e1', from: 'A', to: 'C', crossed: false },
      { id: 'e2', from: 'A', to: 'C', crossed: false },
      { id: 'e3', from: 'A', to: 'D', crossed: false },
      { id: 'e4', from: 'B', to: 'C', crossed: false },
      { id: 'e5', from: 'B', to: 'C', crossed: false },
      { id: 'e6', from: 'B', to: 'D', crossed: false },
      { id: 'e7', from: 'C', to: 'D', crossed: false },
    ],
  },
};

// Simple triangle (Eulerian circuit)
const simpleTriangle: Level = {
  id: 'simple-triangle',
  name: 'Triangle Path',
  description: 'A simple warm-up - traverse this triangle!',
  difficulty: 'easy',
  graph: {
    nodes: [
      { id: 'A', x: 200, y: 100, label: 'A' },
      { id: 'B', x: 100, y: 300, label: 'B' },
      { id: 'C', x: 300, y: 300, label: 'C' },
    ],
    edges: [
      { id: 'e1', from: 'A', to: 'B', crossed: false },
      { id: 'e2', from: 'B', to: 'C', crossed: false },
      { id: 'e3', from: 'C', to: 'A', crossed: false },
    ],
  },
};

// Square with diagonals (Eulerian path)
const squareDiagonals: Level = {
  id: 'square-diagonals',
  name: 'Square Dance',
  description: 'A square with diagonals - find the path!',
  difficulty: 'easy',
  graph: {
    nodes: [
      { id: 'A', x: 100, y: 100, label: 'A' },
      { id: 'B', x: 300, y: 100, label: 'B' },
      { id: 'C', x: 300, y: 300, label: 'C' },
      { id: 'D', x: 100, y: 300, label: 'D' },
    ],
    edges: [
      { id: 'e1', from: 'A', to: 'B', crossed: false },
      { id: 'e2', from: 'B', to: 'C', crossed: false },
      { id: 'e3', from: 'C', to: 'D', crossed: false },
      { id: 'e4', from: 'D', to: 'A', crossed: false },
      { id: 'e5', from: 'A', to: 'C', crossed: false },
      { id: 'e6', from: 'B', to: 'D', crossed: false },
    ],
  },
};

// House envelope (classic puzzle)
const houseEnvelope: Level = {
  id: 'house-envelope',
  name: 'The House',
  description: 'Draw this house without lifting your pen!',
  difficulty: 'medium',
  graph: {
    nodes: [
      { id: 'A', x: 100, y: 300, label: 'A' },
      { id: 'B', x: 300, y: 300, label: 'B' },
      { id: 'C', x: 300, y: 150, label: 'C' },
      { id: 'D', x: 100, y: 150, label: 'D' },
      { id: 'E', x: 200, y: 50, label: 'E' },
    ],
    edges: [
      { id: 'e1', from: 'A', to: 'B', crossed: false },
      { id: 'e2', from: 'B', to: 'C', crossed: false },
      { id: 'e3', from: 'C', to: 'D', crossed: false },
      { id: 'e4', from: 'D', to: 'A', crossed: false },
      { id: 'e5', from: 'A', to: 'C', crossed: false },
      { id: 'e6', from: 'B', to: 'D', crossed: false },
      { id: 'e7', from: 'D', to: 'E', crossed: false },
      { id: 'e8', from: 'E', to: 'C', crossed: false },
    ],
  },
};

// Pentagon star
const pentagonStar: Level = {
  id: 'pentagon-star',
  name: 'Starlight',
  description: 'Navigate through this starry pentagon!',
  difficulty: 'medium',
  graph: {
    nodes: [
      { id: 'A', x: 200, y: 50, label: 'A' },
      { id: 'B', x: 350, y: 150, label: 'B' },
      { id: 'C', x: 300, y: 320, label: 'C' },
      { id: 'D', x: 100, y: 320, label: 'D' },
      { id: 'E', x: 50, y: 150, label: 'E' },
    ],
    edges: [
      // Pentagon outer edges
      { id: 'e1', from: 'A', to: 'B', crossed: false },
      { id: 'e2', from: 'B', to: 'C', crossed: false },
      { id: 'e3', from: 'C', to: 'D', crossed: false },
      { id: 'e4', from: 'D', to: 'E', crossed: false },
      { id: 'e5', from: 'E', to: 'A', crossed: false },
      // Star inner edges
      { id: 'e6', from: 'A', to: 'C', crossed: false },
      { id: 'e7', from: 'A', to: 'D', crossed: false },
      { id: 'e8', from: 'B', to: 'D', crossed: false },
      { id: 'e9', from: 'B', to: 'E', crossed: false },
      { id: 'e10', from: 'C', to: 'E', crossed: false },
    ],
  },
};

// Complex web
const complexWeb: Level = {
  id: 'complex-web',
  name: 'The Web',
  description: 'A challenging web of connections awaits!',
  difficulty: 'hard',
  graph: {
    nodes: [
      { id: 'A', x: 200, y: 50, label: 'A' },
      { id: 'B', x: 350, y: 100, label: 'B' },
      { id: 'C', x: 380, y: 250, label: 'C' },
      { id: 'D', x: 280, y: 350, label: 'D' },
      { id: 'E', x: 120, y: 350, label: 'E' },
      { id: 'F', x: 20, y: 250, label: 'F' },
      { id: 'G', x: 50, y: 100, label: 'G' },
      { id: 'H', x: 200, y: 200, label: 'H' },
    ],
    edges: [
      // Outer ring
      { id: 'e1', from: 'A', to: 'B', crossed: false },
      { id: 'e2', from: 'B', to: 'C', crossed: false },
      { id: 'e3', from: 'C', to: 'D', crossed: false },
      { id: 'e4', from: 'D', to: 'E', crossed: false },
      { id: 'e5', from: 'E', to: 'F', crossed: false },
      { id: 'e6', from: 'F', to: 'G', crossed: false },
      { id: 'e7', from: 'G', to: 'A', crossed: false },
      // Connections to center
      { id: 'e8', from: 'A', to: 'H', crossed: false },
      { id: 'e9', from: 'B', to: 'H', crossed: false },
      { id: 'e10', from: 'C', to: 'H', crossed: false },
      { id: 'e11', from: 'D', to: 'H', crossed: false },
      { id: 'e12', from: 'E', to: 'H', crossed: false },
      { id: 'e13', from: 'F', to: 'H', crossed: false },
      { id: 'e14', from: 'G', to: 'H', crossed: false },
    ],
  },
};

// Modified Königsberg (solvable version)
const koenigsbergModified: Level = {
  id: 'konigsberg-modified',
  name: 'Königsberg Reimagined',
  description: 'A modified version of Königsberg - this one is solvable!',
  difficulty: 'hard',
  graph: {
    nodes: [
      { id: 'A', x: 200, y: 100, label: 'North Bank' },
      { id: 'B', x: 200, y: 350, label: 'South Bank' },
      { id: 'C', x: 80, y: 225, label: 'Kneiphof' },
      { id: 'D', x: 320, y: 225, label: 'Lomse' },
    ],
    edges: [
      { id: 'e1', from: 'A', to: 'C', crossed: false },
      { id: 'e2', from: 'A', to: 'C', crossed: false },
      { id: 'e3', from: 'A', to: 'D', crossed: false },
      { id: 'e4', from: 'B', to: 'C', crossed: false },
      { id: 'e5', from: 'B', to: 'D', crossed: false },
      { id: 'e6', from: 'C', to: 'D', crossed: false },
    ],
  },
};

// Butterfly pattern
const butterfly: Level = {
  id: 'butterfly',
  name: 'Butterfly Wings',
  description: 'Trace the delicate wings of this butterfly!',
  difficulty: 'medium',
  graph: {
    nodes: [
      { id: 'A', x: 200, y: 200, label: 'Body' },
      { id: 'B', x: 80, y: 100, label: 'TL' },
      { id: 'C', x: 80, y: 300, label: 'BL' },
      { id: 'D', x: 320, y: 100, label: 'TR' },
      { id: 'E', x: 320, y: 300, label: 'BR' },
    ],
    edges: [
      // Left wing
      { id: 'e1', from: 'A', to: 'B', crossed: false },
      { id: 'e2', from: 'B', to: 'C', crossed: false },
      { id: 'e3', from: 'C', to: 'A', crossed: false },
      { id: 'e4', from: 'A', to: 'B', crossed: false },
      // Right wing
      { id: 'e5', from: 'A', to: 'D', crossed: false },
      { id: 'e6', from: 'D', to: 'E', crossed: false },
      { id: 'e7', from: 'E', to: 'A', crossed: false },
      { id: 'e8', from: 'A', to: 'D', crossed: false },
    ],
  },
};

export const levels: Level[] = [
  simpleTriangle,
  squareDiagonals,
  houseEnvelope,
  butterfly,
  pentagonStar,
  koenigsbergModified,
  complexWeb,
  koenigsbergOriginal,
];

export function getLevelById(id: string): Level | undefined {
  return levels.find(level => level.id === id);
}

export function getNextLevel(currentId: string): Level | undefined {
  const currentIndex = levels.findIndex(level => level.id === currentId);
  if (currentIndex === -1 || currentIndex >= levels.length - 1) {
    return undefined;
  }
  return levels[currentIndex + 1];
}
