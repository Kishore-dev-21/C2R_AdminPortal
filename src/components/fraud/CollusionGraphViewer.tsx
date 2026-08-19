import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  Search,
  Filter,
  Users,
  Store,
  Truck,
  MapPin,
  FileSpreadsheet,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Info,
} from "lucide-react";
import { GraphNode, GraphEdge, CollusionCluster } from "@/services/fraudEngine/types";
import { CollusionGraphService } from "@/services/fraudEngine/collusionGraphService";

interface CollusionGraphViewerProps {
  districtFilter?: string;
  onSelectTransaction?: (txId: string) => void;
}

// Coordinate positions for deterministic, clean government-grade graph layout
const nodeLayoutPositions: Record<string, { x: number; y: number }> = {
  // Districts (Top Tier)
  "dist-chennai": { x: 200, y: 70 },
  "dist-madurai": { x: 500, y: 70 },
  "dist-coimbatore": { x: 780, y: 70 },
  "dist-salem": { x: 980, y: 70 },

  // Shops (Second Tier)
  "shop-s1": { x: 150, y: 190 },
  "shop-s2": { x: 270, y: 190 },
  "shop-s4": { x: 500, y: 190 }, // Suspicious Shop
  "shop-s5": { x: 780, y: 190 },
  "shop-s6": { x: 980, y: 190 }, // Suspicious Shop

  // Delivery Agents (Central Hub Tier)
  "agent-che-01": { x: 200, y: 310 },
  "agent-mdu-01": { x: 500, y: 310 }, // Suspicious Agent
  "agent-cbe-01": { x: 780, y: 310 },
  "agent-slm-01": { x: 980, y: 310 },

  // Beneficiaries (Bottom Tier)
  "ben-101": { x: 100, y: 440 },
  "ben-102": { x: 200, y: 440 },
  "ben-103": { x: 300, y: 440 },
  "ben-842": { x: 420, y: 440 }, // Collusion Ring Member 1
  "ben-843": { x: 500, y: 460 }, // Collusion Ring Member 2
  "ben-844": { x: 580, y: 440 }, // Collusion Ring Member 3
  "ben-401": { x: 780, y: 440 },
  "ben-999": { x: 980, y: 440 },

  // Transactions (Floating Nodes)
  "tx-ord-1001": { x: 150, y: 380 },
  "tx-ord-1003": { x: 450, y: 380 }, // Critical Tx
  "tx-ord-1006": { x: 550, y: 380 }, // High Tx
  "tx-ord-1004": { x: 980, y: 380 },
};

const nodeTypeColors: Record<string, { bg: string; border: string; text: string; icon: any }> = {
  DISTRICT: { bg: "bg-blue-500/10", border: "border-blue-500", text: "text-blue-600 dark:text-blue-400", icon: MapPin },
  SHOP: { bg: "bg-emerald-500/10", border: "border-emerald-500", text: "text-emerald-600 dark:text-emerald-400", icon: Store },
  DELIVERY_AGENT: { bg: "bg-purple-500/10", border: "border-purple-500", text: "text-purple-600 dark:text-purple-400", icon: Truck },
  BENEFICIARY: { bg: "bg-slate-500/10", border: "border-slate-500", text: "text-slate-600 dark:text-slate-300", icon: Users },
  TRANSACTION: { bg: "bg-amber-500/10", border: "border-amber-500", text: "text-amber-600 dark:text-amber-400", icon: FileSpreadsheet },
  LOCATION: { bg: "bg-cyan-500/10", border: "border-cyan-500", text: "text-cyan-600 dark:text-cyan-400", icon: MapPin },
  RATION_CARD: { bg: "bg-indigo-500/10", border: "border-indigo-500", text: "text-indigo-600 dark:text-indigo-400", icon: Layers },
};

