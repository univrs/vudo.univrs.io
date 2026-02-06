import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { Navigation } from './components/shared/Navigation';
import { Landing } from './pages/Landing';
import { Editor } from './pages/Editor';
import { Learn } from './pages/learn/Learn';
import { CRDT } from './pages/learn/CRDT';
import { ThermodynamicEconomics } from './pages/learn/ThermodynamicEconomics';
import { GameOfLife } from './pages/demos/game-of-life/GameOfLife';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/editor" element={<Editor />} />
          {/* Interactive demos - these stay on vudo.univrs.io */}
          <Route path="/learn" element={<Learn />} />
          <Route path="/learn/crdt" element={<CRDT />} />
          <Route path="/learn/thermodynamic-economics" element={<ThermodynamicEconomics />} />
          <Route path="/demos/game-of-life" element={<GameOfLife />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
