// AI Solver using Hierholzer's Algorithm for Eulerian paths
import { Graph, Edge, cloneGraph, getNodeDegrees, hasEulerianPath } from './graph';

interface AdjacencyList {
  [nodeId: string]: { to: string; edgeId: string; used: boolean }[];
}

function buildAdjacencyList(graph: Graph): AdjacencyList {
  const adj: AdjacencyList = {};
  
  graph.nodes.forEach(node => {
    adj[node.id] = [];
  });
  
  // Only include uncrossed edges in the adjacency list. The solver operates
  // on the subgraph of remaining edges so we build a local representation
  // that tracks whether a particular edge instance has been used by the
  // algorithm (`used` flag). This avoids mutating the game's canonical
  // `graph.edges` array.
  graph.edges.forEach(edge => {
    if (!edge.crossed) {
      adj[edge.from].push({ to: edge.to, edgeId: edge.id, used: false });
      adj[edge.to].push({ to: edge.from, edgeId: edge.id, used: false });
    }
  });
  
  return adj;
}

// Hierholzer's Algorithm to find Eulerian path
export function findEulerianPath(graph: Graph, startNode?: string): string[] | null {
  // NOTE: hasEulerianPath currently inspects degrees on the provided
  // `graph`. If `graph` contains `crossed = true` edges (a mid-game
  // state), callers should ensure the degrees are computed over uncrossed
  // edges (or pass a filtered clone). The adjacency list below always
  // excludes crossed edges, which is what Hierholzer should operate on.
  const eulerianInfo = hasEulerianPath(graph);
  if (!eulerianInfo.hasPath) {
    // If degree/connectivity checks fail, there is no Eulerian path.
    return null;
  }
  
  const adj = buildAdjacencyList(graph);
  
  // Determine start node
  let start = startNode;
  if (!start || !eulerianInfo.startNodes.includes(start)) {
    start = eulerianInfo.startNodes[0];
  }
  
  const stack: string[] = [start];
  const path: string[] = [];
  
  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const neighbors = adj[current];
    
    // Find an unused edge from `current` in the adjacency list. The
    // adjacency list stores undirected edges twice (once per endpoint), so
    // when we mark an edge as `used` we must mark both directions.
    let foundEdge = false;
    for (const neighbor of neighbors) {
      if (!neighbor.used) {
        // Mark this edge as used (both directions)
        neighbor.used = true;
        const reverseEdge = adj[neighbor.to].find(
          e => e.edgeId === neighbor.edgeId && !e.used
        );
        if (reverseEdge) reverseEdge.used = true;
        
        stack.push(neighbor.to);
        foundEdge = true;
        break;
      }
    }
    
    if (!foundEdge) {
      path.push(stack.pop()!);
    }
  }
  
  // Reverse to get correct order
  return path.reverse();
}

// Get a hint for the next best move
export function getHint(
  graph: Graph, 
  currentNode: string | null
): { nextNode: string; message: string } | null {
  if (!currentNode) {
    const eulerianInfo = hasEulerianPath(graph);
    if (eulerianInfo.hasPath && eulerianInfo.startNodes.length > 0) {
      const startNode = eulerianInfo.startNodes[0];
      return {
        nextNode: startNode,
        message: eulerianInfo.type === 'path' 
          ? `Start at ${startNode} - it has an odd number of bridges!`
          : `You can start anywhere! Try ${startNode}.`
      };
    }
    return null;
  }
  
  const path = findEulerianPath(graph, currentNode);
  
  if (!path || path.length < 2) {
    return null;
  }
  
  // Find current position in optimal path
  const currentIndex = path.indexOf(currentNode);
  if (currentIndex === -1 || currentIndex >= path.length - 1) {
    return null;
  }
  
  const nextNode = path[currentIndex + 1];
  return {
    nextNode,
    message: `Move to ${nextNode} to continue the optimal path.`
  };
}

// Check if puzzle is solvable from current state
export function isSolvableFromState(graph: Graph, currentNode: string): boolean {
  // Create a temporary graph with only uncrossed edges
  const tempGraph = cloneGraph(graph);
  tempGraph.edges = tempGraph.edges.filter(e => !e.crossed);
  
  if (tempGraph.edges.length === 0) {
    return true; // Already solved!
  }
  
  const path = findEulerianPath(tempGraph, currentNode);
  return path !== null && path.length === tempGraph.edges.length + 1;
}

// Get solution path edges for animation
export function getSolutionEdges(graph: Graph, startNode?: string): Edge[] | null {
  const path = findEulerianPath(graph, startNode);
  
  if (!path) return null;
  
  const solutionEdges: Edge[] = [];
  
  for (let i = 0; i < path.length - 1; i++) {
    const from = path[i];
    const to = path[i + 1];
    
    const edge = graph.edges.find(
      e => !e.crossed && 
      ((e.from === from && e.to === to) || (e.from === to && e.to === from))
    );
    
    if (edge) {
      solutionEdges.push(edge);
    }
  }
  
  return solutionEdges;
}

