export default function Lights() {
    return (
        <>
            {/* Ambient light for overall illumination */}
            <ambientLight intensity={0.3} />

            {/* Main directional light */}
            <directionalLight
                position={[5, 5, 5]}
                intensity={0.5}
                color="#ffffff"
            />

            {/* Green accent point lights */}
            <pointLight
                position={[-3, 2, 2]}
                intensity={0.8}
                color="#00ff00"
                distance={8}
            />

            <pointLight
                position={[3, -2, 2]}
                intensity={0.6}
                color="#00ff00"
                distance={6}
            />

            {/* Spotlight for dramatic effect */}
            <spotLight
                position={[0, 5, 3]}
                angle={0.3}
                penumbra={0.5}
                intensity={0.5}
                color="#00ff00"
                castShadow={false}
            />
        </>
    )
}
