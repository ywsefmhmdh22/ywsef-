 "use client";

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const DynamicOrb: React.FC = () => {
  const meshRef = useRef<THREE.Mesh | null>(null);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += delta * 0.1;
    meshRef.current.rotation.y += delta * 0.2;
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.5;
  });

  return (
    <mesh ref={meshRef} scale={1.5}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        color={new THREE.Color("#3b82f6")}
        emissive={new THREE.Color("#007bff")}
        emissiveIntensity={1.5}
        wireframe
      />
    </mesh>
  );
};

const CubeModel: React.FC = () => {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 70 }} className="!bg-transparent">
      <ambientLight intensity={0.5} color="#4f46e5" />
      <pointLight position={[5, 5, 5]} intensity={50} color="#facc15" />
      <DynamicOrb />
    </Canvas>
  );
};

export default CubeModel;
