# Physarum Demo Integration Guide

This guide explains how to integrate the Physarum decision network visualization into the vudo.univrs.io landing site.

## Quick Start

### 1. Copy Files to Your Project

Copy the contents of `src/` to your vudo.univrs.io project:

```bash
# From vudo.univrs.io project root
cp -r /path/to/physarum-demo/src/components/* src/components/
cp -r /path/to/physarum-demo/src/simulation/* src/simulation/
cp -r /path/to/physarum-demo/src/types/* src/types/
cp -r /path/to/physarum-demo/src/styles/* src/styles/
```

### 2. Install Dependencies

```bash
npm install three @types/three
```

### 3. Import the Section Component

In your `App.tsx` or page component:

```tsx
import { PhysarumSection } from './components/PhysarumSection';
import './styles/physarum.css';
import './styles/physarum-section.css';

function App() {
  return (
    <main>
      {/* Your existing hero section */}
      <HeroSection />
      
      {/* Add the Physarum demo section */}
      <PhysarumSection />
      
      {/* Rest of your landing page */}
      <FeaturesSection />
      {/* ... */}
    </main>
  );
}
```

### 4. (Optional) Use Just the Demo Component

If you only want the 3D visualization without the full section:

```tsx
import { PhysarumDemo } from './components/PhysarumDemo';
import './styles/physarum.css';

function YourComponent() {
  return (
    <div style={{ width: '100%', height: '600px' }}>
      <PhysarumDemo
        config={{
          scenario: 'migration',
          nodeCount: 7,
          initialConnectivity: 0.5,
          dynamicGradients: true,
          showLabels: true,
          showMetrics: true,
        }}
      />
    </div>
  );
}
```

## Configuration Options

### Demo Scenarios

| Scenario | Description |
|----------|-------------|
| `balanced` | All nodes have similar resources |
| `hotspot` | One node has high resources, others low |
| `migration` | Resources shift dynamically over time |
| `failure` | A random node goes offline |
| `growth` | Network starts sparse and grows |

### DemoConfig

```typescript
interface DemoConfig {
  scenario: DemoScenario;      // Which scenario to run
  nodeCount: number;           // Number of nodes (default: 7)
  initialConnectivity: number; // 0-1: how connected initially
  dynamicGradients: boolean;   // Enable gradient animation
  showLabels: boolean;         // Show node labels
  showMetrics: boolean;        // Show metrics panel
}
```

### VisualizationConfig

```typescript
interface VisualizationConfig {
  nodeBaseSize: number;       // Base sphere radius
  nodeGlowIntensity: number;  // Glow strength
  cameraDistance: number;     // Initial camera distance
  rotationSpeed: number;      // Auto-rotation speed
  bloomStrength: number;      // Post-process bloom
  bloomRadius: number;
  bloomThreshold: number;
}
```

## Customizing Styles

### CSS Variables

Override these in your global CSS to match your site's theme:

```css
:root {
  /* Core palette */
  --vudo-void: #0a0a0f;
  --vudo-substrate: #1a1a2e;
  --vudo-mycelium: #7fdbca;
  --vudo-cytoplasm: #ffd700;
  --vudo-inactive: #2d2d44;
  
  /* Typography */
  --font-display: 'Your Display Font', serif;
  --font-mono: 'Your Mono Font', monospace;
  --font-body: 'Your Body Font', sans-serif;
}
```

### Hiding Elements

```css
/* Hide metrics panel */
.physarum-metrics { display: none; }

/* Hide controls */
.physarum-controls { display: none; }

/* Hide info overlay */
.physarum-info { display: none; }
```

## Future: P2P Integration

When the P2P layer is ready, the demo can connect to real VUDO nodes via WebSocket:

```tsx
<PhysarumDemo
  config={{ /* ... */ }}
  websocketUrl="wss://your-vudo-node.example/ws"
  onNodeClick={(nodeId) => console.log('Clicked node:', nodeId)}
/>
```

The simulation engine is designed to accept real gradient data:

```typescript
import { initializePlasmodium, step } from './simulation/PhysarumEngine';

// Initialize with real node data
const plasmodium = initializePlasmodium(realNodes.length, 0.5);

// Update with real gradients from network
function onGradientUpdate(nodeId: string, gradient: ResourceGradient) {
  const node = plasmodium.nodes.get(nodeId);
  if (node) {
    plasmodium.nodes.set(nodeId, { ...node, gradient });
  }
}

// Connect to WebSocket
const ws = new WebSocket('wss://vudo-node/ws');
ws.onmessage = (event) => {
  const { nodeId, gradient } = JSON.parse(event.data);
  onGradientUpdate(nodeId, gradient);
};
```

## Performance Notes

- The Three.js scene uses instanced rendering for tubes
- Custom shaders minimize GPU overhead
- Bloom post-processing can be disabled for lower-end devices
- Target: 60 FPS on mid-range hardware

## Files Structure

```
src/
├── components/
│   ├── PhysarumDemo.tsx      # Main 3D visualization
│   └── PhysarumSection.tsx   # Full landing page section
├── simulation/
│   └── PhysarumEngine.ts     # Core physics simulation
├── types/
│   └── physarum.ts           # TypeScript types & constants
└── styles/
    ├── physarum.css          # Demo component styles
    └── physarum-section.css  # Section layout styles
```

## Questions?

Reach out to the Univrs team or open an issue in the repository.

---

*"The system that knows what it is, becomes what it knows."*
