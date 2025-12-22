import React, { useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

type VeveType = 'mitan' | 'spirit' | 'seance' | 'mycelium' | 'loa';

interface VevePatternProps {
  type: VeveType;
  size?: number;
  color?: string;
  strokeWidth?: number;
  animated?: boolean;
  delay?: number;
  className?: string;
}

function generatePath(type: VeveType, size: number): string {
  const c = size / 2;
  
  switch (type) {
    case 'mitan': {
      const r1 = size * 0.4;
      const r2 = size * 0.25;
      const r3 = size * 0.1;
      return `
        M ${c} ${c - r1} L ${c + r1} ${c} L ${c} ${c + r1} L ${c - r1} ${c} Z
        M ${c} ${c - r2} L ${c + r2} ${c} L ${c} ${c + r2} L ${c - r2} ${c} Z
        M ${c - r1} ${c} L ${c + r1} ${c}
        M ${c} ${c - r1} L ${c} ${c + r1}
        M ${c} ${c} m -${r3} 0 a ${r3} ${r3} 0 1 0 ${r3 * 2} 0 a ${r3} ${r3} 0 1 0 -${r3 * 2} 0
      `;
    }
    case 'spirit': {
      const points = 8;
      const outerR = size * 0.4;
      const innerR = size * 0.2;
      let path = '';
      for (let i = 0; i < points; i++) {
        const outerAngle = (i * 2 * Math.PI) / points - Math.PI / 2;
        const innerAngle = ((i + 0.5) * 2 * Math.PI) / points - Math.PI / 2;
        const ox = c + outerR * Math.cos(outerAngle);
        const oy = c + outerR * Math.sin(outerAngle);
        const ix = c + innerR * Math.cos(innerAngle);
        const iy = c + innerR * Math.sin(innerAngle);
        if (i === 0) path += `M ${ox} ${oy}`;
        path += ` L ${ix} ${iy}`;
        const nextAngle = ((i + 1) * 2 * Math.PI) / points - Math.PI / 2;
        path += ` L ${c + outerR * Math.cos(nextAngle)} ${c + outerR * Math.sin(nextAngle)}`;
      }
      return path + ' Z';
    }
    case 'seance': {
      const r = size * 0.25;
      const offset = size * 0.15;
      return `
        M ${c} ${c - offset} m -${r} 0 a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 -${r * 2} 0
        M ${c - offset * 0.866} ${c + offset * 0.5} m -${r} 0 a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 -${r * 2} 0
        M ${c + offset * 0.866} ${c + offset * 0.5} m -${r} 0 a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 -${r * 2} 0
      `;
    }
    case 'mycelium': {
      const branches: string[] = [];
      for (let i = 0; i < 6; i++) {
        const angle = (i * 2 * Math.PI) / 6;
        const length = size * 0.35;
        const x2 = c + length * Math.cos(angle);
        const y2 = c + length * Math.sin(angle);
        branches.push(`M ${c} ${c} L ${x2} ${y2}`);
        const midX = c + (length * 0.6) * Math.cos(angle);
        const midY = c + (length * 0.6) * Math.sin(angle);
        const subLength = size * 0.15;
        branches.push(`M ${midX} ${midY} L ${midX + subLength * Math.cos(angle + 0.5)} ${midY + subLength * Math.sin(angle + 0.5)}`);
        branches.push(`M ${midX} ${midY} L ${midX + subLength * Math.cos(angle - 0.5)} ${midY + subLength * Math.sin(angle - 0.5)}`);
      }
      const nodeR = size * 0.06;
      branches.push(`M ${c + nodeR} ${c} A ${nodeR} ${nodeR} 0 1 0 ${c - nodeR} ${c} A ${nodeR} ${nodeR} 0 1 0 ${c + nodeR} ${c}`);
      return branches.join(' ');
    }
    case 'loa': {
      const r = size * 0.35;
      return `
        M ${c} ${c - r} Q ${c + r * 0.5} ${c - r * 0.5} ${c + r} ${c}
        Q ${c + r * 0.5} ${c + r * 0.5} ${c} ${c + r}
        Q ${c - r * 0.5} ${c + r * 0.5} ${c - r} ${c}
        Q ${c - r * 0.5} ${c - r * 0.5} ${c} ${c - r}
        M ${c} ${c - r * 0.5} L ${c + r * 0.4} ${c} L ${c} ${c + r * 0.5} L ${c - r * 0.4} ${c} Z
      `;
    }
    default:
      return '';
  }
}

export function VevePattern({
  type,
  size = 100,
  color = '#fbbf24',
  strokeWidth = 1.5,
  animated = true,
  delay = 0,
  className = '',
}: VevePatternProps) {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const controls = useAnimation();
  
  const path = generatePath(type, size);
  const pathLength = size * 10;
  
  useEffect(() => {
    if (isInView && animated) {
      controls.start({
        strokeDashoffset: 0,
        opacity: 1,
        transition: {
          strokeDashoffset: { duration: 2, delay, ease: 'easeInOut' },
          opacity: { duration: 0.5, delay },
        },
      });
    }
  }, [isInView, animated, controls, delay]);
  
  const glowId = `veve-glow-${type}-${Math.random().toString(36).slice(2)}`;
  
  return (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      style={{ overflow: 'visible' }}
    >
      <defs>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feFlood floodColor={color} floodOpacity="0.6" />
          <feComposite in2="blur" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      <motion.path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${glowId})`}
        initial={animated ? { strokeDasharray: pathLength, strokeDashoffset: pathLength, opacity: 0 } : {}}
        animate={controls}
      />
    </svg>
  );
}

export default VevePattern;
