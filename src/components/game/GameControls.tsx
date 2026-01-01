// Game control buttons and status display
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  RotateCcw, 
  Lightbulb, 
  Play, 
  Undo2, 
  ChevronRight,
  Info,
  Plus,
  Minus,
  Wrench
} from 'lucide-react';
import { GameState } from '@/lib/graph';
import { Level } from '@/lib/levels';
import { cn } from '@/lib/utils';

import { BridgeModification } from '@/lib/solver';

interface GameControlsProps {
  level: Level;
  gameState: GameState;
  onReset: () => void;
  onHint: () => void;
  onSolve: () => void;
  onUndo: () => void;
  onNextLevel?: () => void;
  hintMessage?: string;
  isSolving?: boolean;
  modifications?: BridgeModification[];
  solveStepIndex?: number;
}

export function GameControls({
  level,
  gameState,
  onReset,
  onHint,
  onSolve,
  onUndo,
  onNextLevel,
  hintMessage,
  isSolving = false,
  modifications = [],
  solveStepIndex = -1,
}: GameControlsProps) {
  const totalEdges = level.graph.edges.length;
  const crossedEdges = gameState.crossedEdges.size;
  const remainingEdges = totalEdges - crossedEdges;

  const difficultyColors = {
    easy: 'bg-chart-1/20 text-chart-1 border-chart-1/30',
    medium: 'bg-chart-2/20 text-chart-2 border-chart-2/30',
    hard: 'bg-chart-4/20 text-chart-4 border-chart-4/30',
    impossible: 'bg-destructive/20 text-destructive border-destructive/30',
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-md">
      {/* Level Info */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="font-serif text-xl font-semibold text-foreground">
                {level.name}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {level.description}
              </p>
            </div>
            <Badge 
              variant="outline" 
              className={cn('capitalize', difficultyColors[level.difficulty])}
            >
              {level.difficulty}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Game Status */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{crossedEdges}</div>
              <div className="text-xs text-muted-foreground">Crossed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-chart-2">{remainingEdges}</div>
              <div className="text-xs text-muted-foreground">Remaining</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{gameState.moveCount}</div>
              <div className="text-xs text-muted-foreground">Moves</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-chart-2 transition-all duration-300"
              style={{ width: `${(crossedEdges / totalEdges) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Status Message */}
      {gameState.gameStatus === 'idle' && (
        <Card className="border-chart-1/30 bg-chart-1/5">
          <CardContent className="p-3 flex items-center gap-2">
            <Info className="h-4 w-4 text-chart-1" />
            <span className="text-sm text-chart-1">Click any node to start your journey!</span>
          </CardContent>
        </Card>
      )}

      {hintMessage && (
        <Card className="border-chart-2/30 bg-chart-2/5">
          <CardContent className="p-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-chart-2" />
            <span className="text-sm text-chart-2">{hintMessage}</span>
          </CardContent>
        </Card>
      )}

      {/* AI Solve Step Indicator */}
      {isSolving && solveStepIndex >= 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-3 flex items-center gap-2">
            <Play className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm text-primary font-medium">
              AI Solving - Step {solveStepIndex + 1}
            </span>
          </CardContent>
        </Card>
      )}

      {/* Modification Suggestions for Unsolvable Puzzles */}
      {modifications.length > 0 && (
        <Card className="border-chart-4/30 bg-chart-4/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Wrench className="h-4 w-4 text-chart-4" />
              <span className="font-semibold text-chart-4 text-sm">Suggested Modifications</span>
            </div>
            <div className="space-y-2">
              {modifications.map((mod, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  {mod.type === 'add' ? (
                    <Plus className="h-4 w-4 text-chart-1 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Minus className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <span className="font-medium text-foreground">
                      {mod.type === 'add' ? 'Add' : 'Remove'} bridge: {mod.from} ↔ {mod.to}
                    </span>
                    <p className="text-muted-foreground text-xs mt-0.5">{mod.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {gameState.gameStatus === 'won' && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">🎉</div>
            <div className="font-semibold text-primary">Congratulations!</div>
            <div className="text-sm text-muted-foreground">
              You crossed all {totalEdges} bridges in {gameState.moveCount} moves!
            </div>
          </CardContent>
        </Card>
      )}

      {gameState.gameStatus === 'lost' && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">😔</div>
            <div className="font-semibold text-destructive">Stuck!</div>
            <div className="text-sm text-muted-foreground">
              {remainingEdges} bridge{remainingEdges !== 1 ? 's' : ''} remain, but no valid moves.
              Try again or use a hint!
            </div>
          </CardContent>
        </Card>
      )}

      {/* Control Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          onClick={onReset}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
        
        <Button
          variant="outline"
          onClick={onUndo}
          disabled={gameState.path.length <= 1}
          className="flex items-center gap-2"
        >
          <Undo2 className="h-4 w-4" />
          Undo
        </Button>
        
        <Button
          variant="outline"
          onClick={onHint}
          disabled={gameState.gameStatus === 'won' || isSolving}
          className="flex items-center gap-2"
        >
          <Lightbulb className="h-4 w-4" />
          Hint
        </Button>
        
        <Button
          variant="outline"
          onClick={onSolve}
          disabled={gameState.gameStatus === 'won' || isSolving}
          className="flex items-center gap-2"
        >
          <Play className="h-4 w-4" />
          {isSolving ? 'Solving...' : 'AI Solve'}
        </Button>
      </div>

      {/* Next Level Button */}
      {gameState.gameStatus === 'won' && onNextLevel && (
        <Button
          onClick={onNextLevel}
          className="w-full flex items-center justify-center gap-2"
        >
          Next Level
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
