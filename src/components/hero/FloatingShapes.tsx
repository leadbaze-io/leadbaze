import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function FloatingShapes() {
    const coinRef = useRef<THREE.Group>(null)
    const chartRef = useRef<THREE.Group>(null)
    const cardRef = useRef<THREE.Mesh>(null)
    const targetRef = useRef<THREE.Group>(null)
    const arrowRef = useRef<THREE.Group>(null)

    useFrame((state) => {
        const time = state.clock.elapsedTime

        // Coin animation - spinning like a real coin
        if (coinRef.current) {
            coinRef.current.rotation.y = time * 1.5
            coinRef.current.rotation.x = Math.sin(time * 0.5) * 0.2
            coinRef.current.position.y = Math.sin(time * 0.5) * 0.5
        }

        // Growth chart animation
        if (chartRef.current) {
            chartRef.current.rotation.y = time * 0.3
            chartRef.current.position.y = Math.cos(time * 0.4) * 0.3
        }

        // Card/Document animation
        if (cardRef.current) {
            cardRef.current.rotation.y = time * 0.4
            cardRef.current.rotation.x = Math.sin(time * 0.3) * 0.1
            cardRef.current.position.y = Math.sin(time * 0.6 + 1) * 0.4
        }

        // Target animation
        if (targetRef.current) {
            targetRef.current.rotation.z = time * 0.5
            targetRef.current.position.y = Math.cos(time * 0.3 + 2) * 0.3
        }

        // Arrow animation - pointing up
        if (arrowRef.current) {
            arrowRef.current.position.y = Math.sin(time * 0.7) * 0.4 + 0.5
            arrowRef.current.rotation.z = Math.sin(time * 0.5) * 0.1
        }
    })

    return (
        <group>
            {/* 💰 Coin - 3D Cylinder with $ pattern */}
            <group ref={coinRef} position={[-3, 0, -2]}>
                {/* Coin base */}
                <mesh>
                    <cylinderGeometry args={[0.8, 0.8, 0.15, 32]} />
                    <meshStandardMaterial
                        color="#00ff00"
                        metalness={0.8}
                        roughness={0.2}
                        emissive="#00ff00"
                        emissiveIntensity={0.3}
                    />
                </mesh>
                {/* Dollar sign made with simple shapes */}
                <mesh position={[0, 0, 0.1]}>
                    <torusGeometry args={[0.25, 0.08, 8, 16, Math.PI]} />
                    <meshStandardMaterial
                        color="#082721"
                        metalness={0.5}
                        roughness={0.3}
                    />
                </mesh>
            </group>

            {/* 📊 Growth Chart - Bar chart going up */}
            <group ref={chartRef} position={[3, 0, -1]}>
                {/* Bar 1 - shortest */}
                <mesh position={[-0.4, -0.3, 0]}>
                    <boxGeometry args={[0.2, 0.4, 0.2]} />
                    <meshStandardMaterial
                        color="#00ff00"
                        transparent
                        opacity={0.7}
                        emissive="#00ff00"
                        emissiveIntensity={0.2}
                    />
                </mesh>
                {/* Bar 2 - medium */}
                <mesh position={[0, -0.1, 0]}>
                    <boxGeometry args={[0.2, 0.8, 0.2]} />
                    <meshStandardMaterial
                        color="#00ff00"
                        transparent
                        opacity={0.8}
                        emissive="#00ff00"
                        emissiveIntensity={0.25}
                    />
                </mesh>
                {/* Bar 3 - tallest */}
                <mesh position={[0.4, 0.2, 0]}>
                    <boxGeometry args={[0.2, 1.4, 0.2]} />
                    <meshStandardMaterial
                        color="#00ff00"
                        transparent
                        opacity={0.9}
                        emissive="#00ff00"
                        emissiveIntensity={0.3}
                    />
                </mesh>
            </group>

            {/* 💳 Card/Document */}
            <mesh ref={cardRef} position={[2, -1.5, -3]}>
                <boxGeometry args={[1.2, 0.8, 0.05]} />
                <meshStandardMaterial
                    color="#00ff00"
                    transparent
                    opacity={0.6}
                    emissive="#00ff00"
                    emissiveIntensity={0.2}
                />
            </mesh>

            {/* 🎯 Target - Concentric circles */}
            <group ref={targetRef} position={[-2.5, -1, -1.5]}>
                <mesh>
                    <torusGeometry args={[0.6, 0.08, 16, 32]} />
                    <meshStandardMaterial
                        color="#00ff00"
                        transparent
                        opacity={0.7}
                        emissive="#00ff00"
                        emissiveIntensity={0.3}
                    />
                </mesh>
                <mesh>
                    <torusGeometry args={[0.4, 0.06, 16, 32]} />
                    <meshStandardMaterial
                        color="#00ff00"
                        transparent
                        opacity={0.8}
                        emissive="#00ff00"
                        emissiveIntensity={0.4}
                    />
                </mesh>
                <mesh>
                    <sphereGeometry args={[0.15, 16, 16]} />
                    <meshStandardMaterial
                        color="#00ff00"
                        emissive="#00ff00"
                        emissiveIntensity={0.5}
                    />
                </mesh>
            </group>

            {/* 📈 Upward Arrow - Growth indicator */}
            <group ref={arrowRef} position={[-1, 1, -2.5]}>
                {/* Arrow shaft */}
                <mesh position={[0, -0.3, 0]}>
                    <cylinderGeometry args={[0.08, 0.08, 0.8, 16]} />
                    <meshStandardMaterial
                        color="#00ff00"
                        transparent
                        opacity={0.8}
                        emissive="#00ff00"
                        emissiveIntensity={0.3}
                    />
                </mesh>
                {/* Arrow head */}
                <mesh position={[0, 0.3, 0]} rotation={[0, 0, 0]}>
                    <coneGeometry args={[0.2, 0.4, 16]} />
                    <meshStandardMaterial
                        color="#00ff00"
                        emissive="#00ff00"
                        emissiveIntensity={0.4}
                    />
                </mesh>
            </group>
        </group>
    )
}
