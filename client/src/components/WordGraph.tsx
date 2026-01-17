import { useEffect, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  MiniMap,
  Panel,
} from 'reactflow';
import type { Node, Edge, NodeMouseHandler } from 'reactflow';
import type { WordWithMetadata } from '../hooks/useGame';
import 'reactflow/dist/style.css';

interface Props {
  path: string[];
  currentWord: string;
  targetWord: string;
  words: WordWithMetadata[];
  proximity: number;
  isLoading: boolean;
  onSelectWord: (word: string) => void;
  onRevertToWord: (word: string, index: number) => void;
}

// Custom node component with tooltip
function CustomNode({ data }: { 
  data: { 
    label: string; 
    backgroundColor: string; 
    color: string; 
    borderColor: string; 
    definition?: string;
    pathIndex?: number;
    isPathNode?: boolean;
  } 
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className="px-4 py-2 rounded-lg shadow-lg border-2 font-semibold text-sm cursor-pointer transition-all hover:scale-105"
        style={{
          backgroundColor: data.backgroundColor,
          color: data.color,
          borderColor: data.borderColor,
        }}
      >
        {data.label}
      </div>
      {showTooltip && data.definition && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded shadow-lg z-50 whitespace-nowrap max-w-xs">
          {data.definition}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
}

const nodeTypes = {
  custom: CustomNode,
};

export default function WordGraph({ 
  path, 
  currentWord, 
  targetWord, 
  words, 
  proximity,
  isLoading,
  onSelectWord,
  onRevertToWord 
}: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    // Create nodes from path
    const pathNodes: Node[] = path.map((word, index) => {
      const isStart = index === 0;
      const isCurrent = word === currentWord;
      const isTarget = word.toLowerCase() === targetWord.toLowerCase();

      let backgroundColor = '#e5e7eb'; // gray for visited
      let color = '#374151';
      let borderColor = '#d1d5db';

      if (isTarget) {
        backgroundColor = '#10b981'; // green for target
        color = 'white';
        borderColor = '#059669';
      } else if (isCurrent) {
        backgroundColor = '#a855f7'; // purple for current
        color = 'white';
        borderColor = '#9333ea';
      } else if (isStart) {
        backgroundColor = '#6366f1'; // indigo for start
        color = 'white';
        borderColor = '#4f46e5';
      }

      return {
        id: `path-${word}-${index}`,
        type: 'custom',
        data: { 
          label: word,
          backgroundColor,
          color,
          borderColor,
          definition: `Click to revert to this word (${isStart ? 'start' : isTarget ? 'target' : isCurrent ? 'current' : 'visited'})`,
          pathIndex: index,
          isPathNode: true,
        },
        position: { x: index * 180, y: 100 },
        draggable: false,
      };
    });

    // Create next word options nodes
    const nextWordNodes: Node[] = !isLoading && words.length > 0 && 
      words[0].word !== 'No words found' && words[0].word !== 'Error loading words'
      ? words.map((wordData, index) => {
          const { word, definition, type } = wordData;
          const isTarget = word.toLowerCase() === targetWord.toLowerCase();
          
          let backgroundColor = '#cbd5e1'; // default light gray
          let color = '#1e293b';
          let borderColor = '#94a3b8';

          if (isTarget) {
            backgroundColor = '#10b981'; // green for target
            color = 'white';
            borderColor = '#059669';
          } else if (type === 'synonym') {
            backgroundColor = '#86efac'; // light green
            color = '#14532d';
            borderColor = '#4ade80';
          } else if (type === 'antonym') {
            backgroundColor = '#fca5a5'; // light red
            color = '#7f1d1d';
            borderColor = '#ef4444';
          } else if (type === 'related') {
            backgroundColor = '#93c5fd'; // light blue
            color = '#1e3a8a';
            borderColor = '#3b82f6';
          }

          return {
            id: `next-${word}-${index}`,
            type: 'custom',
            data: { 
              label: word,
              backgroundColor,
              color,
              borderColor,
              definition,
            },
            position: { 
              x: (path.length) * 180 + (index % 3) * 180, 
              y: 250 + Math.floor(index / 3) * 80 
            },
            draggable: false,
          };
        })
      : [];

    setNodes([...pathNodes, ...nextWordNodes]);

    // Create edges
    const pathEdges: Edge[] = [];
    for (let i = 0; i < path.length - 1; i++) {
      pathEdges.push({
        id: `path-edge-${i}`,
        source: `path-${path[i]}-${i}`,
        target: `path-${path[i + 1]}-${i + 1}`,
        animated: i === path.length - 2,
        style: { stroke: '#8b5cf6', strokeWidth: 3 },
        type: 'smoothstep',
      });
    }

    // Create edges from current word to next options
    const currentNodeId = `path-${currentWord}-${path.length - 1}`;
    const currentNodeExists = pathNodes.some(node => node.id === currentNodeId);
    
    const nextEdges: Edge[] = !isLoading && nextWordNodes.length > 0 && currentNodeExists
      ? nextWordNodes.map((node, index) => ({
          id: `next-edge-${index}`,
          source: currentNodeId,
          target: node.id,
          animated: false,
          style: { stroke: '#cbd5e1', strokeWidth: 2, strokeDasharray: '5,5' },
          type: 'smoothstep',
        }))
      : [];

    setEdges([...pathEdges, ...nextEdges]);
  }, [path, currentWord, targetWord, words, isLoading, setNodes, setEdges]);

  const handleNodeClick: NodeMouseHandler = (_event, node) => {
    // Handle path node clicks (revert)
    if (node.data.isPathNode && typeof node.data.pathIndex === 'number') {
      const index = node.data.pathIndex;
      const word = path[index];
      if (index < path.length - 1) {
        onRevertToWord(word, index);
      }
    }
    
    // Handle next word option clicks
    if (node.id.startsWith('next-')) {
      const word = node.data.label;
      onSelectWord(word);
    }
  };

  // Thermometer colors based on proximity
  const getThermometerColor = () => {
    if (proximity >= 80) return '#ef4444'; // hot red
    if (proximity >= 60) return '#f97316'; // orange
    if (proximity >= 40) return '#eab308'; // yellow
    if (proximity >= 20) return '#3b82f6'; // blue
    return '#06b6d4'; // cold cyan
  };

  const getThermometerLabel = () => {
    if (proximity >= 80) return 'Very Hot! 🔥';
    if (proximity >= 60) return 'Hot 🌡️';
    if (proximity >= 40) return 'Warm ☀️';
    if (proximity >= 20) return 'Cool ❄️';
    return 'Cold 🧊';
  };

  return (
    <div className="relative" style={{ width: '100%', height: '700px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
        minZoom={0.5}
        maxZoom={2}
      >
        <Background color="#e5e7eb" gap={16} />
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            if (node.id.startsWith('path-')) return '#a855f7';
            return '#cbd5e1';
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
        
        {/* Legend Panel */}
        <Panel position="top-left" className="bg-white p-4 rounded-lg shadow-lg space-y-2">
          <h3 className="font-bold text-sm mb-2">Legend</h3>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#86efac' }}></div>
            <span>Synonym</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#fca5a5' }}></div>
            <span>Antonym</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#93c5fd' }}></div>
            <span>Related</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#e5e7eb' }}></div>
            <span>Visited</span>
          </div>
        </Panel>

        {/* Thermometer Panel */}
        <Panel position="top-right" className="bg-white p-4 rounded-lg shadow-lg">
          <div className="flex flex-col items-center gap-2">
            <h3 className="font-bold text-sm">Proximity</h3>
            <div 
              className="text-2xl font-bold"
              style={{ color: getThermometerColor() }}
            >
              {getThermometerLabel()}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${proximity}%`,
                  backgroundColor: getThermometerColor() 
                }}
              ></div>
            </div>
            <div className="text-xs text-gray-600">{proximity}%</div>
          </div>
        </Panel>

        {/* Instructions Panel */}
        <Panel position="bottom-left" className="bg-white p-3 rounded-lg shadow-lg text-xs max-w-xs">
          <p className="font-semibold mb-1">How to play:</p>
          <ul className="space-y-1 text-gray-600">
            <li>• Click a word option to move forward</li>
            <li>• Click a visited word to go back</li>
            <li>• Drag to pan, scroll to zoom</li>
            <li>• Hover over words for definitions</li>
          </ul>
        </Panel>

        {isLoading && (
          <Panel position="bottom-center" className="bg-white p-4 rounded-lg shadow-lg">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-500 border-t-transparent"></div>
              <span className="text-sm font-medium text-gray-700">Loading words...</span>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}
