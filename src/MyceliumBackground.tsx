import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

// ═══════════════════════════════════════════════════════════════════
// MOBILE DETECTION
// ═══════════════════════════════════════════════════════════════════

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
                     window.innerWidth < 768;
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
}

// ═══════════════════════════════════════════════════════════════════
// STATIC FALLBACK FOR MOBILE
// ═══════════════════════════════════════════════════════════════════

function StaticBackground() {
  return (
    <div className="fixed inset-0 -z-10 bg-[#0a0a0f] overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00ff88]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#8b5cf6]/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#fbbf24]/5 rounded-full blur-2xl" />
      
      {/* Static dots pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="1" fill="#00ff88" opacity="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>
      
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0f]/80" />
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-[#0a0a0f]/60" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// THREE.JS TYPES
// ═══════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════
// NETWORK GENERATION
// ═══════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════
// THREE.JS COMPONENTS
// ═══════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export function MyceliumBackground({
  nodeCount = 60,
  connectionProbability = 0.25,
}: MyceliumProps) {
  const isMobile = useIsMobile();
  const [webglFailed, setWebglFailed] = useState(false);
  
  // Check WebGL support
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebglFailed(true);
      }
    } catch {
      setWebglFailed(true);
    }
  }, []);
  
  // Use static background on mobile or if WebGL fails
  if (isMobile || webglFailed) {
    return <StaticBackground />;
  }
  
  return (
    <div className="fixed inset-0 -z-10 bg-[#0a0a0f]">
      <Canvas 
        camera={{ position: [0, 0, 12], fov: 60 }} 
        gl={{ antialias: true, alpha: true, failIfMajorPerformanceCaveat: true }}
        onCreated={({ gl }) => {
          // Additional mobile check via renderer
          if (gl.capabilities.maxTextures < 8) {
            setWebglFailed(true);
          }
        }}
      >
        <ambientLight intensity={0.1} />
        <MyceliumNetwork nodeCount={nodeCount} connectionProbability={connectionProbability} />
        <fog attach="fog" args={['#0a0a0f', 8, 20]} />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0f]/80" />
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-[#0a0a0f]/60" />
    </div>
  );
}

export default MyceliumBackground;
