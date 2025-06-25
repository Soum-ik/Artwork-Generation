import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <div className="w-full max-w-2xl glass-card rounded-2xl p-8 md:p-12 shadow-2xl">
        <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-gray-400 pb-2">
          Artwork Generator
        </h1>
        <p className="text-lg md:text-xl text-foreground/80 mt-4 mb-8">
          Unleash your creativity. Upload your artwork and see it transform in new and exciting ways.
        </p>
        <Link href="/upload">
          <button className="bg-brand-primary text-brand-secondary font-bold py-3 px-8 rounded-full hover:scale-105 transition-transform">
            Start Uploading
          </button>
        </Link>
      </div>
    </div>
  );
}
