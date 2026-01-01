// Game state management hook
import { useState, useCallback } from 'react';
import { 
  Graph, 
  GameState, 
  cloneGraph, 
  getEdgeBetween, 
  countRemainingEdges,
  getAvailableEdges,
  hasEulerianPath
} from '@/lib/graph';
import { Level } from '@/lib/levels';

export function useGame(initialLevel: Level) {
  const [level, setLevel] = useState<Level>(initialLevel);
  const [gameState, setGameState] = useState<GameState>(() => ({
    graph: cloneGraph(initialLevel.graph),
    currentNode: null,
    path: [],
    crossedEdges: new Set<string>(),
    gameStatus: 'idle',
    moveCount: 0,
  }));

  // Note: `gameState.graph` is a cloned copy of the level's graph. We follow
  // an immutable pattern by replacing the whole `graph` object on updates
  // (via `cloneGraph`) instead of mutating the original. This makes it safe
  // to reconstruct state (e.g., during `undoMove`) by replaying the path on
  // a fresh clone of the original `level.graph`.

  const resetGame = useCallback(() => {
    setGameState({
      graph: cloneGraph(level.graph),
      currentNode: null,
      path: [],
      crossedEdges: new Set<string>(),
      gameStatus: 'idle',
      moveCount: 0,
    });
  }, [level]);

  const loadLevel = useCallback((newLevel: Level) => {
    setLevel(newLevel);
    setGameState({
      graph: cloneGraph(newLevel.graph),
      currentNode: null,
      path: [],
      crossedEdges: new Set<string>(),
      gameStatus: 'idle',
      moveCount: 0,
    });
  }, []);

  const selectStartNode = useCallback((nodeId: string) => {
    if (gameState.gameStatus !== 'idle') return false;
    
    setGameState(prev => ({
      ...prev,
      currentNode: nodeId,
      path: [nodeId],
      gameStatus: 'playing',
    }));
    
    return true;
  }, [gameState.gameStatus]);

  // selectStartNode sets the starting node and transitions the game from
  // `idle` to `playing`. It returns a boolean for callers that may want to
  // detect whether the selection succeeded.

  const makeMove = useCallback((targetNodeId: string): { 
    success: boolean; 
    message?: string;
    gameWon?: boolean;
    gameLost?: boolean;
  } => {
    if (gameState.gameStatus !== 'playing' || !gameState.currentNode) {
      return { success: false, message: 'Game not in progress' };
    }

    if (targetNodeId === gameState.currentNode) {
      return { success: false, message: 'Already at this node' };
    }

    const edge = getEdgeBetween(gameState.graph, gameState.currentNode, targetNodeId);
    
    if (!edge) {
      return { success: false, message: 'No bridge connects these locations!' };
    }

    // Create new graph with edge marked as crossed
    const newGraph = cloneGraph(gameState.graph);
    const edgeToUpdate = newGraph.edges.find(e => e.id === edge.id);
    if (edgeToUpdate) {
      edgeToUpdate.crossed = true;
    }

    const newCrossedEdges = new Set(gameState.crossedEdges);
    newCrossedEdges.add(edge.id);

    const remainingEdges = countRemainingEdges(newGraph);
    const availableFromTarget = getAvailableEdges(newGraph, targetNodeId);

    // Check win/lose conditions
    let newStatus: GameState['gameStatus'] = 'playing';
    let gameWon = false;
    let gameLost = false;

    if (remainingEdges === 0) {
      // All bridges crossed - victory!
      newStatus = 'won';
      gameWon = true;
    } else if (availableFromTarget.length === 0) {
      // No more moves available but bridges remain - defeat
      newStatus = 'lost';
      gameLost = true;
    }

    setGameState(prev => ({
      ...prev,
      graph: newGraph,
      currentNode: targetNodeId,
      path: [...prev.path, targetNodeId],
      crossedEdges: newCrossedEdges,
      gameStatus: newStatus,
      moveCount: prev.moveCount + 1,
    }));

    return { 
      success: true, 
      gameWon,
      gameLost,
      message: gameWon ? 'Victory!' : gameLost ? 'No more valid moves!' : undefined
    };
  }, [gameState]);

  // makeMove validates the requested transition, clones the graph, marks the
  // chosen edge as crossed, updates path and counters, then determines if
  // the player has won or is stuck. Parallel edges are handled naturally by
  // `getEdgeBetween` which returns the first matching uncrossed edge.

  const undoMove = useCallback(() => {
    if (gameState.path.length <= 1) return false;
    
    // Reconstruct game state by replaying moves
    const newPath = gameState.path.slice(0, -1);
    const newGraph = cloneGraph(level.graph);
    const newCrossedEdges = new Set<string>();
    
    // Re-cross edges for the shortened path
    for (let i = 0; i < newPath.length - 1; i++) {
      const from = newPath[i];
      const to = newPath[i + 1];
      const edge = getEdgeBetween(newGraph, from, to);
      if (edge) {
        const edgeToUpdate = newGraph.edges.find(e => e.id === edge.id);
        if (edgeToUpdate) {
          edgeToUpdate.crossed = true;
          newCrossedEdges.add(edge.id);
        }
      }
    }

    setGameState(prev => ({
      ...prev,
      graph: newGraph,
      currentNode: newPath[newPath.length - 1],
      path: newPath,
      crossedEdges: newCrossedEdges,
      gameStatus: 'playing',
      moveCount: prev.moveCount - 1,
    }));

    return true;
  }, [gameState.path, level.graph]);

  // undoMove rebuilds the graph from the original `level.graph` and then
  // re-applies the truncated path to recreate the set of crossed edges.
  // This approach is simple and robust for the small graphs used by the
  // application; if performance becomes an issue we can optimize by storing
  // a history of mutated graphs.

  const getGameAnalysis = useCallback(() => {
    return hasEulerianPath(level.graph);
  }, [level.graph]);

  return {
    level,
    gameState,
    resetGame,
    loadLevel,
    selectStartNode,
    makeMove,
    undoMove,
    getGameAnalysis,
  };
}
