import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'

export default function InteractiveCamera() {
    const { camera } = useThree()
    const mousePosition = useRef({ x: 0, y: 0 })
    const targetPosition = useRef({ x: 0, y: 0, z: 5 })

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            mousePosition.current = {
                x: (event.clientX / window.innerWidth - 0.5) * 2,
                y: -(event.clientY / window.innerHeight - 0.5) * 2
            }
        }

        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    useFrame(() => {
        // Smooth camera movement (parallax effect)
        targetPosition.current.x = mousePosition.current.x * 0.5
        targetPosition.current.y = mousePosition.current.y * 0.3

        // Lerp (linear interpolation) for smooth movement
        camera.position.x += (targetPosition.current.x - camera.position.x) * 0.05
        camera.position.y += (targetPosition.current.y - camera.position.y) * 0.05

        // Always look at center
        camera.lookAt(0, 0, 0)
    })

    return null
}
