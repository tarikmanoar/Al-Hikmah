
import React, { useEffect, useState, useRef } from 'react';
import { Mic, XCircle, Settings2, AlertTriangle, X, ChevronDown, Check } from 'lucide-react';
import { LiveManager } from '../services/liveManager';

const VOICES = [
  { id: 'Zephyr', name: 'Zephyr', gender: 'Female', desc: 'Calm & Steady' },
  { id: 'Puck', name: 'Puck', gender: 'Male', desc: 'Energetic' },
  { id: 'Charon', name: 'Charon', gender: 'Male', desc: 'Deep & Resonant' },
  { id: 'Kore', name: 'Kore', gender: 'Female', desc: 'Soft & Gentle' },
  { id: 'Fenrir', name: 'Fenrir', gender: 'Male', desc: 'Strong & Bold' },
];

const LANGUAGES = [
  { id: 'English', name: 'English' },
  { id: 'Arabic', name: 'Arabic' },
  { id: 'Urdu', name: 'Urdu' },
  { id: 'Bengali', name: 'Bengali' },
  { id: 'Turkish', name: 'Turkish' },
  { id: 'Indonesian', name: 'Indonesian' },
];

const STYLES = [
    { id: 'Conversational', name: 'Conversational', desc: 'Warm and natural' },
    { id: 'Concise', name: 'Concise', desc: 'Brief and direct' },
    { id: 'Detailed', name: 'Detailed', desc: 'Academic explanations' },
];

const STORAGE_KEY = 'al_hikmah_live_settings_v1';

