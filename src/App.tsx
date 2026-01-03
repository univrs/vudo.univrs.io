import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { Navigation } from './components/shared/Navigation';
import { Landing } from './pages/Landing';
import { Editor } from './pages/Editor';
import { Learn } from './pages/learn/Learn';
import { ThermodynamicEconomics } from './pages/learn/ThermodynamicEconomics';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/learn/thermodynamic-economics" element={<ThermodynamicEconomics />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
