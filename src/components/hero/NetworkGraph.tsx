import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Node {
    position: THREE.Vector3
    velocity: THREE.Vector3
}

export default function NetworkGraph() {
    const nodesRef = useRef<THREE.Points>(null)
    const linesRef = useRef<THREE.LineSegments>(null)
    const groupRef = useRef<THREE.Group>(null)

    // Generate network nodes (connection points)
    const nodes = useMemo(() => {
        const nodeCount = 50 // More nodes for larger area
        const nodeArray: Node[] = []

        for (let i = 0; i < nodeCount; i++) {
            nodeArray.push({
                position: new THREE.Vector3(
                    (Math.random() - 0.5) * 16,  // Increased area
                    (Math.random() - 0.5) * 10,  // Increased area
                    (Math.random() - 0.5) * 8    // Increased area
                ),
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.01,
                    (Math.random() - 0.5) * 0.01,
                    (Math.random() - 0.5) * 0.005
                )
            })
        }

        return nodeArray
    }, [])

    // Convert nodes to Float32Array for rendering
    const nodePositions = useMemo(() => {
        const positions = new Float32Array(nodes.length * 3)
        nodes.forEach((node, i) => {
            positions[i * 3] = node.position.x
            positions[i * 3 + 1] = node.position.y
            positions[i * 3 + 2] = node.position.z
        })
        return positions
    }, [nodes])

    // Generate connections between nearby nodes
    const connections = useMemo(() => {
        const linePositions: number[] = []
        const maxDistance = 3.0 // Slightly increased for larger area

        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const distance = nodes[i].position.distanceTo(nodes[j].position)

                if (distance < maxDistance) {
                    linePositions.push(
                        nodes[i].position.x, nodes[i].position.y, nodes[i].position.z,
                        nodes[j].position.x, nodes[j].position.y, nodes[j].position.z
                    )
                }
            }
        }

        return new Float32Array(linePositions)
    }, [nodes])

    // Animate the network
    useFrame((state) => {
        if (groupRef.current) {
            // Subtle rotation of entire network
            groupRef.current.rotation.y = state.clock.elapsedTime * 0.05
        }

        // Update node positions with subtle movement
        if (nodesRef.current && linesRef.current) {
            const positions = nodesRef.current.geometry.attributes.position.array as Float32Array
            const linePositions = linesRef.current.geometry.attributes.position.array as Float32Array

            let lineIndex = 0

            nodes.forEach((node, i) => {
                // Subtle floating movement
                node.position.add(node.velocity)

                // Bounce back if too far (adjusted for larger area)
                if (Math.abs(node.position.x) > 8) node.velocity.x *= -1
                if (Math.abs(node.position.y) > 5) node.velocity.y *= -1
                if (Math.abs(node.position.z) > 4) node.velocity.z *= -1

                // Update positions
                positions[i * 3] = node.position.x
                positions[i * 3 + 1] = node.position.y
                positions[i * 3 + 2] = node.position.z
            })

            // Update line positions
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const distance = nodes[i].position.distanceTo(nodes[j].position)

                    if (distance < 3.0) {
                        linePositions[lineIndex++] = nodes[i].position.x
                        linePositions[lineIndex++] = nodes[i].position.y
                        linePositions[lineIndex++] = nodes[i].position.z
                        linePositions[lineIndex++] = nodes[j].position.x
                        linePositions[lineIndex++] = nodes[j].position.y
                        linePositions[lineIndex++] = nodes[j].position.z
                    }
                }
            }

            nodesRef.current.geometry.attributes.position.needsUpdate = true
            linesRef.current.geometry.attributes.position.needsUpdate = true
        }
    })

    return (
        <group ref={groupRef}>
            {/* Network Nodes */}
            <points ref={nodesRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={nodePositions.length / 3}
                        array={nodePositions}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.04}  // Smaller nodes (50% reduction)
                    color="#00ff00"
                    transparent
                    opacity={0.8}
                    sizeAttenuation
                />
            </points>

            {/* Network Connections */}
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
                    opacity={0.15}
                    linewidth={1}
                />
            </lineSegments>
        </group>
    )
}
