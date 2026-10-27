'use client'

import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Lightformer, Float, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

// A procedural chibi-boy mascot in real 3D (WebGL via react-three-fiber), built
// from primitives — no external model. Colours mirror the SVG mascot: navy hair,
// warm skin, pale robe, amber star. Lazy-loaded by MascotAvatar with the SVG as
// the fallback, so WebGL never touches SSR or first paint.

const NAVY = '#2B3A55'
const NAVY_LT = '#3C517A'
const SKIN = '#F7DCBB'
const ROBE = '#EEF2F6'
const AMBER = '#E8A33D'

// Smooth bell-shaped gown, turned on a lathe — far rounder than a scaled sphere.
function useGownGeometry() {
  return useMemo(() => {
    const pts: THREE.Vector2[] = [
      [0.0, -1.62],
      [0.32, -1.6],
      [0.56, -1.5],
      [0.72, -1.28],
      [0.78, -1.0],
      [0.74, -0.72],
      [0.63, -0.46],
      [0.49, -0.24],
      [0.36, -0.05],
      [0.3, 0.05],
    ].map(([x, y]) => new THREE.Vector2(x, y))
    return new THREE.LatheGeometry(pts, 64)
  }, [])
}

function Character({ animate }: { animate: boolean }) {
  const eyes = useRef<THREE.Group>(null)
  const star = useRef<THREE.Group>(null)
  const gown = useGownGeometry()

  useFrame((state) => {
    if (!animate) return
    const t = state.clock.elapsedTime
    if (star.current) {
      // gentle front-facing sway so the star stays in view (no full orbit behind)
      star.current.rotation.y = Math.sin(t * 0.8) * 0.5
      star.current.position.y = Math.sin(t * 1.4) * 0.08
    }
    if (eyes.current) {
      const phase = t % 3.6
      eyes.current.scale.y = phase > 3.48 ? 0.1 : 1
    }
  })

  return (
    <group position={[0, 0.08, 0]}>
      {/* gown / body */}
      <mesh geometry={gown}>
        <meshStandardMaterial color={ROBE} roughness={0.72} metalness={0} envMapIntensity={0.7} side={THREE.DoubleSide} />
      </mesh>
      {/* amber collar */}
      <mesh position={[0, -0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.33, 0.05, 20, 48]} />
        <meshStandardMaterial color={AMBER} roughness={0.35} metalness={0.1} emissive={AMBER} emissiveIntensity={0.1} />
      </mesh>
      {/* sleeves + little hands */}
      <mesh position={[-0.66, -0.56, 0.1]} scale={[1, 1.2, 1]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color={ROBE} roughness={0.72} envMapIntensity={0.7} />
      </mesh>
      <mesh position={[0.66, -0.56, 0.1]} scale={[1, 1.2, 1]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color={ROBE} roughness={0.72} envMapIntensity={0.7} />
      </mesh>
      <mesh position={[-0.72, -0.78, 0.18]}>
        <sphereGeometry args={[0.12, 24, 24]} />
        <meshStandardMaterial color={SKIN} roughness={0.5} envMapIntensity={0.8} />
      </mesh>
      <mesh position={[0.72, -0.78, 0.18]}>
        <sphereGeometry args={[0.12, 24, 24]} />
        <meshStandardMaterial color={SKIN} roughness={0.5} envMapIntensity={0.8} />
      </mesh>

      {/* head */}
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.95, 64, 64]} />
        <meshStandardMaterial color={SKIN} roughness={0.5} metalness={0} envMapIntensity={0.85} />
      </mesh>
      {/* ears */}
      <mesh position={[-0.92, 0.55, 0]}>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshStandardMaterial color={SKIN} roughness={0.5} envMapIntensity={0.8} />
      </mesh>
      <mesh position={[0.92, 0.55, 0]}>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshStandardMaterial color={SKIN} roughness={0.5} envMapIntensity={0.8} />
      </mesh>

      {/* hair: cap + fringe + side tufts + cowlick */}
      <group>
        <mesh position={[0, 0.82, -0.08]} scale={[1.06, 0.98, 1.08]}>
          <sphereGeometry args={[0.92, 64, 64, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
          <meshStandardMaterial color={NAVY} roughness={0.34} metalness={0.12} envMapIntensity={1} side={THREE.DoubleSide} />
        </mesh>
        {/* fringe sweeping over the forehead */}
        <mesh position={[0, 0.98, 0.52]} rotation={[0.25, 0, 0]} scale={[1, 0.46, 0.62]}>
          <sphereGeometry args={[0.72, 48, 48]} />
          <meshStandardMaterial color={NAVY} roughness={0.34} metalness={0.12} envMapIntensity={1} />
        </mesh>
        {/* a lighter navy sheen strand for depth */}
        <mesh position={[-0.2, 1.12, 0.46]} rotation={[0.3, 0.2, 0.3]} scale={[0.5, 0.25, 0.4]}>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshStandardMaterial color={NAVY_LT} roughness={0.3} metalness={0.15} envMapIntensity={1} />
        </mesh>
        {/* side tufts */}
        <mesh position={[-0.74, 0.86, 0.18]} rotation={[0, 0, 0.6]}>
          <coneGeometry args={[0.2, 0.42, 20]} />
          <meshStandardMaterial color={NAVY} roughness={0.34} metalness={0.12} />
        </mesh>
        <mesh position={[0.74, 0.86, 0.18]} rotation={[0, 0, -0.6]}>
          <coneGeometry args={[0.2, 0.42, 20]} />
          <meshStandardMaterial color={NAVY} roughness={0.34} metalness={0.12} />
        </mesh>
        {/* cowlick */}
        <mesh position={[0.18, 1.52, 0.06]} rotation={[0.1, 0, -0.55]}>
          <coneGeometry args={[0.12, 0.4, 20]} />
          <meshStandardMaterial color={NAVY} roughness={0.34} metalness={0.12} />
        </mesh>
      </group>

      {/* eyes */}
      <group ref={eyes}>
        <mesh position={[-0.33, 0.54, 0.82]} scale={[0.82, 1.2, 0.7]}>
          <sphereGeometry args={[0.2, 32, 32]} />
          <meshStandardMaterial color={NAVY} roughness={0.18} metalness={0.05} />
        </mesh>
        <mesh position={[0.33, 0.54, 0.82]} scale={[0.82, 1.2, 0.7]}>
          <sphereGeometry args={[0.2, 32, 32]} />
          <meshStandardMaterial color={NAVY} roughness={0.18} metalness={0.05} />
        </mesh>
        {/* big catchlights */}
        <mesh position={[-0.27, 0.62, 0.99]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} toneMapped={false} />
        </mesh>
        <mesh position={[0.39, 0.62, 0.99]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} toneMapped={false} />
        </mesh>
        {/* small lower sparkle */}
        <mesh position={[-0.38, 0.49, 0.97]}>
          <sphereGeometry args={[0.03, 12, 12]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} toneMapped={false} />
        </mesh>
      </group>

      {/* cheeks */}
      <mesh position={[-0.58, 0.38, 0.72]} scale={[1, 0.62, 0.35]}>
        <sphereGeometry args={[0.15, 24, 24]} />
        <meshStandardMaterial color={AMBER} transparent opacity={0.45} roughness={0.9} />
      </mesh>
      <mesh position={[0.58, 0.38, 0.72]} scale={[1, 0.62, 0.35]}>
        <sphereGeometry args={[0.15, 24, 24]} />
        <meshStandardMaterial color={AMBER} transparent opacity={0.45} roughness={0.9} />
      </mesh>

      {/* smile */}
      <mesh position={[0, 0.33, 0.86]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.15, 0.03, 16, 32, Math.PI * 0.85]} />
        <meshStandardMaterial color={NAVY} roughness={0.4} />
      </mesh>

      {/* orbiting amber star + its glow light */}
      <group ref={star}>
        <mesh position={[1.2, 1.2, 0.35]} rotation={[0.4, 0, 0.785]}>
          <octahedronGeometry args={[0.22, 0]} />
          <meshStandardMaterial color={AMBER} emissive={AMBER} emissiveIntensity={1.4} roughness={0.25} metalness={0.3} toneMapped={false} />
        </mesh>
        <pointLight position={[1.2, 1.2, 0.5]} color={AMBER} intensity={6} distance={3} />
      </group>
    </group>
  )
}

export default function Mascot3D({ size = 40, animate = true }: { size?: number; animate?: boolean }) {
  const body = (
    <>
      {/* Self-contained studio lighting (lightformers, no HDRI download). */}
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={2.6} color="#ffffff" position={[0, 2.5, 3]} scale={[5, 5, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#ffd8a6" position={[-3.5, 1, 2]} scale={[3, 4, 1]} />
        <Lightformer form="circle" intensity={1.4} color="#9fc0ff" position={[3.5, 0.5, -1]} scale={[3, 3, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#ffffff" position={[0, -2, 1]} scale={[4, 2, 1]} />
      </Environment>
      <ambientLight intensity={0.35} />
      <directionalLight position={[2.5, 4, 4]} intensity={1.1} />
      <ContactShadows position={[0, -1.7, 0]} opacity={0.35} scale={5} blur={2.6} far={3} color="#000000" />
      {animate ? (
        <Float speed={2.2} rotationIntensity={0.5} floatIntensity={0.7} floatingRange={[-0.08, 0.08]}>
          <Character animate={animate} />
        </Float>
      ) : (
        <Character animate={animate} />
      )}
    </>
  )

  return (
    <div style={{ width: size, height: size }} aria-label="Ydiboras mascot" role="img">
      <Canvas
        camera={{ position: [0, 0.45, 5.1], fov: 32 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
        dpr={[1, 2]}
        frameloop={animate ? 'always' : 'demand'}
        style={{ background: 'transparent' }}
      >
        {body}
      </Canvas>
    </div>
  )
}
