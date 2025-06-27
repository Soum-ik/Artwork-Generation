"use client";

import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Box } from "@react-three/drei";
import Link from "next/link";
import { TextureLoader } from "three";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Image from "next/image";

const ThreeDModel = ({ textureUrl }: { textureUrl: string }) => {
  const texture = useLoader(TextureLoader, textureUrl);

  return (
    <div className="w-full h-[60vh] glass-card rounded-2xl overflow-hidden">
      <Canvas camera={{ position: [2, 2, 2], fov: 50 }}>
        {/* Stronger ambient light */}
        <ambientLight intensity={2.5} />

        {/* Re-enable and boost other lights */}
        <spotLight
          position={[10, 10, 10]}
          angle={0.3}
          penumbra={1}
          intensity={3}
          castShadow
        />
        <pointLight position={[-10, -10, -10]} intensity={2} />

        <Box args={[1, 1, 1]}>
          <meshStandardMaterial map={texture} color="white" />
        </Box>

        <OrbitControls />
      </Canvas>
    </div>
  );
};

const ViewerContent = () => {
  const searchParams = useSearchParams();
  const textureUrl = searchParams.get("textureUrl");
  const [show3D, setShow3D] = useState(false);

  if (!textureUrl) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center glass-card rounded-2xl">
        <p className="text-red-500">No texture URL provided</p>
      </div>
    );
  }

  return (
    <>
      {!show3D ? (
        // Image Preview
        <div className="w-full h-[65vh] glass-card rounded-2xl py-[20px] overflow-hidden flex items-center justify-center bg-gray-100">
          <Image
            width={1000}
            height={1000}
            src={textureUrl}
            alt="Artwork texture preview"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      ) : (
        // 3D Model
        <Suspense
          fallback={
            <div className="w-full h-[60vh] flex items-center justify-center glass-card rounded-2xl">
              <p>Loading 3D Model...</p>
            </div>
          }
        >
          <ThreeDModel textureUrl={textureUrl} />
        </Suspense>
      )}

      <div className="mt-8 flex justify-center gap-4">
        <Link href="/mapping">
          <button className="bg-gray-700 text-white font-bold py-3 px-8 rounded-full hover:scale-105 transition-transform">
            Back
          </button>
        </Link>

        {!show3D ? (
          <button
            onClick={() => setShow3D(true)}
            className="bg-brand-primary text-brand-secondary font-bold py-3 px-8 rounded-full hover:scale-105 transition-transform"
          >
            Click to View 3D Model
          </button>
        ) : (
          <button
            onClick={() => setShow3D(false)}
            className="bg-purple-600 text-white font-bold py-3 px-8 rounded-full hover:scale-105 transition-transform"
          >
            Back to Preview
          </button>
        )}

        <a href={textureUrl} download="mapped-artwork.png">
          <button className="bg-green-600 text-white font-bold py-3 px-8 rounded-full hover:scale-105 transition-transform">
            Download
          </button>
        </a>
      </div>
    </>
  );
};

const ViewerPage = () => {
  return (
    <div className="container max-w-2xl mx-auto px-4 py-32 text-center">
      <h1 className="text-4xl font-bold mb-4">3D Viewer</h1>
      <p className="text-foreground/80 mb-8">
        Preview your artwork and interact with it on a 3D model.
      </p>
      <Suspense
        fallback={
          <div className="w-full h-[60vh] flex items-center justify-center glass-card rounded-2xl">
            <p>Loading...</p>
          </div>
        }
      >
        <ViewerContent />
      </Suspense>
    </div>
  );
};

export default ViewerPage;