export const CollusionGraphViewer: React.FC<CollusionGraphViewerProps> = ({
  districtFilter,
  onSelectTransaction,
}) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [highlightSuspiciousOnly, setHighlightSuspiciousOnly] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const graphData = useMemo(() => {
    return CollusionGraphService.buildGraphAndAnalyze(districtFilter);
  }, [districtFilter]);

  const filteredNodes = useMemo(() => {
    return graphData.nodes.filter((node) => {
      if (highlightSuspiciousOnly && !node.isSuspicious) return false;
      if (searchQuery) {
        return (
          node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          node.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (node.district && node.district.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }
      return true;
    });
  }, [graphData.nodes, highlightSuspiciousOnly, searchQuery]);

  const activeNodeIds = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes]);

  const visibleEdges = useMemo(() => {
    return graphData.edges.filter(
      (e) => activeNodeIds.has(e.source) && activeNodeIds.has(e.target)
    );
  }, [graphData.edges, activeNodeIds]);

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 p-3 bg-muted/40 rounded-lg border border-border">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search nodes, IDs, agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary w-52"
            />
          </div>

          <button
            onClick={() => setHighlightSuspiciousOnly((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
              highlightSuspiciousOnly
                ? "bg-destructive/15 text-destructive border-destructive/40"
                : "bg-background text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            {highlightSuspiciousOnly ? "Showing Anomaly Subgraph" : "Filter Suspicious Only"}
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>District</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Shop</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span>Agent</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
            <span>Beneficiary</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Transaction</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-destructive animate-pulse" />
            <span className="text-destructive font-medium">Anomaly Link</span>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
            className="p-1.5 bg-background border border-border rounded hover:bg-muted text-muted-foreground"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))}
            className="p-1.5 bg-background border border-border rounded hover:bg-muted text-muted-foreground"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setZoomLevel(1);
              setSelectedNode(null);
              setSearchQuery("");
              setHighlightSuspiciousOnly(false);
            }}
            className="p-1.5 bg-background border border-border rounded hover:bg-muted text-muted-foreground"
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Graph Canvas Container */}
      <div className="relative border border-border rounded-xl bg-card overflow-hidden h-[540px] flex">
        {/* SVG Network Canvas */}
        <div className="flex-1 overflow-auto relative">
          <svg
            className="w-[1100px] h-[520px] transition-transform duration-200"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top left" }}
          >
            <defs>
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="16"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--muted-foreground))" opacity="0.6" />
              </marker>
              <marker
                id="arrow-suspicious"
                viewBox="0 0 10 10"
                refX="16"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--destructive))" />
              </marker>
            </defs>

            {/* Background Grid Pattern */}
            <pattern id="graph-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" strokeOpacity="0.4" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#graph-grid)" />

            {/* Suspicious Cluster Highlight Background Hull */}
            <rect
              x="380"
              y="150"
              width="240"
              height="330"
              rx="16"
              fill="hsl(var(--destructive))"
              fillOpacity="0.04"
              stroke="hsl(var(--destructive))"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <text x="390" y="172" fill="hsl(var(--destructive))" fontSize="10" fontWeight="bold" opacity="0.8">
              DETECTED COLLUSION RING: CLUSTER-MDU-01
            </text>

            {/* Render Edges */}
            {visibleEdges.map((edge) => {
              const srcPos = nodeLayoutPositions[edge.source];
              const tgtPos = nodeLayoutPositions[edge.target];
              if (!srcPos || !tgtPos) return null;

              const isSuspicious = edge.isSuspicious;
              return (
                <g key={edge.id}>
                  <line
                    x1={srcPos.x}
                    y1={srcPos.y}
                    x2={tgtPos.x}
                    y2={tgtPos.y}
                    stroke={isSuspicious ? "hsl(var(--destructive))" : "hsl(var(--muted-foreground))"}
                    strokeWidth={isSuspicious ? 2 : 1}
                    strokeOpacity={isSuspicious ? 0.9 : 0.4}
                    strokeDasharray={isSuspicious ? "3 3" : undefined}
                    markerEnd={isSuspicious ? "url(#arrow-suspicious)" : "url(#arrow)"}
                  />
                  {edge.type === "REPEATED_INTERACTION" && (
                    <text
                      x={(srcPos.x + tgtPos.x) / 2 + 6}
                      y={(srcPos.y + tgtPos.y) / 2}
                      fill="hsl(var(--destructive))"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      {edge.weight}x repeated
                    </text>
                  )}
                </g>
              );
            })}

            {/* Render Nodes */}
            {filteredNodes.map((node) => {
              const pos = nodeLayoutPositions[node.id];
              if (!pos) return null;

              const isSelected = selectedNode?.id === node.id;
              const isSuspicious = node.isSuspicious;
              const styling = nodeTypeColors[node.type] || nodeTypeColors.BENEFICIARY;

              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onClick={() => setSelectedNode(node)}
                  className="cursor-pointer group"
                >
                  {/* Suspicious Glow */}
                  {isSuspicious && (
                    <circle
                      r="22"
                      fill="none"
                      stroke="hsl(var(--destructive))"
                      strokeWidth="2"
                      className="animate-ping opacity-25"
                    />
                  )}

                  {/* Node Circle */}
                  <circle
                    r={node.type === "DISTRICT" ? 22 : node.type === "SHOP" || node.type === "DELIVERY_AGENT" ? 18 : 14}
                    fill={isSuspicious ? "hsl(var(--destructive))" : isSelected ? "hsl(var(--primary))" : "hsl(var(--card))"}
                    fillOpacity={isSuspicious ? 0.2 : isSelected ? 0.25 : 0.95}
                    stroke={
                      isSuspicious
                        ? "hsl(var(--destructive))"
                        : isSelected
                        ? "hsl(var(--primary))"
                        : "hsl(var(--border))"
                    }
                    strokeWidth={isSelected ? 2.5 : isSuspicious ? 2 : 1.5}
                    className="transition-all duration-150 group-hover:stroke-primary"
                  />

                  {/* Node Icon / Letter */}
                  <text
                    textAnchor="middle"
                    dy="4"
                    fontSize={node.type === "DISTRICT" ? "11" : "10"}
                    fontWeight="bold"
                    fill={
                      isSuspicious
                        ? "hsl(var(--destructive))"
                        : isSelected
                        ? "hsl(var(--primary))"
                        : "hsl(var(--foreground))"
                    }
                  >
                    {node.type === "DISTRICT"
                      ? "DST"
                      : node.type === "SHOP"
                      ? "FPS"
                      : node.type === "DELIVERY_AGENT"
                      ? "AGT"
                      : node.type === "TRANSACTION"
                      ? "TX"
                      : "BEN"}
                  </text>

                  {/* Node Label */}
                  <text
                    textAnchor="middle"
                    dy={node.type === "DISTRICT" ? 34 : 28}
                    fontSize="10"
                    fill="hsl(var(--foreground))"
                    fontWeight={isSelected ? "bold" : "normal"}
                    className="select-none pointer-events-none"
                  >
                    {node.label}
                  </text>

                  {/* Risk Badge if Suspicious */}
                  {node.riskScore && (
                    <g transform="translate(12, -12)">
                      <rect
                        width="24"
                        height="14"
                        rx="4"
                        fill="hsl(var(--destructive))"
                      />
                      <text
                        x="12"
                        y="10"
                        textAnchor="middle"
                        fontSize="8"
                        fontWeight="bold"
                        fill="#ffffff"
                      >
                        {node.riskScore}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Node & Cluster Inspector Panel */}
        <div className="w-80 border-l border-border bg-card/90 backdrop-blur p-4 overflow-y-auto shrink-0 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-border mb-3">
              <Info className="w-4 h-4 text-primary" />
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Graph Node Inspector
              </h4>
            </div>

            {selectedNode ? (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-muted/40 border border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                      {selectedNode.type}
                    </span>
                    {selectedNode.isSuspicious ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-destructive/15 text-destructive rounded-full">
                        Score: {selectedNode.riskScore}/100 (Anomaly)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-medium bg-success/15 text-success rounded-full">
                        Normal Baseline
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-foreground mt-1">{selectedNode.label}</h3>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">ID: {selectedNode.id}</p>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground">Jurisdiction:</span>
                    <span className="font-medium text-foreground">{selectedNode.district || "National"}</span>
                  </div>
                  {selectedNode.metadata?.shopId && (
                    <div className="flex justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Shop Code:</span>
                      <span className="font-mono text-foreground">{selectedNode.metadata.shopId}</span>
                    </div>
                  )}
                  {selectedNode.metadata?.fullId && (
                    <div className="flex justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Anonymized Card:</span>
                      <span className="font-mono text-foreground">{selectedNode.metadata.fullId}</span>
                    </div>
                  )}
                </div>

                {selectedNode.isSuspicious && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-destructive font-semibold">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Cluster Association Alert</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      This entity participates in a high co-occurrence anomaly pattern linking multiple beneficiaries with synchronized volume drifts to Agent AGT-17.
                    </p>
                  </div>
                )}

                {selectedNode.type === "TRANSACTION" && onSelectTransaction && (
                  <button
                    onClick={() => onSelectTransaction(selectedNode.label.split(" ")[0])}
                    className="w-full py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Open Pre-Delivery Review
                  </button>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-muted-foreground space-y-2">
                <Layers className="w-8 h-8 mx-auto text-muted-foreground/40" />
                <p>Click on any node in the relationship graph to inspect connections and anomaly details.</p>
              </div>
            )}
          </div>

          {/* Active Collusion Clusters Summary */}
          <div className="pt-3 border-t border-border mt-3">
            <h5 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Active Network Clusters ({graphData.detectedClusters.length})
            </h5>
            <div className="space-y-1.5">
              {graphData.detectedClusters.map((cluster) => (
                <div
                  key={cluster.clusterId}
                  className="p-2 rounded bg-destructive/5 border border-destructive/20 text-xs"
                >
                  <div className="flex items-center justify-between font-semibold text-destructive text-[11px]">
                    <span>{cluster.clusterId}</span>
                    <span>Risk: {cluster.clusterRiskScore}/100</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                    {cluster.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
