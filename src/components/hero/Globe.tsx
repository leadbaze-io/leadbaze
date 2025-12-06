import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Globe() {
    const globeRef = useRef<THREE.Group>(null)
    const pointsRef = useRef<THREE.Points>(null)
    const linesRef = useRef<THREE.LineSegments>(null)

    // Generate points on globe surface (representing leads around the world)
    const { positions, connections } = useMemo(() => {
        const pointCount = 120 // More leads for larger globe
        const radius = 5 // Much larger globe to fill Hero section
        const positions: number[] = []
        const connections: number[] = []

        // Generate points on sphere surface using Fibonacci sphere algorithm
        const goldenRatio = (1 + Math.sqrt(5)) / 2
        const angleIncrement = Math.PI * 2 * goldenRatio

        const points: THREE.Vector3[] = []

        for (let i = 0; i < pointCount; i++) {
            const t = i / (pointCount - 1)
            const inclination = Math.acos(1 - 2 * t)
            const azimuth = angleIncrement * i

            const x = radius * Math.sin(inclination) * Math.cos(azimuth)
            const y = radius * Math.sin(inclination) * Math.sin(azimuth)
            const z = radius * Math.cos(inclination)

            points.push(new THREE.Vector3(x, y, z))
            positions.push(x, y, z)
        }

        // Create connections between nearby points (global network)
        const maxDistance = 2.5 // Adjusted for larger globe
        for (let i = 0; i < points.length; i++) {
            for (let j = i + 1; j < points.length; j++) {
                const distance = points[i].distanceTo(points[j])
                if (distance < maxDistance) {
                    connections.push(
                        points[i].x, points[i].y, points[i].z,
                        points[j].x, points[j].y, points[j].z
                    )
                }
            }
        }

        return {
            positions: new Float32Array(positions),
            connections: new Float32Array(connections)
        }
    }, [])

    // Create globe wireframe (latitude/longitude lines)
    const globeWireframe = useMemo(() => {
        const segments = 40
        const rings = 20
        const radius = 5
        const wireframePositions: number[] = []

        // Latitude lines (horizontal circles)
        for (let lat = 0; lat < rings; lat++) {
            const theta = (lat / rings) * Math.PI
            const sinTheta = Math.sin(theta)
            const cosTheta = Math.cos(theta)

            for (let lon = 0; lon < segments; lon++) {
                const phi = (lon / segments) * Math.PI * 2
                const x = radius * sinTheta * Math.cos(phi)
                const y = radius * cosTheta
                const z = radius * sinTheta * Math.sin(phi)

                const nextPhi = ((lon + 1) / segments) * Math.PI * 2
                const nextX = radius * sinTheta * Math.cos(nextPhi)
                const nextZ = radius * sinTheta * Math.sin(nextPhi)

                wireframePositions.push(x, y, z, nextX, y, nextZ)
            }
        }

        // Longitude lines (vertical circles)
        for (let lon = 0; lon < segments; lon++) {
            const phi = (lon / segments) * Math.PI * 2

            for (let lat = 0; lat < rings; lat++) {
                const theta = (lat / rings) * Math.PI
                const sinTheta = Math.sin(theta)
                const cosTheta = Math.cos(theta)

                const x = radius * sinTheta * Math.cos(phi)
                const y = radius * cosTheta
                const z = radius * sinTheta * Math.sin(phi)

                const nextTheta = ((lat + 1) / rings) * Math.PI
                const nextSinTheta = Math.sin(nextTheta)
                const nextCosTheta = Math.cos(nextTheta)

                const nextX = radius * nextSinTheta * Math.cos(phi)
                const nextY = radius * nextCosTheta
                const nextZ = radius * nextSinTheta * Math.sin(phi)

                wireframePositions.push(x, y, z, nextX, nextY, nextZ)
            }
        }

        return new Float32Array(wireframePositions)
    }, [])

    // Animate globe rotation
    useFrame((state) => {
        if (globeRef.current) {
            // Slow, continuous rotation
            globeRef.current.rotation.y = state.clock.elapsedTime * 0.1

            // Slight tilt for visual interest
            globeRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
        }
    })

    return (
        <group ref={globeRef}>
            {/* Globe wireframe (latitude/longitude grid) */}
            <lineSegments>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={globeWireframe.length / 3}
                        array={globeWireframe}
                        itemSize={3}
                    />
                </bufferGeometry>
                <lineBasicMaterial
                    color="#00ff00"
                    transparent
                    opacity={0.1}
                    linewidth={1}
                />
            </lineSegments>

            {/* Lead points on globe surface */}
            <points ref={pointsRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={positions.length / 3}
                        array={positions}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.08}
                    color="#00ff00"
                    transparent
                    opacity={0.9}
                    sizeAttenuation
                />
            </points>

            {/* Connections between leads (global network) */}
            <lineSegments ref={linesRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={connections.length / 3}
                        array={connections}
                        itemSize={3}
                    />
                </bufferGeometry>
                <lineBasicMaterial
                    color="#00ff00"
                    transparent
                    opacity={0.2}
                    linewidth={1}
                />
            </lineSegments>

            {/* Subtle glow effect around globe */}
            <mesh>
                <sphereGeometry args={[5.1, 32, 32]} />
                <meshBasicMaterial
                    color="#00ff00"
                    transparent
                    opacity={0.05}
                    side={THREE.BackSide}
                />
            </mesh>
        </group>
    )
}
