import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float } from '@react-three/drei';
import FloatingOrb from './FloatingOrb';
import ParticleField from './ParticleField';

const OrbitingSphere = ({ radius, speed, size, color }) => {
  const ref = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;
    if (ref.current) {
      ref.current.position.x = Math.cos(t) * radius;
      ref.current.position.z = Math.sin(t) * radius;
      ref.current.position.y = Math.sin(t * 0.5) * (radius * 0.3);
    }
  });

  return (
    <mesh ref={ref}>
      <octahedronGeometry args={[size, 0]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
};

const SceneContent = () => {
  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[5, 5, 5]} color="#ffffff" intensity={2} />
      <pointLight position={[-5, -3, 3]} color="#468A73" intensity={1.5} />
      <pointLight position={[0, 3, -5]} color="#B0E4CC" intensity={1} />

      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <FloatingOrb position={[0, 0, 0]} />
      </Float>

      <OrbitingSphere radius={3} speed={0.5} size={0.08} color="#ffffff" />
      <OrbitingSphere radius={3.5} speed={0.3} size={0.06} color="#468A73" />
      <OrbitingSphere radius={4} speed={0.7} size={0.1} color="#ffffff" />
      <OrbitingSphere radius={2.5} speed={0.4} size={0.05} color="#468A73" />
      <OrbitingSphere radius={4.5} speed={0.6} size={0.07} color="#ffffff" />

      <ParticleField count={150} />

      <Stars
        radius={50}
        depth={50}
        count={2000}
        factor={3}
        saturation={0}
        fade
        speed={0.5}
      />
    </>
  );
};

const HeroScene = ({ className = '' }) => {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>

      {/* Radial glow behind canvas */}
      <div
        className="absolute inset-0 pointer-events-none -z-10"
        style={{
          background:
            'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(176,228,204,0.08) 0%, transparent 70%)',
        }}
      />
    </div>
  );
};

export default HeroScene;
