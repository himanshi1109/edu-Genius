import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial } from '@react-three/drei';

const FloatingOrb = ({ position = [0, 0, 0], scale = 1 }) => {
  const outerRef = useRef();
  const innerRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (outerRef.current) {
      outerRef.current.rotation.y = t * 0.2;
      outerRef.current.rotation.x = t * 0.1;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y = -t * 0.15;
    }
  });

  return (
    <group position={position} scale={scale}>
      {/* Outer Geodesic Wireframe - Light Emerald */}
      <mesh ref={outerRef}>
        <icosahedronGeometry args={[1.6, 2]} />
        <meshStandardMaterial
          color="#B0E4CC"
          emissive="#468A73"
          emissiveIntensity={1.2}
          wireframe
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Inner Geodesic Shell - Slightly thicker wireframe for depth */}
      <mesh ref={outerRef}>
        <icosahedronGeometry args={[1.58, 1]} />
        <meshStandardMaterial
          color="#468A73"
          wireframe
          transparent
          opacity={0.2}
        />
      </mesh>

      {/* Dark Emerald Core - The Solid Part */}
      <mesh ref={innerRef}>
        <icosahedronGeometry args={[1.3, 1]} />
        <meshStandardMaterial
          color="#061510"
          emissive="#0f2a20"
          emissiveIntensity={0.5}
          flatShading
        />
      </mesh>

      {/* Internal Glow - Soft Pulse */}
      <mesh>
        <sphereGeometry args={[1.1, 16, 16]} />
        <meshStandardMaterial
          color="#B0E4CC"
          emissive="#B0E4CC"
          emissiveIntensity={0.8}
          transparent
          opacity={0.2}
        />
      </mesh>
    </group>
  );
};

export default FloatingOrb;
