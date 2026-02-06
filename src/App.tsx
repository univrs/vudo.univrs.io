import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { Navigation } from './components/shared/Navigation';
import { Landing } from './pages/Landing';
import { Editor } from './pages/Editor';
import { GameOfLife } from './pages/demos/game-of-life/GameOfLife';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/demos/game-of-life" element={<GameOfLife />} />
          {/* Redirect old /learn routes to learn.univrs.io */}
          <Route path="/learn/*" element={<ExternalRedirect to="https://learn.univrs.io" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

// Redirect component for external URLs
function ExternalRedirect({ to }: { to: string }) {
  window.location.href = to;
  return null;
}
