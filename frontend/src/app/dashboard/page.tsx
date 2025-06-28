'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; 
import { Toaster, toast } from 'sonner';
import { getUserUploads } from '@/lib/api';
import Image from 'next/image';

interface Upload {
  _id: string;
  originalFilePath: string;
  prompt?: string;
}

const DashboardPage = () => {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUploads = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to view your dashboard.');
        router.push('/login');
        return;
      }

      try {
        const data = await getUserUploads(token);
        setUploads(data);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        toast.error(`Failed to fetch uploads: ${message}`);
        // Optionally, handle token expiration
        if (message.includes('Authentication invalid')) {
          localStorage.removeItem('token');
          router.push('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUploads();
  }, [router]);

 
 

  return (
    <>
      <Toaster richColors position="bottom-right" />
      <div className="container mx-auto px-4 py-32">
        <h1 className="text-4xl font-bold mb-4">Your Dashboard</h1>
        <p className="text-foreground/80 mb-12">Here are your recent uploads. Manage and download them as you wish.</p>

        {isLoading ? (
          <div className="text-center">
            <p>Loading your masterpieces...</p>
          </div>
        ) : uploads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {uploads.map((upload) => (
              <div key={upload._id} className="glass-card rounded-2xl overflow-hidden group">
                <div className="relative">
                  <Image src={upload.originalFilePath} alt="User upload" className="w-full h-48 object-cover" width={500} height={500} />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold">{upload.prompt || 'Untitled Artwork'}</h3>
                  {/* <div className="mt-4 flex justify-end gap-3">
                    <button onClick={() => handleDelete(upload._id)} className="p-2 rounded-full hover:bg-red-500/20 text-red-500 transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div> */}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center glass-card p-12 rounded-2xl">
            <h2 className="text-2xl font-bold">No Uploads Yet</h2>
            <p className="mt-2 text-foreground/70">Start by uploading your first piece of artwork!</p>
          </div>
        )}
      </div>
    </>
  );
};

export default DashboardPage; 