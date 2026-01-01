// Interactive graph visualization component
import { useMemo } from "react";
import { Graph, Edge, getAvailableEdges } from "@/lib/graph";
import { cn } from "@/lib/utils";

interface GraphCanvasProps {
  graph: Graph;
  currentNode: string | null;
  gameStatus: "idle" | "playing" | "won" | "lost";
  highlightedEdges?: Edge[];
  animatingPath?: string[];
  onNodeClick: (nodeId: string) => void;
}

export function GraphCanvas({
  graph,
  currentNode,
  gameStatus,
  highlightedEdges = [],
  animatingPath = [],
  onNodeClick,
}: GraphCanvasProps) {
  const availableNodes = useMemo(() => {
    if (!currentNode || gameStatus !== "playing") return new Set<string>();

    const available = getAvailableEdges(graph, currentNode);
    const nodes = new Set<string>();

    available.forEach((edge) => {
      if (edge.from === currentNode) nodes.add(edge.to);
      if (edge.to === currentNode) nodes.add(edge.from);
    });

    return nodes;
  }, [graph, currentNode, gameStatus]);

  const highlightedEdgeIds = useMemo(
    () => new Set(highlightedEdges.map((e) => e.id)),
    [highlightedEdges]
  );

  // Calculate edge curves for parallel edges
  const edgePositions = useMemo(() => {
    const edgeMap = new Map<string, number>();
    const pairCount = new Map<string, number>();

    graph.edges.forEach((edge) => {
      const pairKey = [edge.from, edge.to].sort().join("-");
      const count = pairCount.get(pairKey) || 0;
      edgeMap.set(edge.id, count);
      pairCount.set(pairKey, count + 1);
    });

    return { edgeMap, pairCount };
  }, [graph.edges]);

  const getEdgePath = (edge: Edge, index: number, totalInPair: number) => {
    const fromNode = graph.nodes.find((n) => n.id === edge.from);
    const toNode = graph.nodes.find((n) => n.id === edge.to);

    if (!fromNode || !toNode) return "";

    if (totalInPair === 1) {
      return `M ${fromNode.x} ${fromNode.y} L ${toNode.x} ${toNode.y}`;
    }

    // Calculate curve for parallel edges
    const midX = (fromNode.x + toNode.x) / 2;
    const midY = (fromNode.y + toNode.y) / 2;

    // Perpendicular offset
    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;
    const len = Math.sqrt(dx * dx + dy * dy);

    // Guard: if two nodes have the same coordinates `len` would be 0 and
    // dividing by it would produce NaNs. In practice nodes are placed
    // distinctly, but we keep this check in mind when adding levels.

    const offset = (index - (totalInPair - 1) / 2) * 40;
    const perpX = (-dy / len) * offset;
    const perpY = (dx / len) * offset;

    const ctrlX = midX + perpX;
    const ctrlY = midY + perpY;

    return `M ${fromNode.x} ${fromNode.y} Q ${ctrlX} ${ctrlY} ${toNode.x} ${toNode.y}`;
  };

  return (
    <svg
      viewBox="0 0 400 400"
      className="w-full h-full max-w-[500px] max-h-[500px]"
      style={{ filter: "drop-shadow(0 4px 6px hsl(var(--primary) / 0.1))" }}
    >
      {/* Background */}
      <rect
        x="0"
        y="0"
        width="400"
        height="400"
        rx="16"
        className="fill-card"
      />

      {/* Grid pattern */}
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path
            d="M 20 0 L 0 0 0 20"
            fill="none"
            className="stroke-border"
            strokeWidth="0.5"
            opacity="0.3"
          />
        </pattern>
      </defs>
      <rect x="0" y="0" width="400" height="400" fill="url(#grid)" rx="16" />

      {/* Edges */}
      {graph.edges.map((edge) => {
        const pairKey = [edge.from, edge.to].sort().join("-");
        const index = edgePositions.edgeMap.get(edge.id) || 0;
        const totalInPair = edgePositions.pairCount.get(pairKey) || 1;
        const path = getEdgePath(edge, index, totalInPair);
        const isHighlighted = highlightedEdgeIds.has(edge.id);

        return (
          <g key={edge.id}>
            {/* Edge glow for highlighted */}
            {isHighlighted && !edge.crossed && (
              <path
                d={path}
                fill="none"
                className="stroke-chart-2"
                strokeWidth="8"
                strokeLinecap="round"
                opacity="0.4"
              />
            )}

            {/* Main edge */}
            <path
              d={path}
              fill="none"
              className={cn(
                "transition-all duration-300",
                edge.crossed
                  ? "stroke-muted opacity-30"
                  : isHighlighted
                  ? "stroke-chart-2"
                  : "stroke-primary"
              )}
              strokeWidth={edge.crossed ? 2 : isHighlighted ? 4 : 3}
              strokeLinecap="round"
              strokeDasharray={edge.crossed ? "8,4" : "none"}
            />
          </g>
        );
      })}

      {/* Nodes */}
      {graph.nodes.map((node) => {
        const isCurrentNode = node.id === currentNode;
        const isAvailable = availableNodes.has(node.id);
        const isClickable = gameStatus === "idle" || isAvailable;
        const isInAnimPath = animatingPath.includes(node.id);

        return (
          <g
            key={node.id}
            onClick={() => isClickable && onNodeClick(node.id)}
            className={cn(
              "transition-transform duration-200",
              isClickable && "cursor-pointer hover:scale-110"
            )}
            style={{ transformOrigin: `${node.x}px ${node.y}px` }}
          >
            {/* Node glow */}
            {(isCurrentNode || isAvailable || isInAnimPath) && (
              <circle
                cx={node.x}
                cy={node.y}
                r={isCurrentNode ? 28 : 24}
                className={cn(
                  "transition-all duration-300",
                  isCurrentNode
                    ? "fill-primary"
                    : isAvailable
                    ? "fill-chart-1"
                    : "fill-chart-2"
                )}
                opacity="0.3"
              />
            )}

            {/* Main node circle */}
            <circle
              cx={node.x}
              cy={node.y}
              r={isCurrentNode ? 22 : 18}
              className={cn(
                "transition-all duration-300 stroke-2",
                isCurrentNode
                  ? "fill-primary stroke-primary-foreground"
                  : isAvailable
                  ? "fill-chart-1 stroke-card"
                  : "fill-card stroke-primary"
              )}
            />

            {/* Node label */}
            <text
              x={node.x}
              y={node.y}
              textAnchor="middle"
              dominantBaseline="central"
              className={cn(
                "text-sm font-bold select-none pointer-events-none",
                isCurrentNode ? "fill-primary-foreground" : "fill-foreground"
              )}
            >
              {node.id}
            </text>

            {/* Pulse animation for available nodes */}
            {isAvailable && gameStatus === "playing" && (
              <circle
                cx={node.x}
                cy={node.y}
                r={18}
                className="fill-none stroke-chart-1 animate-ping"
                strokeWidth="2"
                opacity="0.5"
              />
            )}
          </g>
        );
      })}

      {/* Win/Lose overlay */}
      {gameStatus === "won" && (
        <g>
          <rect
            x="0"
            y="0"
            width="400"
            height="400"
            className="fill-primary/20"
            rx="16"
          />
          <text
            x="200"
            y="200"
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-primary text-3xl font-bold"
          >
            Victory!
          </text>
        </g>
      )}

      {gameStatus === "lost" && (
        <g>
          <rect
            x="0"
            y="0"
            width="400"
            height="400"
            className="fill-destructive/20"
            rx="16"
          />
          <text
            x="200"
            y="200"
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-destructive text-2xl font-bold"
          >
            No More Moves!
          </text>
        </g>
      )}
    </svg>
  );
}
