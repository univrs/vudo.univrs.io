import { useRef, useMemo } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

// Extend Three.js line to avoid conflict with SVG line
extend({ Line_: THREE.Line });

interface Node {
  id: string;
  position: THREE.Vector3;
  type: 'mitan' | 'node' | 'spirit';
  activity: number;
}

interface Edge {
  from: THREE.Vector3;
  to: THREE.Vector3;
  strength: number;
}

interface MyceliumProps {
  nodeCount?: number;
  connectionProbability?: number;
}

function generateNetwork(nodeCount: number, connectionProbability: number) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  for (let i = 0; i < nodeCount; i++) {
    const phi = Math.acos(1 - (2 * (i + 0.5)) / nodeCount);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    const radius = 5 + Math.random() * 3;
    
    nodes.push({
      id: `node-${i}`,
      position: new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      ),
      type: i === 0 ? 'mitan' : Math.random() > 0.9 ? 'spirit' : 'node',
      activity: Math.random(),
    });
  }

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const distance = nodes[i].position.distanceTo(nodes[j].position);
      if (distance < 4 && Math.random() < connectionProbability) {
        edges.push({
          from: nodes[i].position,
          to: nodes[j].position,
          strength: 1 - distance / 4,
        });
      }
    }
  }

  return { nodes, edges };
}

function MyceliumNode({ node }: { node: Node }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const color = useMemo(() => {
    switch (node.type) {
      case 'mitan': return new THREE.Color('#00ff88');
      case 'spirit': return new THREE.Color('#8b5cf6');
      default: return new THREE.Color('#00cc6a');
    }
  }, [node.type]);
  
  const size = node.type === 'mitan' ? 0.15 : node.type === 'spirit' ? 0.08 : 0.05;
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const pulse = 1 + 0.1 * Math.sin(clock.elapsedTime * 2 + node.activity * Math.PI * 2);
      meshRef.current.scale.setScalar(size * pulse);
    }
  });
  
  return (
    <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.2}>
      <mesh ref={meshRef} position={node.position}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} />
      </mesh>
    </Float>
  );
}

function MyceliumEdge({ from, to }: { from: THREE.Vector3; to: THREE.Vector3 }) {
  const points = useMemo(() => {
    const mid = from.clone().add(to).multiplyScalar(0.5);
    const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
    return curve.getPoints(20);
  }, [from, to]);
  
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);
  const material = useMemo(() => new THREE.LineBasicMaterial({ color: '#00ff88', transparent: true, opacity: 0.2 }), []);
  
  return <primitive object={new THREE.Line(geometry, material)} />;
}

function MyceliumNetwork({ nodeCount = 50, connectionProbability = 0.25 }: MyceliumProps) {
  const { nodes, edges } = useMemo(
    () => generateNetwork(nodeCount, connectionProbability),
    [nodeCount, connectionProbability]
  );
  
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
      groupRef.current.rotation.x = Math.sin(Date.now() * 0.0001) * 0.1;
    }
  });
  
  return (
    <group ref={groupRef}>
      {edges.map((edge, i) => (
        <MyceliumEdge key={`edge-${i}`} from={edge.from} to={edge.to} />
      ))}
      {nodes.map(node => (
        <MyceliumNode key={node.id} node={node} />
      ))}
    </group>
  );
}

export function MyceliumBackground({
  nodeCount = 60,
  connectionProbability = 0.25,
}: MyceliumProps) {
  // Detect mobile devices to reduce performance load
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  }, []);

  // Reduce node count and connection probability on mobile for better performance
  const effectiveNodeCount = isMobile ? Math.floor(nodeCount / 2) : nodeCount;
  const effectiveConnectionProbability = isMobile ? connectionProbability * 0.5 : connectionProbability;

  return (
    <div className="fixed inset-0 -z-10 bg-[#0a0a0f]">
      <Canvas camera={{ position: [0, 0, 12], fov: 60 }} gl={{ antialias: !isMobile, alpha: true }}>
        <ambientLight intensity={0.1} />
        <MyceliumNetwork nodeCount={effectiveNodeCount} connectionProbability={effectiveConnectionProbability} />
        <fog attach="fog" args={['#0a0a0f', 8, 20]} />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0f]/80" />
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-[#0a0a0f]/60" />
    </div>
  );
}

export default MyceliumBackground;
