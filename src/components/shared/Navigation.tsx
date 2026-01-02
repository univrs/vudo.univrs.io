import { Link, useLocation } from 'react-router-dom';

export function Navigation() {
  const location = useLocation();
  const isEditor = location.pathname === '/editor';
  const isLearn = location.pathname.startsWith('/learn');

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="text-[#00ff88] font-bold text-xl">VUDO</Link>
        <div className="flex items-center gap-6">
          <Link
            to="/learn"
            className={`text-sm ${isLearn ? 'text-[#00ff88]' : 'text-white/70 hover:text-white'}`}
          >
            Learn
          </Link>
          <Link
            to="/editor"
            className={`text-sm ${isEditor ? 'text-[#00ff88]' : 'text-white/70 hover:text-white'}`}
          >
            Editor
          </Link>
          <button className="px-4 py-1.5 rounded-full border border-[#00ff88]/50 text-[#00ff88] text-sm hover:bg-[#00ff88]/10 transition">
            Connect
          </button>
        </div>
      </div>
    </nav>
  );
}