const LiveMode: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [inputVol, setInputVol] = useState(0);
  const [outputVol, setOutputVol] = useState(0);
  
  // Settings with persistence
  const [selectedVoice, setSelectedVoice] = useState('Zephyr');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedStyle, setSelectedStyle] = useState('Conversational');
  const [showSettings, setShowSettings] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const liveManager = useRef<LiveManager | null>(null);

  // Load settings on mount
  useEffect(() => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.voice) setSelectedVoice(parsed.voice);
            if (parsed.language) setSelectedLanguage(parsed.language);
            if (parsed.style) setSelectedStyle(parsed.style);
        }
    } catch (e) {
        console.warn("Failed to load live settings", e);
    }
  }, []);

  // Save settings on change
  useEffect(() => {
    const settings = {
        voice: selectedVoice,
        language: selectedLanguage,
        style: selectedStyle
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [selectedVoice, selectedLanguage, selectedStyle]);

  useEffect(() => {
    return () => {
      if (liveManager.current) {
        liveManager.current.disconnect();
      }
    };
  }, []);

  const toggleConnection = async () => {
    setErrorMsg(null);
    
    if (isConnected) {
      liveManager.current?.disconnect();
      setIsConnected(false);
    } else {
      setIsConnecting(true);
      try {
        liveManager.current = new LiveManager();
        liveManager.current.onInputVolume = (v) => setInputVol(Math.min(v * 2, 100));
        liveManager.current.onOutputVolume = (v) => setOutputVol(v);
        liveManager.current.onDisconnect = () => {
            setIsConnected(false);
            setIsConnecting(false);
        };
        
        await liveManager.current.connect({
            voiceName: selectedVoice,
            language: selectedLanguage,
            responseStyle: selectedStyle
        });
        setIsConnected(true);
      } catch (error: any) {
        console.error("Failed to connect live", error);
        const message = error.message || "Connection failed. Please check your network and try again.";
        setErrorMsg(message);
        
        if (liveManager.current) {
            try {
                liveManager.current.disconnect();
            } catch (e) { /* ignore */ }
            liveManager.current = null;
        }
        setIsConnected(false);
      } finally {
        setIsConnecting(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-white relative overflow-hidden rounded-[2.5rem] transition-colors duration-300">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-5 pointer-events-none"></div>
      <div className={`absolute inset-0 bg-gradient-to-b from-emerald-100/50 dark:from-emerald-900/30 to-white/80 dark:to-black/80 transition-opacity duration-1000 ${isConnected ? 'opacity-100' : 'opacity-0'}`}></div>

      {/* Header */}
      <div className="z-10 w-full pt-8 pb-4 text-center shrink-0">
         <h2 className="text-3xl font-serif text-emerald-950 dark:text-amber-50 drop-shadow-sm dark:drop-shadow-lg">Voice Conversation</h2>
         <p className="text-emerald-800/60 dark:text-emerald-100/60 font-medium text-sm mt-1">Speak directly with the Scholar</p>
      </div>

      {/* Main Content - Visualizer */}
      <div className="flex-1 relative flex items-center justify-center min-h-0 w-full">
         <div className="relative flex items-center justify-center">
            {/* AI Voice Ring (Output) - Amber/Gold */}
             <div 
                className={`absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/30 via-orange-400/20 to-yellow-300/10 blur-3xl transition-all duration-150 ease-out will-change-transform mix-blend-multiply dark:mix-blend-screen`}
                style={{ 
                    width: '300px', height: '300px',
                    transform: isConnected ? `scale(${1 + outputVol / 50})` : 'scale(0.8)', 
                    opacity: isConnected ? 0.6 + (outputVol / 200) : 0 
                }}
            />
            
            {/* User Voice Ring (Input) - Emerald/Green */}
            <div 
                className={`absolute rounded-full bg-gradient-to-bl from-emerald-500/30 via-teal-400/20 to-cyan-300/10 blur-2xl transition-all duration-100 ease-out will-change-transform mix-blend-multiply dark:mix-blend-screen`}
                style={{ 
                    width: '250px', height: '250px',
                    transform: isConnected ? `scale(${0.9 + inputVol / 70})` : 'scale(0.8)', 
                    opacity: isConnected ? 0.5 + (inputVol / 200) : 0 
                }}
            />

            {/* Connecting/Idle Pulse */}
            {isConnecting && (
                 <div className="absolute rounded-full border-[6px] border-stone-400/30 dark:border-stone-600/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] w-64 h-64" />
            )}
            
             {/* Connected Idle Orbit */}
            {isConnected && inputVol < 5 && outputVol < 5 && (
                <div className="absolute w-72 h-72">
                   <div className="absolute inset-0 rounded-full border-2 border-emerald-600/20 dark:border-emerald-500/20 animate-[spin_10s_linear_infinite]" style={{ borderTopColor: 'rgba(16, 185, 129, 0.4)' }}></div>
                   <div className="absolute inset-6 rounded-full border-2 border-amber-600/20 dark:border-amber-500/20 animate-[spin_15s_linear_infinite_reverse]" style={{ borderBottomColor: 'rgba(245, 158, 11, 0.4)' }}></div>
                </div>
            )}

            {/* Main Button */}
            <button
                onClick={toggleConnection}
                disabled={isConnecting}
                className={`relative z-20 w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl backdrop-blur-md border-[6px] group ${
                    isConnected 
                    ? 'bg-red-500/10 dark:bg-red-500/20 border-red-500/40 hover:bg-red-500/20 dark:hover:bg-red-500/30 text-red-600 dark:text-red-100 hover:scale-105' 
                    : isConnecting
                    ? 'bg-stone-200/50 dark:bg-stone-800/50 border-stone-400 dark:border-stone-600 text-stone-500 dark:text-stone-400'
                    : 'bg-emerald-100/50 dark:bg-emerald-600/20 border-emerald-400/30 hover:bg-emerald-200/50 dark:hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-100 hover:border-emerald-500/60 dark:hover:border-emerald-400/60 hover:scale-105 hover:shadow-emerald-500/20'
                }`}
            >
                {isConnected ? <XCircle size={48} strokeWidth={2} /> : isConnecting ? <div className="animate-spin rounded-full h-12 w-12 border-4 border-stone-400 dark:border-stone-500 border-t-emerald-600 dark:border-t-white"></div> : <Mic size={48} strokeWidth={2} className="group-hover:drop-shadow-[0_0_10px_rgba(16,185,129,0.5)] dark:group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all" />}
            </button>
         </div>
      </div>

      {/* Footer / Controls */}
      <div className="z-20 w-full pb-8 pt-4 flex flex-col items-center gap-6 shrink-0">
         {/* Status Text */}
         <div className="text-center h-8">
             {errorMsg ? (
                <div className="flex items-center gap-2 text-red-700 dark:text-red-200 text-xs bg-red-100 dark:bg-red-900/60 px-4 py-1.5 rounded-full border border-red-200 dark:border-red-500/30 animate-in fade-in slide-in-from-bottom-2 backdrop-blur-sm">
                    <AlertTriangle size={14} className="flex-shrink-0" />
                    <span className="truncate max-w-[200px] md:max-w-xs">{errorMsg}</span>
                </div>
             ) : (
                <span className={`text-sm font-bold tracking-widest uppercase transition-colors duration-300 ${isConnected ? 'text-emerald-600 dark:text-emerald-300' : 'text-stone-400 dark:text-stone-500'}`}>
                    {isConnected ? (outputVol > 10 ? 'Scholar Speaking...' : (inputVol > 10 ? 'Listening...' : 'Connected')) : isConnecting ? 'Establishing Connection...' : 'Tap to Start'}
                </span>
             )}
         </div>

         {/* Settings Trigger */}
         <button 
            onClick={() => setShowSettings(true)}
            disabled={isConnected || isConnecting}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition-all border ${
                isConnected || isConnecting 
                ? 'opacity-0 pointer-events-none' 
                : 'bg-white/40 dark:bg-white/5 border-stone-200 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10 text-emerald-800/80 dark:text-emerald-100/80 hover:text-emerald-900 dark:hover:text-white shadow-sm dark:shadow-none'
            }`}
         >
             <Settings2 size={18} />
             <span className="text-sm font-bold uppercase tracking-wide">Settings</span>
             <ChevronDown size={14} className="opacity-50" />
         </button>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 z-50 bg-stone-900/20 dark:bg-stone-900/90 backdrop-blur-md flex items-end md:items-center justify-center p-4 animate-in fade-in duration-200">
            <div 
                className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-white/10 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-6 animate-in slide-in-from-bottom-10 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-stone-100 dark:border-white/5 pb-4">
                    <div className="flex items-center gap-3 text-emerald-950 dark:text-emerald-100">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl">
                            <Settings2 size={20} className="text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="font-bold text-lg">Conversation Settings</span>
                    </div>
                    <button 
                        onClick={() => setShowSettings(false)}
                        className="p-2 hover:bg-stone-100 dark:hover:bg-white/5 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider ml-1">Scholar Voice</label>
                        <div className="grid grid-cols-1 gap-2">
                            {VOICES.map(v => (
                                <button 
                                    key={v.id}
                                    onClick={() => setSelectedVoice(v.id)}
                                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                                        selectedVoice === v.id 
                                        ? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/50 text-emerald-900 dark:text-white' 
                                        : 'bg-stone-50 dark:bg-stone-900/40 border-stone-100 dark:border-white/5 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900/60'
                                    }`}
                                >
                                    <div className="flex flex-col text-left">
                                        <span className="font-bold text-sm">{v.name}</span>
                                        <span className="text-[10px] opacity-70">{v.gender} • {v.desc}</span>
                                    </div>
                                    {selectedVoice === v.id && <Check size={16} className="text-emerald-600 dark:text-emerald-400" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider ml-1">Language</label>
                            <select 
                                value={selectedLanguage}
                                onChange={(e) => setSelectedLanguage(e.target.value)}
                                className="w-full bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-white/10 rounded-xl px-3 py-3 text-sm text-stone-800 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
                            >
                                {LANGUAGES.map(l => (
                                    <option key={l.id} value={l.name}>{l.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider ml-1">Style</label>
                            <select 
                                value={selectedStyle}
                                onChange={(e) => setSelectedStyle(e.target.value)}
                                className="w-full bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-white/10 rounded-xl px-3 py-3 text-sm text-stone-800 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
                            >
                                {STYLES.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={() => setShowSettings(false)}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-900/20 transition-all"
                >
                    Save & Close
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default LiveMode;
