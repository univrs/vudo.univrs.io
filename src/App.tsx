import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { MyceliumBackground } from './components/MyceliumBackground';
import { VevePattern } from './components/VevePattern';
import { Hero } from './components/Hero';
import { DOLPlayground } from './components/DOLPlayground';
import { Roadmap } from './components/Roadmap';

function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-2 border-[#00ff88]/30 border-t-[#00ff88] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/40 text-sm tracking-widest uppercase">Summoning...</p>
      </div>
    </div>
  );
}

function VeveDivider() {
  return (
    <div className="flex items-center justify-center gap-8 my-16">
      <div className="h-px flex-1 max-w-xs bg-gradient-to-r from-transparent to-[#fbbf24]/30" />
      <VevePattern type="mitan" size={40} strokeWidth={1} />
      <div className="h-px flex-1 max-w-xs bg-gradient-to-l from-transparent to-[#fbbf24]/30" />
    </div>
  );
}

function VocabularySection() {
  const vocabulary = [
    { term: 'Spirit', meaning: 'Shareable .dol package', type: 'spirit' as const },
    { term: 'Séance', meaning: 'Collaborative session', type: 'seance' as const },
    { term: 'Loa', meaning: 'Autonomous service', type: 'loa' as const },
    { term: 'Mycelium', meaning: 'P2P network fabric', type: 'mycelium' as const },
  ];

  return (
    <section className="relative py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-sm tracking-[0.3em] uppercase text-[#8b5cf6]/80 mb-4">
            The Dual Vocabulary
          </h2>
          <p className="text-2xl md:text-3xl text-white/90 font-light">
            Developers speak precision. Creators speak possibility.
          </p>
          <p className="text-white/50 mt-2">VUDO speaks both.</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {vocabulary.map((item, i) => (
            <motion.div 
              key={item.term} 
              className="text-center group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="mb-4 opacity-60 group-hover:opacity-100 transition-opacity">
                <VevePattern type={item.type} size={60} color="#8b5cf6" className="mx-auto" delay={i * 0.2} />
              </div>
              <h3 className="text-lg text-white mb-1">{item.term}</h3>
              <p className="text-sm text-white/50">{item.meaning}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ManifestoSection() {
  return (
    <section id="imaginarium" className="relative py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] bg-[#00ff88]/5 rounded-full blur-3xl" />
      </div>
      
      <motion.div 
        className="relative max-w-3xl mx-auto text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <VevePattern type="mitan" size={80} className="mx-auto mb-8" />
        
        <h2 className="text-4xl md:text-5xl font-light text-white mb-8 leading-tight">
          The <span className="text-[#00ff88]">Imaginarium</span>
        </h2>
        
        <div className="space-y-6 text-lg text-white/70 leading-relaxed">
          <p>Where does software go when it transcends utility?</p>
          <p>
            It becomes art. It becomes play.<br />
            It becomes <em className="text-white">consciousness exploring itself</em>.
          </p>
          <p className="text-white/50 text-base">The Imaginarium is not a product. It is a garden.</p>
        </div>
        
        <div className="mt-12 p-8 bg-white/5 border border-white/10 rounded-sm">
          <p className="font-mono text-sm text-white/40 tracking-wider">
            BITS TO ATOMS ⇔ ATOMS TO QUBITS
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 text-2xl">
            <span>💻</span>
            <span className="text-white/20">→</span>
            <span>🍄</span>
            <span className="text-white/20">→</span>
            <span>⚛️</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="relative py-32 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-sm tracking-[0.3em] uppercase text-[#fbbf24]/80 mb-8">The Summons</h2>
        
        <p className="text-2xl text-white/80 mb-12">
          The Imaginarium is not built. It is grown.<br />
          <span className="text-white/50">And it begins with you.</span>
        </p>
        
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 bg-white/5 border border-white/10 rounded-sm hover:border-[#00ff88]/30 transition-colors">
            <h3 className="text-[#00ff88] mb-2">For Developers</h3>
            <p className="text-sm text-white/50 mb-4">Clone the repo. Run the tests.<br />Write your first Gene.</p>
            <a href="https://github.com/univrs/metadol" className="text-sm text-[#00ff88] hover:text-[#00ff88]/80">
              Start Building →
            </a>
          </div>
          
          <div className="p-6 bg-white/5 border border-white/10 rounded-sm hover:border-[#8b5cf6]/30 transition-colors">
            <h3 className="text-[#8b5cf6] mb-2">For Creators</h3>
            <p className="text-sm text-white/50 mb-4">Imagine a Spirit you would summon.<br />Design an experience.</p>
            <a href="#waitlist" className="text-sm text-[#8b5cf6] hover:text-[#8b5cf6]/80">
              Join the Waitlist →
            </a>
          </div>
          
          <div className="p-6 bg-white/5 border border-white/10 rounded-sm hover:border-[#fbbf24]/30 transition-colors">
            <h3 className="text-[#fbbf24] mb-2">For Researchers</h3>
            <p className="text-sm text-white/50 mb-4">Read the ontology foundations.<br />Critique the architecture.</p>
            <a href="https://learn.univrs.io" className="text-sm text-[#fbbf24] hover:text-[#fbbf24]/80">
              Explore the Theory →
            </a>
          </div>
        </div>
        
        <VevePattern type="mitan" size={60} className="mx-auto mb-6" delay={0.5} />
        <p className="text-white/40 text-sm italic">The Mitan awaits. Enter the Imaginarium.</p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative py-12 px-6 border-t border-white/10">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <VevePattern type="mitan" size={24} animated={false} strokeWidth={1} />
          <span className="text-white/40 text-sm">VUDO</span>
          <span className="text-white/20">|</span>
          <span className="text-white/40 text-sm">Univrs.io</span>
        </div>
        
        <div className="flex items-center gap-6 text-sm text-white/40">
          <a href="https://github.com/univrs" className="hover:text-white/60">GitHub</a>
          <a href="https://learn.univrs.io" className="hover:text-white/60">Docs</a>
        </div>
        
        <p className="text-xs text-white/20">© 2025 Univrs. Open Source.</p>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <div className="relative min-h-screen bg-[#0a0a0f] text-white antialiased">
      <Suspense fallback={<LoadingScreen />}>
        <MyceliumBackground nodeCount={50} connectionProbability={0.2} />
      </Suspense>
      
      <main className="relative z-10">
        <Hero />
        <VeveDivider />
        <DOLPlayground />
        <VeveDivider />
        <VocabularySection />
        <ManifestoSection />
        <VeveDivider />
        <Roadmap />
        <VeveDivider />
        <CTASection />
      </main>
      
      <Footer />
    </div>
  );
}
