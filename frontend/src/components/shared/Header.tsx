'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    router.push('/login');
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center glass-card rounded-b-2xl">
        <Link href="/">
          <span className="text-2xl font-bold text-brand-primary">ArtGen</span>
        </Link>
        <div className="space-x-6">
          <Link href="/upload">
            <span className="text-foreground/80 hover:text-brand-primary transition-colors">Upload</span>
          </Link>
          {isLoggedIn ? (
            <>
              <Link href="/dashboard">
                <span className="text-foreground/80 hover:text-brand-primary transition-colors">Dashboard</span>
              </Link>
              <button onClick={handleLogout} className="text-foreground/80 hover:text-brand-primary transition-colors">
                Logout
              </button>
            </>
          ) : (
            <Link href="/login">
              <span className="text-foreground/80 hover:text-brand-primary transition-colors">Login</span>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header; 