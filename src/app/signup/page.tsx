'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User, Mail, Lock } from 'lucide-react';

const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement signup logic
    console.log({ username, email, password });
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md glass-card rounded-2xl p-8 shadow-2xl">
        <h2 className="text-3xl font-bold text-center mb-2">Create Your Account</h2>
        <p className="text-center text-foreground/80 mb-8">Join our community of creators.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/50" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-brand-primary"
              required
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/50" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-brand-primary"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/50" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-brand-primary"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-brand-primary text-brand-secondary font-bold py-3 px-6 rounded-full hover:scale-105 transition-transform"
          >
            Sign Up
          </button>
        </form>
        <p className="text-center text-sm text-foreground/70 mt-8">
          Already have an account?{' '}
          <Link href="/login">
            <span className="font-semibold text-brand-primary hover:underline">Log in</span>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage; 