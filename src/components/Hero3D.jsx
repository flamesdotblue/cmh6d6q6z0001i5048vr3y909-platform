import Spline from '@splinetool/react-spline';
import { Rocket, User } from 'lucide-react';

export default function Hero3D() {
  return (
    <div className="relative h-[60vh] w-full bg-gradient-to-b from-black via-black to-zinc-950 overflow-hidden">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/qQUip0dJPqrrPryE/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/80 pointer-events-none" />
      <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 backdrop-blur">
            <User className="h-3.5 w-3.5" />
            Dual roles: Student and Conductor
          </div>
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight">
            Discover, host, and join contests with your campus network
          </h1>
          <p className="max-w-2xl text-white/70">
            Simple black-and-white interface with a touch of neon. Create groups, apply as a team, and manage entries with ease.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <a href="#auth" className="inline-flex items-center gap-2 rounded-md bg-white text-black px-4 py-2 text-sm font-medium hover:bg-zinc-200 transition">
              <Rocket className="h-4 w-4" />
              Get Started
            </a>
            <a href="#discover" className="inline-flex items-center gap-2 rounded-md border border-white/20 px-4 py-2 text-sm font-medium hover:bg-white/10 transition">
              Explore Events
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
