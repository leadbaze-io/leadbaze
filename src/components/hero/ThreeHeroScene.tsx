import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import City from './City'
import Lights from './Lights'

export default function ThreeHeroScene() {
    return (
        <div
            className="absolute inset-0"
            style={{
                zIndex: 1,
                pointerEvents: 'none'
            }}
        >
            <Canvas
                camera={{ position: [0, 8, 5], fov: 50 }}
                gl={{
                    antialias: true,
                    alpha: true,
                    powerPreference: 'high-performance'
                }}
                dpr={[1, 1.5]}
            >
                <Suspense fallback={null}>
                    <Lights />
                    <City />
                </Suspense>
            </Canvas>
        </div>
    )
}
