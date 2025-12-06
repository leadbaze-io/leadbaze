import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Props {
    count: number
}

export default function ParticleField({ count }: Props) {
    const pointsRef = useRef<THREE.Points>(null)
    const linesRef = useRef<THREE.LineSegments>(null)

    // Generate particle positions
    const particles = useMemo(() => {
        const positions = new Float32Array(count * 3)

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 12
            positions[i * 3 + 1] = (Math.random() - 0.5) * 8
            positions[i * 3 + 2] = (Math.random() - 0.5) * 6
        }

        return positions
    }, [count])

    // Animate particles
    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y = state.clock.elapsedTime * 0.03
        }
        if (linesRef.current) {
            linesRef.current.rotation.y = state.clock.elapsedTime * 0.03
        }
    })

    // Generate constellation lines between close particles
    const lines = useMemo(() => {
        const linePositions: number[] = []
        const maxDistance = 1.5

        for (let i = 0; i < count; i++) {
            for (let j = i + 1; j < count; j++) {
                const x1 = particles[i * 3]
                const y1 = particles[i * 3 + 1]
                const z1 = particles[i * 3 + 2]

                const x2 = particles[j * 3]
                const y2 = particles[j * 3 + 1]
                const z2 = particles[j * 3 + 2]

                const distance = Math.sqrt(
                    Math.pow(x2 - x1, 2) +
                    Math.pow(y2 - y1, 2) +
                    Math.pow(z2 - z1, 2)
                )

                if (distance < maxDistance) {
                    linePositions.push(x1, y1, z1, x2, y2, z2)
                }
            }
        }

        return new Float32Array(linePositions)
    }, [particles, count])

    return (
        <>
            {/* Particles */}
            <points ref={pointsRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={particles.length / 3}
                        array={particles}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.03}
                    color="#00ff00"
                    transparent
                    opacity={0.7}
                    sizeAttenuation
                />
            </points>

            {/* Constellation Lines */}
            <lineSegments ref={linesRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={lines.length / 3}
                        array={lines}
                        itemSize={3}
                    />
                </bufferGeometry>
                <lineBasicMaterial
                    color="#00ff00"
                    transparent
                    opacity={0.15}
                />
            </lineSegments>
        </>
    )
}
