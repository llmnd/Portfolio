'use client';

import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, OrbitControls, Preload } from '@react-three/drei';
import * as THREE from 'three';

interface TechItem {
  name: string;
  position: THREE.Vector3;
  color: string;
}

const TechNode = ({ name, position, color, isHovered, onHover }: any) => {
  const ref = useRef<THREE.Mesh>(null);
  const textRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x += 0.003;
      ref.current.rotation.y += 0.002;

      if (isHovered) {
        ref.current.scale.lerp(new THREE.Vector3(1.3, 1.3, 1.3), 0.1);
      } else {
        ref.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }

    if (textRef.current && isHovered) {
      textRef.current.rotation.copy(state.camera.rotation);
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={ref}
        onClick={() => onHover(name)}
        onPointerEnter={() => onHover(name)}
        onPointerLeave={() => onHover(null)}
      >
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isHovered ? 0.6 : 0.2}
          metalness={0.7}
          roughness={0.2}
        />
      </mesh>

      {isHovered && (
        <mesh scale={1.5}>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.3}
            transparent
            opacity={0.2}
          />
        </mesh>
      )}

      {isHovered && (
        <Text
          ref={textRef}
          position={[0, 1.5, 0]}
          fontSize={0.6}
          color={color}
          anchorX="center"
          anchorY="bottom"
          fillOpacity={1}
        >
          {name}
        </Text>
      )}
    </group>
  );
};

const OrbitingTechs = ({ techs, selectedTech, onHover }: any) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z += 0.0005;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[1.2, 64, 64]} />
        <meshStandardMaterial
          color="#00d4ff"
          emissive="#00d4ff"
          emissiveIntensity={0.3}
          wireframe={true}
          transparent
          opacity={0.3}
        />
      </mesh>

      {techs.map((tech: TechItem, i: number) => {
        const angle = (i / techs.length) * Math.PI * 2;
        const orbitRadius = 8;
        const x = Math.cos(angle) * orbitRadius;
        const z = Math.sin(angle) * orbitRadius;

        return (
          <TechNode
            key={tech.name}
            name={tech.name}
            position={[x, Math.random() * 2 - 1, z]}
            color={tech.color}
            isHovered={selectedTech === tech.name}
            onHover={onHover}
          />
        );
      })}

      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[8, 0.1, 16, 100]} />
        <meshStandardMaterial
          color="#00d4ff"
          emissive="#00d4ff"
          emissiveIntensity={0.1}
          transparent
          opacity={0.2}
        />
      </mesh>
    </group>
  );
};

const TechStackScene = ({ techs, selectedTech, onHover }: any) => {
  return (
    <>
      <color attach="background" args={['#020617']} />
      <ambientLight intensity={0.5} />
      <pointLight position={[20, 20, 20]} intensity={1} color="#00d4ff" />
      <pointLight position={[-20, -20, 20]} intensity={0.5} color="#ff00ff" />
      <OrbitingTechs techs={techs} selectedTech={selectedTech} onHover={onHover} />
      <OrbitControls enableZoom enablePan autoRotate autoRotateSpeed={2} />
      <Preload all />
    </>
  );
};

export const TechStackGlobe3D = ({ techs }: { techs: string[] }) => {
  const [selectedTech, setSelectedTech] = useState<string | null>(null);

  const techData = techs.map((name, i) => ({
    name,
    position: new THREE.Vector3(0, 0, 0),
    color: [
      '#00d4ff',
      '#f3f4f6',
      '#0d3b66',
      '#336791',
      '#2496ed',
      '#38b6ff',
      '#1389fd',
      '#f34212',
      '#fcc624',
    ][i % 9],
  }));

  return (
    <div className="h-[400px] w-full overflow-hidden rounded-3xl border border-[var(--line)]">
      <Canvas camera={{ position: [0, 8, 18], fov: 45 }}>
        <TechStackScene
          techs={techData}
          selectedTech={selectedTech}
          onHover={setSelectedTech}
        />
      </Canvas>
    </div>
  );
};

export default TechStackGlobe3D;
