import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';

// ThreeLab: smoke test for the 3D kit (three.js via @remotion/three) — a lit PBR box turning, to prove WebGL renders here.
// npx remotion still src/index.ts ThreeLab qa/lab/three.png --gl=angle
export const ThreeLab: React.FC = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{background: '#101216'}}>
    <ThreeCanvas width={1080} height={1080} camera={{position: [3, 2.2, 3.4], fov: 35}}>
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 3]} intensity={2.2} />
      <mesh rotation={[0, f / 30, 0]}>
        <boxGeometry args={[1.6, 0.25, 1.6]} />
        <meshPhysicalMaterial color="#2b7a3e" roughness={0.45} metalness={0.1} clearcoat={0.6} />
      </mesh>
      <mesh position={[0, 0.3, 0]} rotation={[0, f / 30, 0]}>
        <boxGeometry args={[0.8, 0.12, 0.8]} />
        <meshPhysicalMaterial color="#c9ccd1" roughness={0.25} metalness={0.9} />
      </mesh>
    </ThreeCanvas>
  </AbsoluteFill>;
};
