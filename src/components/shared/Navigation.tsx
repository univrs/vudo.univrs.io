import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useIdentity } from '../../hooks/useIdentity';

export function Navigation() {
  const location = useLocation();
  const isEditor = location.pathname === '/editor';
  const isDemos = location.pathname.startsWith('/demos');
  const { theme, toggleTheme } = useTheme();
  const { nodeId, isLoading } = useIdentity();
  const [showId, setShowId] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-surface)]/95 backdrop-blur-sm border-b border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Left: Logo */}
        <Link to="/" className="text-[var(--glow-green)] font-bold text-xl tracking-tight">
          VUDO
        </Link>

        {/* Center: Navigation Links */}
        <div className="flex items-center gap-4">
          <a
            href="https://learn.univrs.io"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 text-sm font-medium rounded transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-color)] flex items-center gap-1"
          >
            Learn
            <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <Link
            to="/demos/game-of-life"
            className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
              isDemos
                ? 'text-[var(--glow-green)] bg-[var(--glow-green)]/10'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-color)]'
            }`}
          >
            Demos
          </Link>
          <Link
            to="/editor"
            className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
              isEditor
                ? 'text-[var(--glow-green)] bg-[var(--glow-green)]/10'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-color)]'
            }`}
          >
            Editor
          </Link>
        </div>

        {/* Right: Connect + Theme Toggle */}
        <div className="flex items-center gap-3">
          {isLoading ? (
            <span className="px-3 py-1 text-xs font-mono text-[var(--text-muted)]">
              ...
            </span>
          ) : nodeId ? (
            <button
              onClick={() => setShowId(!showId)}
              className="px-3 py-1 text-xs font-mono rounded border border-[var(--glow-green)]/40 text-[var(--glow-green)] hover:bg-[var(--glow-green)]/5 transition-colors flex items-center gap-2"
              title={nodeId}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--glow-green)] animate-pulse" />
              {showId ? nodeId.slice(0, 8) + '...' : 'Connected'}
            </button>
          ) : (
            <button className="px-3 py-1 text-xs font-medium rounded border border-[var(--glow-green)]/40 text-[var(--glow-green)]/80 hover:text-[var(--glow-green)] hover:border-[var(--glow-green)]/60 hover:bg-[var(--glow-green)]/5 transition-colors">
              Connect
            </button>
          )}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded bg-[var(--border-color)] hover:bg-[var(--border-color)]/80 border border-[var(--border-color)] transition-colors"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-amber-400">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-amber-500">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
