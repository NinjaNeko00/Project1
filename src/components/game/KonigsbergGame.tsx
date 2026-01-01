// Main game component orchestrating all game elements
import { useState, useCallback, useEffect } from 'react';
import { useGame } from '@/hooks/useGame';
import { GraphCanvas } from './GraphCanvas';
import { GameControls } from './GameControls';
import { GameHeader } from './GameHeader';
import { levels, getNextLevel, Level } from '@/lib/levels';
import { getHint, findEulerianPath, analyzePuzzle, getSolutionSteps, BridgeModification } from '@/lib/solver';
import { Edge } from '@/lib/graph';
import { toast } from 'sonner';

export function KonigsbergGame() {
  const [completedLevels, setCompletedLevels] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('konigsberg-completed');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  
  const {
    level,
    gameState,
    resetGame,
    loadLevel,
    selectStartNode,
    makeMove,
    undoMove,
  } = useGame(levels[0]);

  const [hintMessage, setHintMessage] = useState<string>();
  const [highlightedEdges, setHighlightedEdges] = useState<Edge[]>([]);
  const [isSolving, setIsSolving] = useState(false);
  const [animatingPath, setAnimatingPath] = useState<string[]>([]);
  const [solveStepIndex, setSolveStepIndex] = useState<number>(-1);
  const [modifications, setModifications] = useState<BridgeModification[]>([]);

  // Save completed levels
  useEffect(() => {
    localStorage.setItem('konigsberg-completed', JSON.stringify([...completedLevels]));
  }, [completedLevels]);

  // Mark level as complete when won
  useEffect(() => {
    if (gameState.gameStatus === 'won') {
      setCompletedLevels(prev => new Set([...prev, level.id]));
      toast.success('Level Complete!', {
        description: `You solved ${level.name} in ${gameState.moveCount} moves!`,
      });
    }
  }, [gameState.gameStatus, level.id, level.name, gameState.moveCount]);

  const handleNodeClick = useCallback((nodeId: string) => {
    setHintMessage(undefined);
    setHighlightedEdges([]);
    
    if (gameState.gameStatus === 'idle') {
      selectStartNode(nodeId);
      return;
    }
    
    if (gameState.gameStatus === 'playing') {
      const result = makeMove(nodeId);
      
      if (!result.success && result.message) {
        toast.error(result.message);
      }
      
      if (result.gameLost) {
        toast.error('No more valid moves!', {
          description: 'Try again or use hints to find the optimal path.',
        });
      }
    }
  }, [gameState.gameStatus, selectStartNode, makeMove]);

  const handleHint = useCallback(() => {
    const hint = getHint(gameState.graph, gameState.currentNode);
    
    if (hint) {
      setHintMessage(hint.message);
      
      // Highlight the suggested edge
      if (gameState.currentNode) {
        const suggestedEdge = gameState.graph.edges.find(
          e => !e.crossed && 
          ((e.from === gameState.currentNode && e.to === hint.nextNode) ||
           (e.to === gameState.currentNode && e.from === hint.nextNode))
        );
        if (suggestedEdge) {
          setHighlightedEdges([suggestedEdge]);
        }
      }
    } else {
      const analysis = analyzePuzzle(level.graph);
      if (!analysis.solvable) {
        setHintMessage(analysis.suggestion);
        toast.info('Puzzle Analysis', {
          description: 'This puzzle has no solution - it\'s the famous Königsberg problem!',
        });
      } else {
        setHintMessage('No hint available from current position.');
      }
    }
  }, [gameState.graph, gameState.currentNode, level.graph]);

  const handleSolve = useCallback(async () => {
    // Reset to show the solution from scratch
    resetGame();
    setIsSolving(true);
    setHintMessage(undefined);
    setHighlightedEdges([]);
    setModifications([]);
    setSolveStepIndex(-1);
    
    // Analyze puzzle first
    const analysis = analyzePuzzle(level.graph);
    
    if (!analysis.solvable) {
      setIsSolving(false);
      setModifications(analysis.modifications || []);
      setHintMessage(analysis.suggestion);
      toast.info('Puzzle Analysis', {
        description: 'This puzzle is unsolvable. See suggested modifications below.',
        duration: 5000,
      });
      return;
    }
    
    const solution = getSolutionSteps(level.graph);
    
    if (!solution) {
      setIsSolving(false);
      toast.error('Could not compute solution');
      return;
    }
    
    const { path, steps } = solution;
    
    // Show solution announcement
    toast.info('AI Solving...', {
      description: `Found solution with ${path.length - 1} moves. Watch the animation!`,
    });
    
    // Animate the solution with step descriptions
    setAnimatingPath([path[0]]);
    setSolveStepIndex(0);
    setHintMessage(steps[0].description);
    
    // Small delay before starting
    await new Promise(r => setTimeout(r, 800));
    
    // Start at first node
    selectStartNode(path[0]);
    
    // Animate each move with step info
    for (let i = 1; i < path.length; i++) {
      await new Promise(r => setTimeout(r, 700));
      setAnimatingPath(path.slice(0, i + 1));
      setSolveStepIndex(i);
      setHintMessage(steps[i].description);
      
      // Highlight the edge being crossed
      if (steps[i].edge) {
        setHighlightedEdges([steps[i].edge!]);
      }
      
      await new Promise(r => setTimeout(r, 300));
      makeMove(path[i]);
      setHighlightedEdges([]);
    }
    
    setIsSolving(false);
    setAnimatingPath([]);
    setSolveStepIndex(-1);
    setHintMessage('AI solved the puzzle!');
  }, [level.graph, resetGame, selectStartNode, makeMove]);

  const handleReset = useCallback(() => {
    resetGame();
    setHintMessage(undefined);
    setHighlightedEdges([]);
    setAnimatingPath([]);
    setIsSolving(false);
    setModifications([]);
    setSolveStepIndex(-1);
  }, [resetGame]);

  const handleUndo = useCallback(() => {
    undoMove();
    setHintMessage(undefined);
    setHighlightedEdges([]);
  }, [undoMove]);

  const handleSelectLevel = useCallback((newLevel: Level) => {
    loadLevel(newLevel);
    setHintMessage(undefined);
    setHighlightedEdges([]);
    setAnimatingPath([]);
    setIsSolving(false);
    setModifications([]);
    setSolveStepIndex(-1);
  }, [loadLevel]);

  const handleNextLevel = useCallback(() => {
    const next = getNextLevel(level.id);
    if (next) {
      handleSelectLevel(next);
    } else {
      toast.success('All levels complete!', {
        description: 'You\'ve mastered the Königsberg Challenge!',
      });
    }
  }, [level.id, handleSelectLevel]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <GameHeader
        currentLevelId={level.id}
        completedLevels={completedLevels}
        onSelectLevel={handleSelectLevel}
      />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8">
          {/* Game Canvas */}
          <div className="w-full max-w-[500px] aspect-square">
            <GraphCanvas
              graph={gameState.graph}
              currentNode={gameState.currentNode}
              gameStatus={gameState.gameStatus}
              highlightedEdges={highlightedEdges}
              animatingPath={animatingPath}
              onNodeClick={handleNodeClick}
            />
          </div>
          
          {/* Controls */}
          <GameControls
            level={level}
            gameState={gameState}
            onReset={handleReset}
            onHint={handleHint}
            onSolve={handleSolve}
            onUndo={handleUndo}
            onNextLevel={getNextLevel(level.id) ? handleNextLevel : undefined}
            hintMessage={hintMessage}
            isSolving={isSolving}
            modifications={modifications}
            solveStepIndex={solveStepIndex}
          />
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-border/50 py-4 text-center text-sm text-muted-foreground">
        <p>
          Inspired by Leonhard Euler's solution to the Seven Bridges of Königsberg (1736)
        </p>
      </footer>
    </div>
  );
}
