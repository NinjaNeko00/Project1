// Level selection component
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { levels, Level } from '@/lib/levels';
import { analyzePuzzle } from '@/lib/solver';
import { cn } from '@/lib/utils';
import { Check, X, MapPin } from 'lucide-react';

interface LevelSelectorProps {
  currentLevelId: string;
  completedLevels: Set<string>;
  onSelectLevel: (level: Level) => void;
}

export function LevelSelector({
  currentLevelId,
  completedLevels,
  onSelectLevel,
}: LevelSelectorProps) {
  const difficultyColors = {
    easy: 'bg-chart-1/20 text-chart-1 border-chart-1/30',
    medium: 'bg-chart-2/20 text-chart-2 border-chart-2/30',
    hard: 'bg-chart-4/20 text-chart-4 border-chart-4/30',
    impossible: 'bg-destructive/20 text-destructive border-destructive/30',
  };

  return (
    <div className="w-full">
      <h3 className="font-serif text-lg font-semibold mb-3 text-foreground">Select Level</h3>
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-2">
          {levels.map((level, index) => {
            const analysis = analyzePuzzle(level.graph);
            const isCompleted = completedLevels.has(level.id);
            const isCurrent = level.id === currentLevelId;
            
            return (
              <Card
                key={level.id}
                className={cn(
                  'cursor-pointer transition-all duration-200 hover:shadow-md',
                  isCurrent && 'ring-2 ring-primary',
                  isCompleted && 'bg-primary/5'
                )}
                onClick={() => onSelectLevel(level)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    {/* Level number */}
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                      isCompleted 
                        ? 'bg-primary text-primary-foreground'
                        : isCurrent
                          ? 'bg-chart-2 text-card'
                          : 'bg-muted text-muted-foreground'
                    )}>
                      {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                    </div>
                    
                    {/* Level info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground truncate">
                          {level.name}
                        </span>
                        {isCurrent && (
                          <MapPin className="h-3 w-3 text-primary flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="outline" 
                          className={cn('text-xs capitalize', difficultyColors[level.difficulty])}
                        >
                          {level.difficulty}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {level.graph.edges.length} bridges
                        </span>
                        {!analysis.solvable && (
                          <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/30">
                            <X className="h-3 w-3 mr-1" />
                            Unsolvable
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
