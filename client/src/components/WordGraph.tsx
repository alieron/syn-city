import { useEffect, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import type { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';

interface Props {
  path: string[];
  currentWord: string;
  targetWord: string;
}

export default function WordGraph({ path, currentWord, targetWord }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    // Create nodes from path
    const newNodes: Node[] = path.map((word, index) => {
      const isStart = index === 0;
      const isCurrent = word === currentWord;
      const isTarget = word.toLowerCase() === targetWord.toLowerCase();

      return {
        id: `${word}-${index}`,
        data: { label: word },
        position: { x: index * 150, y: 100 },
        style: {
          background: isTarget 
            ? '#10b981' 
            : isCurrent 
            ? '#8b5cf6' 
            : isStart 
            ? '#ec4899' 
            : '#e5e7eb',
          color: isTarget || isCurrent || isStart ? 'white' : 'black',
          border: '2px solid',
          borderColor: isTarget 
            ? '#059669' 
            : isCurrent 
            ? '#7c3aed' 
            : isStart 
            ? '#db2777' 
            : '#d1d5db',
          padding: 10,
          borderRadius: 8,
          fontWeight: 'bold',
        },
      };
    });

    // Create edges between consecutive words
    const newEdges: Edge[] = [];
    for (let i = 0; i < path.length - 1; i++) {
      newEdges.push({
        id: `e${i}-${i + 1}`,
        source: `${path[i]}-${i}`,
        target: `${path[i + 1]}-${i + 1}`,
        animated: i === path.length - 2, // Animate the last edge
        style: { stroke: '#8b5cf6', strokeWidth: 2 },
      });
    }

    setNodes(newNodes);
    setEdges(newEdges);
  }, [path, currentWord, targetWord]);

  return (
    <div style={{ width: '100%', height: '200px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
