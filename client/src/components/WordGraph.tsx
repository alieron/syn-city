import { useEffect, useRef, useState } from 'react';
import Thermometer from './Thermometer';
import * as d3 from 'd3';
import type { WordWithMetadata } from '../hooks/useGame';

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

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  group: 'path' | 'option' | 'target';
  type?: 'synonym' | 'antonym' | 'related';
  pathIndex?: number;
  definition?: string;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  value: number;
}

// Cache for dictionary definitions
const definitionCache = new Map<string, string>();

// Fetch definition from Free Dictionary API
async function fetchDefinition(word: string): Promise<string> {
  if (definitionCache.has(word)) {
    return definitionCache.get(word)!;
  }

  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    if (!response.ok) {
      return 'No definition available';
    }

    const data = await response.json();
    if (data && data[0] && data[0].meanings && data[0].meanings[0]) {
      const definition = data[0].meanings[0].definitions[0].definition;
      definitionCache.set(word, definition);
      return definition;
    }
    return 'No definition available';
  } catch {
    return 'No definition available';
  }
}

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
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Build nodes and links
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];
    const nodeIds = new Set<string>();

    // Add path nodes
    path.forEach((word, index) => {
      if (!nodeIds.has(word)) {
        nodes.push({
          id: word,
          group: word === targetWord ? 'target' : 'path',
          pathIndex: index,
        });
        nodeIds.add(word);
      }
    });

    // Add links between path nodes
    for (let i = 0; i < path.length - 1; i++) {
      links.push({
        source: path[i],
        target: path[i + 1],
        value: 3,
      });
    }

    // Add option nodes (available words to select)
    words.forEach((wordMeta) => {
      if (!nodeIds.has(wordMeta.word) && wordMeta.word !== 'No words found' && wordMeta.word !== 'Error loading words') {
        nodes.push({
          id: wordMeta.word,
          group: 'option',
          type: wordMeta.type,
          definition: wordMeta.definition,
        });
        nodeIds.add(wordMeta.word);

        // Link option nodes to current word
        links.push({
          source: currentWord,
          target: wordMeta.word,
          value: 1,
        });
      }
    });

    // Color scale
    const colorScale = (group: string, type?: string) => {
      if (group === 'target') return '#ec4899'; // Pink for target
      if (group === 'path') return '#8b5cf6'; // Purple for path
      if (group === 'option') {
        if (type === 'synonym') return '#3b82f6'; // Blue
        if (type === 'antonym') return '#ef4444'; // Red
        if (type === 'related') return '#10b981'; // Green
      }
      return '#6b7280'; // Gray default
    };

    // Initialize SVG once
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    // Get or create main group
    let g = svg.select<SVGGElement>('g.main-group');
    if (g.empty()) {
      g = svg.append('g').attr('class', 'main-group');

      // Add zoom behavior only once
      svg.call(d3.zoom<SVGSVGElement, unknown>()
        .extent([[0, 0], [width, height]])
        .scaleExtent([0.5, 3])
        .on('zoom', (event) => {
          g.attr('transform', event.transform);
        }) as any);
    }

    // Get or create link and node groups
    let linkGroup = g.select<SVGGElement>('g.links');
    if (linkGroup.empty()) {
      linkGroup = g.append('g')
        .attr('class', 'links')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.6);
    }

    let nodeGroup = g.select<SVGGElement>('g.nodes');
    if (nodeGroup.empty()) {
      nodeGroup = g.append('g')
        .attr('class', 'nodes')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);
    }

    // Create or update simulation
    if (!simulationRef.current) {
      simulationRef.current = d3.forceSimulation<GraphNode>()
        .force('link', d3.forceLink<GraphNode, GraphLink>().id(d => d.id).distance(100))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(40));
    }

    const simulation = simulationRef.current;

    // Update nodes and links in simulation
    simulation.nodes(nodes);
    (simulation.force('link') as d3.ForceLink<GraphNode, GraphLink>).links(links);
    simulation.alpha(0.3).restart();

    // Update links using join pattern
    const link = linkGroup
      .selectAll<SVGLineElement, GraphLink>('line')
      .data(links, d => `${(d.source as GraphNode).id || d.source}-${(d.target as GraphNode).id || d.target}`)
      .join('line')
      .attr('stroke-width', d => Math.sqrt(d.value) * 2);

    // Update nodes using join pattern
    const node = nodeGroup
      .selectAll<SVGGElement, GraphNode>('g')
      .data(nodes, d => d.id)
      .join(
        enter => {
          const g = enter.append('g')
            .attr('class', 'node-group')
            .style('cursor', 'pointer')
            .call(d3.drag<SVGGElement, GraphNode>()
              .on('start', dragstarted)
              .on('drag', dragged)
              .on('end', dragended) as any);

          g.append('circle');
          g.append('text')
            .attr('x', 0)
            .attr('y', -28)
            .attr('text-anchor', 'middle')
            .attr('fill', '#1f2937')
            .attr('stroke', 'white')
            .attr('stroke-width', 3)
            .attr('paint-order', 'stroke')
            .attr('font-size', '13px')
            .style('pointer-events', 'none');

          return g;
        }
      );

    // Update circle attributes
    node.select('circle')
      .attr('r', d => d.group === 'path' || d.group === 'target' ? 20 : 15)
      .attr('fill', d => colorScale(d.group, d.type));

    // Update text attributes
    node.select('text')
      .text(d => d.id)
      .attr('font-weight', d => d.group === 'path' || d.group === 'target' ? 'bold' : 'normal');

    // Remove old event listeners and add new ones
    node.on('click', null).on('mouseenter', null).on('mouseleave', null);

    // Click handler for nodes
    node.on('click', (event, d) => {
      event.stopPropagation();

      if (d.group === 'option') {
        onSelectWord(d.id);
      } else if (d.group === 'path' && d.pathIndex !== undefined && d.pathIndex < path.length - 1) {
        onRevertToWord(d.id, d.pathIndex);
      }
    });

    // Highlight on hover
    node.on('mouseenter', function (event, d) {
      if (d.group === 'option' || (d.group === 'path' && d.pathIndex !== undefined && d.pathIndex < path.length - 1)) {
        const baseRadius = d.group === 'path' ? 20 : 15;
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('r', baseRadius + 4);
      }
    });

    node.on('mouseleave', function (event, d) {
      if (d.group === 'option' || (d.group === 'path' && d.pathIndex !== undefined && d.pathIndex < path.length - 1)) {
        const baseRadius = d.group === 'path' ? 20 : 15;
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('r', baseRadius);
      }
    });

    // Update positions on tick
    function ticked() {
      link
        .attr('x1', d => (d.source as GraphNode).x!)
        .attr('y1', d => (d.source as GraphNode).y!)
        .attr('x2', d => (d.target as GraphNode).x!)
        .attr('y2', d => (d.target as GraphNode).y!);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    }

    simulation.on('tick', ticked);

    // Drag functions
    function dragstarted(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
  }, [path, currentWord, targetWord, words, onSelectWord, onRevertToWord]);

  // State for tooltip
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string; visible: boolean }>({
    x: 0,
    y: 0,
    text: '',
    visible: false,
  });

  // Add hover handlers after the graph is created
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);

    svg.selectAll('g.node-group').on('mouseenter', async function (event, d: any) {
      const node = d as GraphNode;
      const definition = await fetchDefinition(node.id);

      setTooltip({
        x: event.pageX,
        y: event.pageY - 10,
        text: `${node.id}: ${definition}`,
        visible: true,
      });
    }).on('mousemove', function (event) {
      setTooltip(prev => ({
        ...prev,
        x: event.pageX,
        y: event.pageY - 10,
      }));
    }).on('mouseleave', function () {
      setTooltip(prev => ({ ...prev, visible: false }));
    });
  }, [path, words]);

  return (
    <div className="relative w-full h-full bg-white">
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-lg shadow-lg p-4 z-10">
        <h3 className="font-bold text-sm mb-2">Legend</h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-purple-500"></div>
            <span>Path</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-pink-500"></div>
            <span>Target</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span>Synonym</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span>Antonym</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span>Related</span>
          </div>
        </div>
      </div>

      {/* Proximity Thermometer Overlay */}
      <div className="absolute top-4 left-4 bg-white bg-opacity-90 rounded-lg shadow-lg p-4 z-10 w-80">
        <Thermometer proximity={proximity} />
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      )}

      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="fixed bg-gray-900 text-white text-sm px-3 py-2 rounded shadow-lg z-50 max-w-sm pointer-events-none"
          style={{
            left: `${tooltip.x + 10}px`,
            top: `${tooltip.y}px`,
          }}
        >
          {tooltip.text}
        </div>
      )}

      {/* SVG Canvas */}
      <svg ref={svgRef} className="w-full h-full" style={{ minHeight: '600px' }}></svg>
    </div>
  );
}
