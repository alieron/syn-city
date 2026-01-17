import { useEffect, useState, useRef } from 'react';
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

interface HistoricalNode {
  word: string;
  position: { x: number; y: number };
  definition?: string;
  type?: string;
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
    isHistorical?: boolean;
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
          opacity: data.isHistorical ? 0.5 : 1,
        }}
      >
        {data.label}
      </div>
      {showTooltip && data.definition && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-maroon-900 text-white text-xs rounded shadow-lg z-50 whitespace-nowrap max-w-xs">
          {data.definition}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-maroon-900"></div>
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
  
  const wordPositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const historicalNodesRef = useRef<Map<string, HistoricalNode>>(new Map());

  useEffect(() => {
    // [Keeping all the existing logic for node positioning - just updating colors]
    const MIN_DISTANCE = 120;
    
    const checkCollision = (pos: { x: number; y: number }, existingPositions: Array<{ x: number; y: number }>) => {
      for (const existing of existingPositions) {
        const distance = Math.sqrt(
          Math.pow(pos.x - existing.x, 2) + Math.pow(pos.y - existing.y, 2)
        );
        if (distance < MIN_DISTANCE) {
          return true;
        }
      }
      return false;
    };

    const findNonCollidingPosition = (
      basePos: { x: number; y: number },
      centerX: number,
      centerY: number,
      existingPositions: Array<{ x: number; y: number }>,
      baseAngle?: number
    ) => {
      let position = { ...basePos };
      let attempts = 0;
      const maxAttempts = 30;
      
      while (checkCollision(position, existingPositions) && attempts < maxAttempts) {
        attempts++;
        const distance = Math.sqrt(
          Math.pow(position.x - centerX, 2) + Math.pow(position.y - centerY, 2)
        );
        let angle = baseAngle;
        if (angle === undefined) {
          angle = Math.atan2(position.y - centerY, position.x - centerX) * (180 / Math.PI);
        }
        const newDistance = distance + 30;
        const angleVariation = (attempts % 2 === 0 ? 1 : -1) * (attempts * 5);
        const adjustedAngle = angle + angleVariation;
        const radian = (adjustedAngle * Math.PI) / 180;
        
        position = {
          x: centerX + Math.cos(radian) * newDistance,
          y: centerY + Math.sin(radian) * newDistance,
        };
      }
      
      return position;
    };

    // Create nodes from path with maroon colors
    const pathNodes: Node[] = path.map((word, index) => {
      const isStart = index === 0;
      const isCurrent = word === currentWord;
      const isTarget = word.toLowerCase() === targetWord.toLowerCase();

      let backgroundColor = '#f9d0d9'; // maroon-200 for visited
      let color = '#791f3e';
      let borderColor = '#f4a8b8';

      if (isTarget) {
        backgroundColor = '#10b981'; // green for target
        color = 'white';
        borderColor = '#059669';
      } else if (isCurrent) {
        backgroundColor = '#791f3e'; // maroon-900 for current
        color = 'white';
        borderColor = '#430b1e';
      } else if (isStart) {
        backgroundColor: '#8e2043'; // maroon-800 for start
        color = 'white';
        borderColor = '#791f3e';
      }

      const savedPosition = wordPositionsRef.current.get(word.toLowerCase());
      let position;
      
      if (savedPosition) {
        position = savedPosition;
      } else {
        position = { x: index * 200, y: 100 };
        wordPositionsRef.current.set(word.toLowerCase(), position);
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
        position,
        draggable: false,
      };
    });

    const synonyms = words.filter(w => w.type === 'synonym');
    const antonyms = words.filter(w => w.type === 'antonym');
    const related = words.filter(w => w.type === 'related');
    const other = words.filter(w => !w.type || (w.type !== 'synonym' && w.type !== 'antonym' && w.type !== 'related'));

    const nextWordNodes: Node[] = [];
    const currentWordSet = new Set(words.map(w => w.word.toLowerCase()));
    
    if (!isLoading && words.length > 0 && 
        words[0].word !== 'No words found' && words[0].word !== 'Error loading words') {
      
      const existingPositions = pathNodes.map(node => node.position);
      const currentNodePosition = wordPositionsRef.current.get(currentWord.toLowerCase()) || 
                                   { x: (path.length - 1) * 200, y: 100 };
      
      const currentX = currentNodePosition.x;
      const currentY = currentNodePosition.y;
      const baseRadius = 250;
      const radiusIncrement = 90;

      const getCircularPosition = (angle: number, distance: number) => {
        const radian = (angle * Math.PI) / 180;
        return {
          x: currentX + Math.cos(radian) * distance,
          y: currentY + Math.sin(radian) * distance,
        };
      };

      const distributeNodesInSection = (
        nodeCount: number, 
        startAngle: number, 
        angleRange: number,
        baseRadius: number
      ) => {
        const positions: Array<{ x: number; y: number; layer: number; angle: number }> = [];
        const maxNodesPerLayer = 4;
        
        for (let i = 0; i < nodeCount; i++) {
          const layer = Math.floor(i / maxNodesPerLayer);
          const indexInLayer = i % maxNodesPerLayer;
          const nodesInThisLayer = Math.min(nodeCount - layer * maxNodesPerLayer, maxNodesPerLayer);
          
          const angleStep = angleRange / Math.max(nodesInThisLayer, 1);
          const angle = startAngle + (indexInLayer * angleStep) + (angleStep / 2) - (angleRange / 2);
          const distance = baseRadius + (layer * radiusIncrement);
          
          const position = getCircularPosition(angle, distance);
          positions.push({ ...position, layer, angle });
        }
        
        return positions;
      };

      const allNewPositions: Array<{ x: number; y: number }> = [];

      const createWordNode = (
        wordData: WordWithMetadata,
        index: number,
        basePosition: { x: number; y: number; angle: number },
        currentX: number,
        currentY: number
      ) => {
        const { word, definition, type } = wordData;
        const isTarget = word.toLowerCase() === targetWord.toLowerCase();
        
        let backgroundColor = '#cbd5e1';
        let color = '#1e293b';
        let borderColor = '#94a3b8';

        if (isTarget) {
          backgroundColor = '#10b981';
          color = 'white';
          borderColor = '#059669';
        } else if (type === 'synonym') {
          backgroundColor = '#86efac';
          color = '#14532d';
          borderColor = '#4ade80';
        } else if (type === 'antonym') {
          backgroundColor = '#fca5a5';
          color = '#7f1d1d';
          borderColor = '#ef4444';
        } else if (type === 'related') {
          backgroundColor = '#93c5fd';
          color = '#1e3a8a';
          borderColor = '#3b82f6';
        }

        const position = findNonCollidingPosition(
          basePosition,
          currentX,
          currentY,
          [...existingPositions, ...allNewPositions],
          basePosition.angle
        );
        
        allNewPositions.push(position);
        
        if (!wordPositionsRef.current.has(word.toLowerCase())) {
          wordPositionsRef.current.set(word.toLowerCase(), { x: position.x, y: position.y });
        }

        historicalNodesRef.current.set(word.toLowerCase(), {
          word,
          position: { x: position.x, y: position.y },
          definition,
          type,
        });

        return {
          id: `next-${word}-${nextWordNodes.length}`,
          type: 'custom',
          data: { 
            label: word,
            backgroundColor,
            color,
            borderColor,
            definition: definition || type || 'Word option',
          },
          position: { x: position.x, y: position.y },
          draggable: false,
        };
      };

      const synonymPositions = distributeNodesInSection(synonyms.length, -90, 100, baseRadius);
      synonyms.forEach((wordData, index) => {
        const node = createWordNode(wordData, index, synonymPositions[index], currentX, currentY);
        nextWordNodes.push(node);
      });

      const antonymPositions = distributeNodesInSection(antonyms.length, 60, 100, baseRadius);
      antonyms.forEach((wordData, index) => {
        const node = createWordNode(wordData, index, antonymPositions[index], currentX, currentY);
        nextWordNodes.push(node);
      });

      const relatedPositions = distributeNodesInSection(related.length, 180, 100, baseRadius);
      related.forEach((wordData, index) => {
        const node = createWordNode(wordData, index, relatedPositions[index], currentX, currentY);
        nextWordNodes.push(node);
      });

      const otherPositions = distributeNodesInSection(other.length, -135, 80, baseRadius);
      other.forEach((wordData, index) => {
        const node = createWordNode(wordData, index, otherPositions[index], currentX, currentY);
        nextWordNodes.push(node);
      });
    }

    const allOccupiedPositions: Array<{ x: number; y: number }> = [
      ...pathNodes.map(node => node.position),
      ...nextWordNodes.map(node => node.position),
    ];

    const pathWordSet = new Set(path.map(w => w.toLowerCase()));
    const historicalNodes: Node[] = [];
    
    const currentNodePosition = wordPositionsRef.current.get(currentWord.toLowerCase()) || 
                                 { x: (path.length - 1) * 200, y: 100 };
    
    historicalNodesRef.current.forEach((historicalNode, wordKey) => {
      if (!pathWordSet.has(wordKey) && !currentWordSet.has(wordKey)) {
        let finalPosition = historicalNode.position;
        
        if (checkCollision(historicalNode.position, allOccupiedPositions)) {
          finalPosition = findNonCollidingPosition(
            historicalNode.position,
            currentNodePosition.x,
            currentNodePosition.y,
            allOccupiedPositions,
            undefined
          );
          
          historicalNodesRef.current.set(wordKey, {
            ...historicalNode,
            position: finalPosition,
          });
        }
        
        allOccupiedPositions.push(finalPosition);
        
        historicalNodes.push({
          id: `historical-${historicalNode.word}`,
          type: 'custom',
          data: {
            label: historicalNode.word,
            backgroundColor: '#9ca3af',
            color: '#374151',
            borderColor: '#6b7280',
            definition: historicalNode.definition || 'Previously shown option',
            isHistorical: true,
          },
          position: finalPosition,
          draggable: false,
        });
      }
    });

    setNodes([...pathNodes, ...nextWordNodes, ...historicalNodes]);

    const pathEdges: Edge[] = [];
    for (let i = 0; i < path.length - 1; i++) {
      pathEdges.push({
        id: `path-edge-${i}`,
        source: `path-${path[i]}-${i}`,
        target: `path-${path[i + 1]}-${i + 1}`,
        animated: i === path.length - 2,
        style: { stroke: '#791f3e', strokeWidth: 9, strokeOpacity: 1 },
        type: 'smoothstep',
      });
    }

    const currentNodeId = `path-${currentWord}-${path.length - 1}`;
    const currentNodeExists = pathNodes.some(node => node.id === currentNodeId);
    
    const nextEdges: Edge[] = !isLoading && nextWordNodes.length > 0 && currentNodeExists
      ? nextWordNodes.map((node, index) => ({
          id: `next-edge-${index}`,
          source: currentNodeId,
          target: node.id,
          animated: false,
          style: { stroke: '#cbd5e1', strokeWidth: 6, strokeDasharray: '5,5', strokeOpacity: 1},
          type: 'smoothstep',
        }))
      : [];

    const historicalEdges: Edge[] = !isLoading && historicalNodes.length > 0 && currentNodeExists
      ? historicalNodes.map((node, index) => ({
          id: `historical-edge-${index}`,
          source: currentNodeId,
          target: node.id,
          animated: false,
          style: { stroke: '#e5e7eb', strokeWidth: 3, strokeDasharray: '5,5' },
          type: 'smoothstep',
        }))
      : [];

    setEdges([...pathEdges, ...nextEdges, ...historicalEdges]);
  }, [path, currentWord, targetWord, words, isLoading, setNodes, setEdges]);

  const handleNodeClick: NodeMouseHandler = (_event, node) => {
    if (node.data.isPathNode && typeof node.data.pathIndex === 'number') {
      const index = node.data.pathIndex;
      const word = path[index];
      if (index < path.length - 1) {
        onRevertToWord(word, index);
      }
    }
    
    if (node.id.startsWith('next-') || node.id.startsWith('historical-')) {
      const word = node.data.label;
      onSelectWord(word);
    }
  };

  const getThermometerColor = () => {
    if (proximity >= 80) return '#ef4444';
    if (proximity >= 60) return '#f97316';
    if (proximity >= 40) return '#eab308';
    if (proximity >= 20) return '#3b82f6';
    return '#06b6d4';
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
        fitViewOptions={{ padding: 0.2 }}
        attributionPosition="bottom-right"
        minZoom={0.5}
        maxZoom={2}
      >
        <Background color="#e5e7eb" gap={16} />
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            if (node.id.startsWith('path-')) return '#791f3e';
            if (node.id.startsWith('historical-')) return '#9ca3af';
            return '#cbd5e1';
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
        
        <Panel position="top-left" className="bg-white p-4 rounded-lg shadow-lg space-y-2 border-2 border-maroon-200">
          <h3 className="font-bold text-sm mb-2 text-maroon-900">Legend</h3>
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
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f9d0d9' }}></div>
            <span>Visited</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#9ca3af', opacity: 0.5 }}></div>
            <span>Old Options</span>
          </div>
          <div className="flex items-center gap-2 text-xs mt-3 pt-2 border-t border-maroon-200">
            <div className="w-8 h-0.5 bg-maroon-900"></div>
            <span>Path</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-8 h-0.5 border-t-2 border-dashed border-gray-400"></div>
            <span>Options</span>
          </div>
        </Panel>

        <Panel position="top-right" className="bg-white p-4 rounded-lg shadow-lg border-2 border-maroon-200">
          <div className="flex flex-col items-center gap-2">
            <h3 className="font-bold text-sm text-maroon-900">Proximity</h3>
            <div 
              className="text-2xl font-bold"
              style={{ color: getThermometerColor() }}
            >
              {getThermometerLabel()}
            </div>
            <div className="w-full bg-maroon-100 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${proximity}%`,
                  backgroundColor: getThermometerColor() 
                }}
              ></div>
            </div>
            <div className="text-xs text-maroon-700">{proximity}%</div>
          </div>
        </Panel>

        <Panel position="bottom-left" className="bg-white p-3 rounded-lg shadow-lg text-xs max-w-xs border-2 border-maroon-200">
          <p className="font-semibold mb-1 text-maroon-900">How to play:</p>
          <ul className="space-y-1 text-maroon-700">
            <li>• Click a word option to move forward</li>
            <li>• Click a visited word to go back</li>
            <li>• Greyed out words are old options</li>
            <li>• Drag to pan, scroll to zoom</li>
            <li>• Hover over words for definitions</li>
          </ul>
        </Panel>

        {isLoading && (
          <Panel position="bottom-center" className="bg-white p-4 rounded-lg shadow-lg border-2 border-maroon-200">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-maroon-900 border-t-transparent"></div>
              <span className="text-sm font-medium text-maroon-700">Loading words...</span>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}