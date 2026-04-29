/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Camera, 
  Video, 
  Sparkles, 
  Image as ImageIcon, 
  ChevronRight, 
  Settings2,
  RefreshCw,
  Download,
  Share2,
  Trash2,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { cn } from './lib/utils';

// --- Constants & Types ---

const SCENES = [
  { id: 'minimal', name: 'Minimalist Studio', description: 'Clean, soft lighting, professional look' },
  { id: 'urban', name: 'Urban Industrial', description: 'Metropolitan vibe, concrete and steel' },
  { id: 'lifestyle', name: 'Lifestyle / Home', description: 'Cozy living room, natural sunlight' },
  { id: 'nature', name: 'Nature / Outdoor', description: 'Garden setting, forest or beach' },
  { id: 'luxury', name: 'Luxury / Editorial', description: 'High-end mood, dramatic lighting' },
];

const MODELS = [
  { id: 'model_1', name: 'Casual Male', style: 'Contemporary' },
  { id: 'model_2', name: 'Elegant Female', style: 'High-fashion' },
  { id: 'model_3', name: 'Diverse Range', style: 'Lifestyle' },
  { id: 'no_model', name: 'No Model', style: 'Product Only' },
];

type GenerationMode = 'photo' | 'video';

interface GeneratedResult {
  id: string;
  type: GenerationMode;
  url: string;
  timestamp: number;
}

// --- App Component ---

