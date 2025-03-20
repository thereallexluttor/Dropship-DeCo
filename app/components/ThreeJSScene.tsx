"use client"

import React, { useState, useRef, useMemo } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { EffectComposer, Bloom } from "@react-three/postprocessing"
import * as THREE from "three"

interface ParticleProps {
  color: string;
  count?: number;
  size?: number;
  mousePosition?: THREE.Vector2;
}

interface ParticleData {
  position: [number, number, number];
  factor: number;
  speed: number;
}

// Animated Particles Component with mouse interactivity
const Particles = ({ color, count = 500, size = 0.02, mousePosition }: ParticleProps) => {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const { viewport } = useThree()
  
  // Generate random particles
  const particles = useRef<ParticleData[]>([])
  if (!particles.current.length) {
    for (let i = 0; i < count; i++) {
      particles.current.push({
        position: [
          (Math.random() - 0.5) * 4, 
          (Math.random() - 0.5) * 4, 
          (Math.random() - 0.5) * 4
        ],
        factor: 0.2 + Math.random() * 2,
        speed: 0.01 + Math.random() / 200
      })
    }
  }

  const dummy = useRef(new THREE.Object3D())

  useFrame(state => {
    if (!mesh.current) return;
    
    const meshRef = mesh.current; // Guardar la referencia para evitar errores de nulidad
    const mouseX = mousePosition ? mousePosition.x : 0
    const mouseY = mousePosition ? mousePosition.y : 0
    
    particles.current.forEach((particle, i) => {
      let { position, factor, speed } = particle
      
      const t = state.clock.elapsedTime
      
      // Add subtle mouse influence to particle movement
      const mouseInfluence = 0.05
      
      dummy.current.position.set(
        position[0] + Math.sin(t * factor) / 10 + mouseX * mouseInfluence,
        position[1] + Math.cos(t * factor) / 10 + mouseY * mouseInfluence,
        position[2] + Math.cos(t * factor) / 10
      )
      
      dummy.current.updateMatrix()
      meshRef.setMatrixAt(i, dummy.current.matrix)
    })
    meshRef.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <circleGeometry args={[size, 24]} />
      <meshBasicMaterial color={color} transparent opacity={0.6} />
    </instancedMesh>
  )
}

// Floating Sparkles Component with mouse interactivity
const Sparkles = ({ color, count = 20, mousePosition }: ParticleProps) => {
  const sparklesMesh = useRef<THREE.Group>(null)
  
  useFrame(({ clock }) => {
    if (sparklesMesh.current) {
      const t = clock.getElapsedTime()
      sparklesMesh.current.rotation.x = Math.sin(t / 10) 
      sparklesMesh.current.rotation.y = Math.sin(t / 15)
      
      // Add mouse influence
      if (mousePosition) {
        sparklesMesh.current.position.x += (mousePosition.x * 0.01 - sparklesMesh.current.position.x) * 0.1
        sparklesMesh.current.position.y += (mousePosition.y * 0.01 - sparklesMesh.current.position.y) * 0.1
      }
    }
  })
  
  // Create a simple star shape using standard geometries
  const starShape = useMemo(() => {
    const shape = new THREE.Shape()
    const outerRadius = 0.05
    const innerRadius = 0.02
    const numPoints = 5
    
    for (let i = 0; i < numPoints * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius
      const angle = (Math.PI * 2 * i) / (numPoints * 2)
      const x = radius * Math.sin(angle)
      const y = radius * Math.cos(angle)
      
      if (i === 0) {
        shape.moveTo(x, y)
      } else {
        shape.lineTo(x, y)
      }
    }
    
    shape.closePath()
    return shape
  }, [])

  const starGeometry = useMemo(() => {
    return new THREE.ShapeGeometry(starShape)
  }, [starShape])
  
  return (
    <group ref={sparklesMesh}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh 
          key={i} 
          position={[
            (Math.random() - 0.5) * 3, 
            (Math.random() - 0.5) * 3, 
            (Math.random() - 0.5) * 3
          ]}
          rotation={[
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            0
          ]}
          scale={0.01 + Math.random() * 0.03}
        >
          <primitive object={starGeometry.clone()} />
          <meshBasicMaterial color={color} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  )
}

// Animated subtle jewelry ring effect
const JewelryRing = ({ color, radius = 0.5 }: { color: string, radius?: number }) => {
  const ring = useRef<THREE.Mesh>(null)
  
  useFrame(({ clock }) => {
    if (ring.current) {
      const t = clock.getElapsedTime()
      ring.current.rotation.x = Math.PI / 2 + Math.sin(t / 4) * 0.05
      ring.current.rotation.y = Math.sin(t / 5) * 0.05
      
      // Subtle breathing effect
      const scaleFactor = 1 + Math.sin(t) * 0.02
      ring.current.scale.set(scaleFactor, scaleFactor, 1)
    }
  })
  
  return (
    <mesh ref={ring} position={[0, 0, -0.5]}>
      <torusGeometry args={[radius, 0.02, 16, 100]} />
      <meshBasicMaterial color={color} transparent opacity={0.4} />
    </mesh>
  )
}

// Animation Scene
const Scene = ({ activeColor }: { activeColor: string }) => {
  const groupRef = useRef<THREE.Group>(null)
  const [mousePosition, setMousePosition] = useState<THREE.Vector2>(new THREE.Vector2(0, 0))
  
  // Usar directamente el mouse de react-three-fiber
  useFrame(({ clock, mouse }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() / 15
    }
    
    // Actualizar posición del mouse para todos los componentes hijos
    setMousePosition(new THREE.Vector2(mouse.x, mouse.y))
  })
  
  return (
    <group ref={groupRef}>
      <Particles color={activeColor} mousePosition={mousePosition} />
      <Sparkles color={activeColor} mousePosition={mousePosition} />
      <JewelryRing color={activeColor} />
      <JewelryRing color={activeColor} radius={0.8} />
      <EffectComposer>
        <Bloom 
          luminanceThreshold={0.2} 
          luminanceSmoothing={0.9} 
          height={300} 
        />
      </EffectComposer>
    </group>
  )
}

// Componente principal exportado
interface ThreeJSSceneProps {
  activeColor: string;
}

const ThreeJSScene: React.FC<ThreeJSSceneProps> = ({ activeColor }) => {
  return (
    <Canvas 
      camera={{ position: [0, 0, 2], fov: 60 }}
      dpr={[1, 2]} // Responsive performance optimization
    >
      <Scene activeColor={activeColor} />
    </Canvas>
  )
}

export default ThreeJSScene; 