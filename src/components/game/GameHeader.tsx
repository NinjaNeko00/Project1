// Game header with title and navigation
import { Button } from '@/components/ui/button';
import { Menu, HelpCircle, Trophy } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { LevelSelector } from './LevelSelector';
import { Level } from '@/lib/levels';

interface GameHeaderProps {
  currentLevelId: string;
  completedLevels: Set<string>;
  onSelectLevel: (level: Level) => void;
}

export function GameHeader({
  currentLevelId,
  completedLevels,
  onSelectLevel,
}: GameHeaderProps) {
  return (
    <header className="w-full border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center">
            <span className="text-xl">🌉</span>
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold text-foreground leading-tight">
              The Königsberg Challenge
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              An Eulerian Path Puzzle
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Stats */}
          <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10">
            <Trophy className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {completedLevels.size}
            </span>
          </div>

          {/* Help Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <HelpCircle className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="font-serif text-xl">How to Play</DialogTitle>
                <DialogDescription className="text-left space-y-4 pt-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Objective</h4>
                    <p className="text-sm">
                      Cross every bridge exactly once. Start from any node and 
                      navigate through all connections without repeating a bridge.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Rules</h4>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li>Click any node to start your journey</li>
                      <li>Click adjacent nodes to cross bridges</li>
                      <li>Each bridge can only be crossed once</li>
                      <li>Win by crossing all bridges</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">AI Features</h4>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li><strong>Hint:</strong> Shows the next optimal move</li>
                      <li><strong>AI Solve:</strong> Animates the complete solution</li>
                    </ul>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-muted/50 text-sm">
                    <strong>💡 Euler's Theorem:</strong> A graph has an Eulerian path 
                    if it has exactly 0 or 2 nodes with an odd number of connections. 
                    Some puzzles are intentionally unsolvable!
                  </div>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>

          {/* Level Selector Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle className="font-serif">Levels</SheetTitle>
                <SheetDescription>
                  Choose a puzzle to solve
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <LevelSelector
                  currentLevelId={currentLevelId}
                  completedLevels={completedLevels}
                  onSelectLevel={onSelectLevel}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