export default function App() {
  const [productImage, setProductImage] = useState<string | null>(null);
  const [selectedScene, setSelectedScene] = useState(SCENES[0].id);
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
  const [mode, setMode] = useState<GenerationMode>('photo');
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<GeneratedResult[]>([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      setProductImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false
  } as any);

  const generate = async () => {
    if (!productImage) return;
    setIsGenerating(true);
    setAiInsight(null);
    setStatusMessage('Sourcing geometric coordinates...');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const analysisResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          { inlineData: { data: productImage.split(',')[1], mimeType: 'image/png' } },
          { text: "Analyze this product image. Describe its materials, target demographic, and suggest the best lighting/setting for a professional photoshoot. Keep it brief (2 sentences)." }
        ]
      });
      setAiInsight(analysisResponse.text || "Perfect product shot detected.");

      const delay = mode === 'photo' ? 2000 : 4000;
      setStatusMessage(mode === 'photo' ? 'Synthesizing scene textures...' : 'Synthesizing model motion...');
      
      setTimeout(() => {
        const newResult: GeneratedResult = {
          id: Math.random().toString(36).substr(2, 9),
          type: mode,
          url: mode === 'photo' 
            ? `https://picsum.photos/seed/${Math.random()}/1080/1080`
            : 'https://cdn.pixabay.com/video/2021/04/12/70860-536966133_large.mp4',
          timestamp: Date.now()
        };
        setResults(prev => [newResult, ...prev]);
        setIsGenerating(false);
      }, delay);
    } catch (error) {
      console.error('Generation failed:', error);
      setIsGenerating(false);
      setStatusMessage('Network interruption.');
    }
  };

  const latestPhoto = results.find(r => r.type === 'photo');
  const latestVideo = results.find(r => r.type === 'video');

  return (
    <div className="h-screen w-full flex flex-col bg-brand-bg select-none overflow-hidden text-brand-ink">
      {/* Navbar */}
      <nav className="h-16 shrink-0 border-b border-brand-line bg-white flex items-center justify-between px-10 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-ink flex items-center justify-center">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">MODELIZE.STUDIO</span>
        </div>
        <div className="flex items-center gap-8 text-[14px] font-medium">
          <span className="hover:text-brand-accent cursor-pointer transition-colors">Gallery</span>
          <span className="hover:text-brand-accent cursor-pointer transition-colors">Models</span>
          <span className="hover:text-brand-accent cursor-pointer transition-colors">Pricing</span>
          <button className="border border-brand-line px-4 py-1.5 rounded-md text-[12px] hover:bg-brand-bg transition-all">Account</button>
        </div>
      </nav>

      {/* Main Content: Split Grid */}
      <main className="flex-1 overflow-hidden grid lg:grid-cols-2 relative h-full">
        
        {/* Stage 01: Photoshoot Panel */}
        <section className="p-10 flex flex-col h-full border-r border-brand-line">
          <div className="mb-6">
            <div className="label-caps mb-2">Stage 01</div>
            <h2 className="panel-title">AI Product<br />Photoshoot</h2>
          </div>
          
          <div className="preview-card-frame flex-1 bg-[#EEE]">
            {latestPhoto ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0">
                <img src={latestPhoto.url} className="w-full h-full object-cover" />
                <div className="absolute bottom-5 left-5 bg-black/80 backdrop-blur-md text-white rounded-lg p-4 text-[12px] border border-white/10">
                  <div className="font-bold mb-1">MODE: Editorial Static</div>
                  <div className="opacity-70 uppercase text-[10px]">SCENE: {SCENES.find(s => s.id === selectedScene)?.name}</div>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-brand-ink/20">
                <Camera className="w-12 h-12" />
                <p className="text-sm font-medium uppercase tracking-widest">Awaiting Synthesis</p>
              </div>
            )}
          </div>
        </section>

        {/* Stage 02: Video Panel */}
        <section className="p-10 flex flex-col h-full bg-[#FDFDFD]">
          <div className="mb-6">
            <div className="label-caps mb-2">Stage 02</div>
            <h2 className="panel-title">Cinematic<br />Model Video</h2>
          </div>
          
          <div className="preview-card-frame flex-1 bg-[#EEE]">
            {latestVideo ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0">
                <video src={latestVideo.url} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl pointer-events-none">
                  <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[15px] border-l-brand-ink ml-1" />
                </div>
                <div className="absolute bottom-5 left-5 bg-black/80 backdrop-blur-md text-white rounded-lg p-4 text-[12px] border border-white/10">
                  <div className="font-bold mb-1">ACTION: Professional Showcase</div>
                  <div className="opacity-70 uppercase text-[10px]">MODEL: {MODELS.find(m => m.id === selectedModel)?.name}</div>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-brand-ink/20">
                <Video className="w-12 h-12" />
                <p className="text-sm font-medium uppercase tracking-widest">Awaiting Rendering</p>
              </div>
            )}
          </div>
        </section>

        {/* Central Action Card: Floater */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] bg-white border border-brand-ink rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] p-10 z-20 overflow-visible">
          
          {/* Upload Box */}
          <div 
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all mb-8 bg-brand-bg group",
              isDragActive ? "border-brand-accent bg-brand-accent/5" : "border-brand-line hover:border-brand-ink hover:bg-[#F2F2F2]"
            )}
          >
            <input {...getInputProps()} />
            {productImage ? (
              <div className="relative group">
                <img src={productImage} className="h-24 mx-auto object-contain" />
                <button 
                  onClick={(e) => { e.stopPropagation(); setProductImage(null); }}
                  className="absolute -top-4 -right-4 w-8 h-8 bg-brand-ink text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="text-3xl mb-4 grayscale group-hover:grayscale-0 transition-all">📸</div>
                <div className="font-bold text-sm mb-1 leading-tight uppercase tracking-tight">Drop your product image</div>
                <div className="text-[11px] text-black/40 font-medium">PNG, JPG, HEIC up to 20MB</div>
              </>
            )}
          </div>

          <div className="space-y-6">
            <div className="flex gap-2 p-1 bg-brand-bg rounded-xl border border-brand-line">
              {(['photo', 'video'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    "flex-1 py-2 text-[12px] font-bold uppercase tracking-tight rounded-lg transition-all",
                    mode === m ? "bg-white border border-brand-line shadow-sm" : "opacity-40 hover:opacity-100"
                  )}
                >
                  {m === 'photo' ? 'Snapshot' : 'Cinematic'}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <select 
                value={selectedScene}
                onChange={(e) => setSelectedScene(e.target.value)}
                className="bg-brand-bg border border-brand-line rounded-lg px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide focus:outline-brand-accent"
              >
                {SCENES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <select 
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-brand-bg border border-brand-line rounded-lg px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide focus:outline-brand-accent"
              >
                {MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>

            <button 
              onClick={generate}
              disabled={!productImage || isGenerating}
              className="btn-ink w-full relative overflow-hidden flex items-center justify-center gap-3"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-[13px] uppercase tracking-wider">{statusMessage}</span>
                </>
              ) : (
                <span className="text-[14px] uppercase tracking-wider">Generate Real {mode === 'photo' ? 'Photos' : 'Video'}</span>
              )}
            </button>
          </div>

          {/* AI Insights & Alerts */}
          <AnimatePresence>
            {aiInsight && !isGenerating && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute -bottom-32 left-0 right-0 p-5 bg-white border border-brand-ink rounded-2xl shadow-xl z-20 flex gap-4 items-center"
              >
                <div className="w-10 h-10 bg-brand-bg rounded-lg border border-brand-line flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="text-[11px] font-medium leading-relaxed opacity-70 italic">
                   " {aiInsight} "
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Model Badge */}
          <div className="mt-8 pt-6 border-t border-brand-line flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-brand-line border-2 border-white shadow-sm overflow-hidden flex items-center justify-center font-bold text-black/30">
                {selectedModel === 'no_model' ? <ImageIcon className="w-4 h-4" /> : "AI"}
             </div>
             <div className="text-[11px] leading-tight">
                Active Model: <strong>{MODELS.find(m => m.id === selectedModel)?.name}</strong><br />
                <span className="text-green-600 font-bold uppercase tracking-widest text-[9px]">Realistic Engine Active</span>
             </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-12 shrink-0 border-t border-brand-line bg-white flex items-center justify-between px-10 text-[11px] font-medium text-black/40">
        <div>GPU CLUSTER: <strong className="text-black/80">REGION-WEST (0.3s LATENCY)</strong></div>
        <div className="flex items-center gap-2">
          <span>© 2026 MODELIZE AI TECHNOLOGIES</span>
          <span className="opacity-20">•</span>
          <span>BENGALURU HUB</span>
        </div>
        <div>STATUS: <strong className="text-green-600">READY FOR SYTHESIS</strong></div>
      </footer>
    </div>
  );
}
