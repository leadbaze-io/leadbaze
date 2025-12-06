import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function City() {
    const cityRef = useRef<THREE.Group>(null)
    const particlesRef = useRef<THREE.Points>(null)

    // Generate simple buildings
    const buildings = useMemo(() => {
        const buildingArray: Array<{ x: number; z: number; height: number }> = []
        const gridSize = 12
        const spacing = 1.5

        for (let x = -gridSize / 2; x < gridSize / 2; x += spacing) {
            for (let z = -gridSize / 2; z < gridSize / 2; z += spacing) {
                buildingArray.push({
                    x: x + (Math.random() - 0.5) * 0.3,
                    z: z + (Math.random() - 0.5) * 0.3,
                    height: Math.random() * 1.5 + 0.3
                })
            }
        }

        return buildingArray
    }, [])

    // Minimal particles
    const particles = useMemo(() => {
        const count = 80
        const positions = new Float32Array(count * 3)

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 18
            positions[i * 3 + 1] = Math.random() * 2.5
            positions[i * 3 + 2] = (Math.random() - 0.5) * 18
        }

        return positions
    }, [])

    // Animate
    useFrame((state) => {
        if (cityRef.current) {
            cityRef.current.rotation.y = state.clock.elapsedTime * 0.02
        }

        if (particlesRef.current) {
            const positions = particlesRef.current.geometry.attributes.position.array as Float32Array

            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] += 0.006
                if (positions[i + 1] > 3) {
                    positions[i + 1] = 0.3
                }
            }

            particlesRef.current.geometry.attributes.position.needsUpdate = true
        }
    })

    return (
        <group ref={cityRef} position={[0, -1, 0]} rotation={[-Math.PI / 5, 0, 0]}>
            {/* Buildings - simple wireframe boxes */}
            {buildings.map((building, i) => (
                <mesh key={i} position={[building.x, building.height / 2, building.z]}>
                    <boxGeometry args={[0.35, building.height, 0.35]} />
                    <meshBasicMaterial color="#00ff00" transparent opacity={0.2} wireframe />
                </mesh>
            ))}

            {/* Particles */}
            <points ref={particlesRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[particles, 3]}
                        count={particles.length / 3}
                        array={particles}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.015}
                    color="#00ff00"
                    transparent
                    opacity={0.6}
                    sizeAttenuation
                />
            </points>

            {/* Ground grid */}
            <gridHelper
                args={[20, 20, '#00ff00', '#00ff00']}
                position={[0, 0, 0]}
                material-transparent
                material-opacity={0.06}
            />
        </group>
    )
}
