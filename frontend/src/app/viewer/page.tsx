'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box } from '@react-three/drei';
import Link from 'next/link';

const ViewerPage = () => {
  return (
    <div className="container mx-auto px-4 py-32 text-center">
      <h1 className="text-4xl font-bold mb-4">3D Viewer</h1>
      <p className="text-foreground/80 mb-8">
        Interact with your artwork on a 3D model.
      </p>

      <div className="w-full h-[60vh] glass-card rounded-2xl overflow-hidden">
        <Canvas camera={{ position: [2, 2, 2], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
          <pointLight position={[-10, -10, -10]} />
          
          <Box args={[1, 1, 1]}>
            <meshStandardMaterial color="orange" />
          </Box>

          <OrbitControls />
        </Canvas>
      </div>
      <div className="mt-8 flex justify-center gap-4">
        <Link href="/mapping">
          <button className="bg-gray-700 text-white font-bold py-3 px-8 rounded-full hover:scale-105 transition-transform">
            Back
          </button>
        </Link>
        <button className="bg-brand-primary text-brand-secondary font-bold py-3 px-8 rounded-full hover:scale-105 transition-transform">
          Download
        </button>
      </div>
    </div>
  );
};

export default ViewerPage; 