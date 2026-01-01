// Graph types and utilities for the Königsberg Challenge

export interface Node {
  id: string;
  x: number;
  y: number;
  label: string;
}

export interface Edge {
  id: string;
  from: string;
  to: string;
  crossed: boolean;
}

export interface Graph {
  nodes: Node[];
  edges: Edge[];
}

export interface GameState {
  graph: Graph;
  currentNode: string | null;
  path: string[];
  crossedEdges: Set<string>;
  gameStatus: 'idle' | 'playing' | 'won' | 'lost';
  moveCount: number;
}

// Get adjacent nodes from a given node
export function getAdjacentNodes(graph: Graph, nodeId: string): string[] {
  const adjacent: string[] = [];
  graph.edges.forEach(edge => {
    // Only consider edges that haven't been crossed yet — this represents
    // the currently available connectivity for the player in a live game.
    if (!edge.crossed) {
      if (edge.from === nodeId) adjacent.push(edge.to);
      if (edge.to === nodeId) adjacent.push(edge.from);
    }
  });
  return adjacent;
}

// Get available edges from a node (not yet crossed)
export function getAvailableEdges(graph: Graph, nodeId: string): Edge[] {
  return graph.edges.filter(
    edge => !edge.crossed && (edge.from === nodeId || edge.to === nodeId)
  );
}

// Get edge between two nodes
export function getEdgeBetween(graph: Graph, from: string, to: string): Edge | undefined {
  return graph.edges.find(
    // Return the first uncrossed edge that connects these two nodes.
    // Note: parallel edges are distinct objects (different `id`) and this
    // function will return the first matching uncrossed instance.
    edge => !edge.crossed && 
    ((edge.from === from && edge.to === to) || (edge.from === to && edge.to === from))
  );
}

// Calculate node degrees (for Eulerian path detection)
export function getNodeDegrees(graph: Graph, excludeCrossed: boolean = false): Map<string, number> {
  const degrees = new Map<string, number>();
  
  graph.nodes.forEach(node => degrees.set(node.id, 0));
  
  graph.edges.forEach(edge => {
    // When `excludeCrossed` is true we only count still-available edges.
    // This is useful when reasoning about solvability from a mid-game state.
    if (excludeCrossed && edge.crossed) return;
    degrees.set(edge.from, (degrees.get(edge.from) || 0) + 1);
    degrees.set(edge.to, (degrees.get(edge.to) || 0) + 1);
  });
  
  return degrees;
}

// Check if graph has Eulerian path
export function hasEulerianPath(graph: Graph): { 
  hasPath: boolean; 
  startNodes: string[];
  type: 'circuit' | 'path' | 'none';
} {
  // Note: we compute degrees using the full graph passed here. Callers
  // that want to analyze a mid-game state (i.e. ignoring crossed edges)
  // should call `getNodeDegrees(graph, true)` instead or provide a graph
  // that has only the uncrossed edges.
  const degrees = getNodeDegrees(graph);
  let oddDegreeNodes: string[] = [];
  
  degrees.forEach((degree, nodeId) => {
    if (degree % 2 !== 0) {
      oddDegreeNodes.push(nodeId);
    }
  });
  
  // Check if graph is connected (simplified - assume it is for now)
  // IMPORTANT: This implementation currently assumes connectivity of the
  // nodes with non-zero degree. For a correct Eulerian test you must also
  // verify that all nodes with degree > 0 belong to a single connected
  // component (e.g., with a BFS/DFS over uncrossed edges). See TODO.

  if (oddDegreeNodes.length === 0) {
    // Eulerian circuit exists - can start anywhere
    return { hasPath: true, startNodes: graph.nodes.map(n => n.id), type: 'circuit' };
  } else if (oddDegreeNodes.length === 2) {
    // Eulerian path exists - must start at one of the odd-degree nodes
    return { hasPath: true, startNodes: oddDegreeNodes, type: 'path' };
  } else {
    // No Eulerian path
    return { hasPath: false, startNodes: [], type: 'none' };
  }
}

// Count remaining (uncrossed) edges
export function countRemainingEdges(graph: Graph): number {
  return graph.edges.filter(e => !e.crossed).length;
}

// Check if move is valid
export function isValidMove(graph: Graph, from: string, to: string): boolean {
  return getEdgeBetween(graph, from, to) !== undefined;
}

// Deep clone graph
export function cloneGraph(graph: Graph): Graph {
  return {
    nodes: graph.nodes.map(n => ({ ...n })),
    edges: graph.edges.map(e => ({ ...e }))
  };
}
