import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Environment, ContactShadows, Sphere } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════════
   AI Core Orb — The glowing reactive 3D sphere
   Using React Three Fiber for real WebGL rendering
   ═══════════════════════════════════════════════════ */

/**
 * Animated particle ring orbiting the core
 */
const ParticleRing = ({ count = 60, radius = 2.2, speed = 0.3, color = '#00f0ff', size = 0.02 }) => {
  const ref = useRef();
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.3;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return pos;
  }, [count, radius]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += speed * 0.005;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        color={color}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
};

/**
 * Orbital ring — thin glowing torus around the orb
 */
const OrbitalRing = ({ radius = 1.8, speed = 0.5, tilt = 0.3, color = '#00f0ff', opacity = 0.12 }) => {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z += speed * 0.003;
      ref.current.rotation.x = tilt + Math.sin(state.clock.elapsedTime * 0.15) * 0.05;
    }
  });

  return (
    <mesh ref={ref} rotation={[tilt, 0, 0]}>
      <torusGeometry args={[radius, 0.005, 16, 100]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} side={THREE.DoubleSide} />
    </mesh>
  );
};

/**
 * The main AI Core orb with distortion and fresnel glow
 */
const AICore = () => {
  const meshRef = useRef();
  const glowRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.15;
      meshRef.current.rotation.x = Math.sin(t * 0.1) * 0.1;
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1.15 + Math.sin(t * 0.8) * 0.03);
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <group>
        {/* Inner core */}
        <Sphere ref={meshRef} args={[1, 128, 128]}>
          <MeshDistortMaterial
            color="#0a0e1a"
            emissive="#1a0a3e"
            emissiveIntensity={0.5}
            roughness={0.15}
            metalness={0.9}
            distort={0.25}
            speed={2}
            envMapIntensity={1}
          />
        </Sphere>

        {/* Outer glow shell */}
        <Sphere ref={glowRef} args={[1.15, 64, 64]}>
          <meshBasicMaterial
            color="#00f0ff"
            transparent
            opacity={0.04}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
          />
        </Sphere>

        {/* Fresnel edge glow */}
        <Sphere args={[1.05, 64, 64]}>
          <shaderMaterial
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            vertexShader={`
              varying vec3 vNormal;
              varying vec3 vPosition;
              void main() {
                vNormal = normalize(normalMatrix * normal);
                vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `}
            fragmentShader={`
              varying vec3 vNormal;
              varying vec3 vPosition;
              void main() {
                vec3 viewDir = normalize(-vPosition);
                float fresnel = pow(1.0 - dot(viewDir, vNormal), 3.0);
                vec3 cyan = vec3(0.0, 0.94, 1.0);
                vec3 violet = vec3(0.486, 0.227, 0.929);
                vec3 color = mix(cyan, violet, fresnel);
                gl_FragColor = vec4(color, fresnel * 0.6);
              }
            `}
          />
        </Sphere>

        {/* Orbital rings */}
        <OrbitalRing radius={1.6} speed={0.4} tilt={1.2} color="#00f0ff" opacity={0.15} />
        <OrbitalRing radius={1.9} speed={-0.3} tilt={0.8} color="#7c3aed" opacity={0.1} />
        <OrbitalRing radius={2.3} speed={0.2} tilt={1.5} color="#f472b6" opacity={0.06} />

        {/* Particle systems */}
        <ParticleRing count={80} radius={2.0} speed={0.25} color="#00f0ff" size={0.015} />
        <ParticleRing count={50} radius={2.5} speed={-0.15} color="#7c3aed" size={0.012} />
        <ParticleRing count={30} radius={3.0} speed={0.1} color="#f472b6" size={0.01} />
      </group>
    </Float>
  );
};

/**
 * Background star field
 */
const Starfield = ({ count = 200 }) => {
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, [count]);

  const ref = useRef();
  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.0003;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.015}
        color="#ffffff"
        transparent
        opacity={0.5}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

/**
 * Complete 3D Scene with Canvas wrapper
 */
const AIOrbScene = ({ className = '', style = {} }) => {
  return (
    <div className={className} style={{ width: '100%', height: '100%', ...style }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.1} />
          <pointLight position={[5, 5, 5]} intensity={0.5} color="#00f0ff" />
          <pointLight position={[-5, -3, 3]} intensity={0.3} color="#7c3aed" />
          <pointLight position={[0, -5, -5]} intensity={0.2} color="#f472b6" />
          <Environment preset="night" />

          {/* Scene objects */}
          <AICore />
          <Starfield count={300} />

          {/* Ground shadow */}
          <ContactShadows
            position={[0, -2.5, 0]}
            opacity={0.15}
            scale={10}
            blur={2}
            far={5}
            color="#00f0ff"
          />

          {/* Post-processing */}
          <EffectComposer>
            <Bloom
              luminanceThreshold={0.2}
              luminanceSmoothing={0.9}
              intensity={0.8}
              mipmapBlur
            />
            <ChromaticAberration offset={[0.0005, 0.0005]} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
};

export default AIOrbScene;