// Analyze why a puzzle is unsolvable
export function analyzePuzzle(graph: Graph): {
  solvable: boolean;
  oddDegreeCount: number;
  oddDegreeNodes: string[];
  suggestion: string;
  modifications?: BridgeModification[];
} {
  const degrees = getNodeDegrees(graph);
  const oddNodes: string[] = [];
  
  degrees.forEach((degree, nodeId) => {
    if (degree % 2 !== 0) {
      oddNodes.push(nodeId);
    }
  });
  
  if (oddNodes.length === 0) {
    return {
      solvable: true,
      oddDegreeCount: 0,
      oddDegreeNodes: [],
      suggestion: 'This puzzle has an Eulerian circuit! You can start from any node.'
    };
  } else if (oddNodes.length === 2) {
    return {
      solvable: true,
      oddDegreeCount: 2,
      oddDegreeNodes: oddNodes,
      suggestion: `This puzzle has an Eulerian path! Start from ${oddNodes[0]} or ${oddNodes[1]}.`
    };
  } else {
    // Generate modification suggestions
    const modifications = suggestModifications(graph, oddNodes, degrees);
    
    return {
      solvable: false,
      oddDegreeCount: oddNodes.length,
      oddDegreeNodes: oddNodes,
      suggestion: `This puzzle is unsolvable. It has ${oddNodes.length} nodes with odd degree (${oddNodes.join(', ')}). An Eulerian path requires exactly 0 or 2 nodes with odd degree.`,
      modifications
    };
  }
}

// Types for bridge modifications
export interface BridgeModification {
  type: 'add' | 'remove';
  from: string;
  to: string;
  reason: string;
}

// Suggest modifications to make an unsolvable puzzle valid
function suggestModifications(
  graph: Graph, 
  oddNodes: string[], 
  degrees: Map<string, number>
): BridgeModification[] {
  const modifications: BridgeModification[] = [];
  
  // Strategy: Pair up odd-degree nodes and suggest adding/removing bridges
  // Goal: Reduce odd-degree nodes to 0 or 2
  
  const oddNodesCopy = [...oddNodes];
  
  // If we have 4 odd nodes, we need to add 1 edge to make 2 of them even
  // If we have 6 odd nodes, we need to add 2 edges, etc.
  
  while (oddNodesCopy.length > 2) {
    // Find the best pair to connect
    let bestPair: [string, string] | null = null;
    let hasExistingEdge = false;
    
    // First, try to find pairs that already have an edge (suggest adding another)
    for (let i = 0; i < oddNodesCopy.length; i++) {
      for (let j = i + 1; j < oddNodesCopy.length; j++) {
        const from = oddNodesCopy[i];
        const to = oddNodesCopy[j];
        
        const existingEdge = graph.edges.find(
          e => (e.from === from && e.to === to) || (e.from === to && e.to === from)
        );
        
        if (existingEdge) {
          bestPair = [from, to];
          hasExistingEdge = true;
          break;
        }
        
        if (!bestPair) {
          bestPair = [from, to];
        }
      }
      if (hasExistingEdge) break;
    }
    
    if (bestPair) {
      const [from, to] = bestPair;
      
      // Option 1: Add a bridge between two odd-degree nodes
      modifications.push({
        type: 'add',
        from,
        to,
        reason: `Adding a bridge between ${from} and ${to} will make both nodes even-degree.`
      });
      
      // Remove from consideration
      oddNodesCopy.splice(oddNodesCopy.indexOf(from), 1);
      oddNodesCopy.splice(oddNodesCopy.indexOf(to), 1);
    }
  }
  
  // Alternative: suggest removing bridges
  // Find edges where removing would help
  for (const node of oddNodes.slice(0, 2)) {
    const nodeEdges = graph.edges.filter(
      e => e.from === node || e.to === node
    );
    
    if (nodeEdges.length > 1) {
      const edge = nodeEdges[0];
      const otherNode = edge.from === node ? edge.to : edge.from;
      const otherDegree = degrees.get(otherNode) || 0;
      
      // Only suggest if it helps
      if (otherDegree % 2 !== 0) {
        modifications.push({
          type: 'remove',
          from: edge.from,
          to: edge.to,
          reason: `Removing this bridge would make both ${node} and ${otherNode} even-degree.`
        });
      }
    }
  }
  
  return modifications.slice(0, 3); // Return top 3 suggestions
}

// Get detailed solution steps for animation
export function getSolutionSteps(graph: Graph, startNode?: string): {
  path: string[];
  edges: Edge[];
  steps: { node: string; edge: Edge | null; description: string }[];
} | null {
  const path = findEulerianPath(graph, startNode);
  
  if (!path) return null;
  
  const edges: Edge[] = [];
  const steps: { node: string; edge: Edge | null; description: string }[] = [];
  
  // First step - starting node
  steps.push({
    node: path[0],
    edge: null,
    description: `Start at node ${path[0]}`
  });
  
  for (let i = 0; i < path.length - 1; i++) {
    const from = path[i];
    const to = path[i + 1];
    
    const edge = graph.edges.find(
      e => !edges.includes(e) && 
      ((e.from === from && e.to === to) || (e.from === to && e.to === from))
    );
    
    if (edge) {
      edges.push(edge);
      steps.push({
        node: to,
        edge,
        description: `Cross bridge from ${from} to ${to}`
      });
    }
  }
  
  return { path, edges, steps };
}
