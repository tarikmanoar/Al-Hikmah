
import React, { useState, useEffect } from 'react';
import { Save, X, AlertTriangle, Settings, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const FirebaseConfigModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState({
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  });

  useEffect(() => {
    const stored = localStorage.getItem('firebase_custom_config');
    if (stored) {
      try {
        setConfig(JSON.parse(stored));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    localStorage.setItem('firebase_custom_config', JSON.stringify(config));
    // Reload to re-initialize firebase
    window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-emerald-900 p-6 text-white flex justify-between items-start">
            <div className="flex gap-4">
                <div className="p-3 bg-white/10 rounded-2xl">
                    <Settings size={24} className="text-amber-400" />
                </div>
                <div>
                    <h3 className="text-xl font-serif font-bold">Firebase Setup</h3>
                    <p className="text-emerald-200 text-sm mt-1">Configure your backend connection</p>
                </div>
            </div>
            <button onClick={onClose} className="text-emerald-200 hover:text-white transition-colors">
                <X size={24} />
            </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3 text-sm text-amber-800 mb-4">
                <AlertTriangle className="shrink-0 text-amber-500" size={20} />
                <p>
                    Authentication requires a valid Firebase Project. Enter your web app configuration below.
                    You can find this in your Firebase Console &gt; Project Settings.
                </p>
            </div>

            {Object.keys(config).map((key) => (
                <div key={key} className="space-y-1">
                    <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <input
                        type="text"
                        name={key}
                        value={(config as any)[key]}
                        onChange={handleChange}
                        placeholder={`Enter ${key}...`}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                </div>
            ))}
        </div>

        <div className="p-6 pt-2 flex gap-3">
            <button 
                onClick={onClose}
                className="flex-1 py-3 rounded-xl font-bold text-stone-500 hover:bg-stone-100 transition-colors"
            >
                Cancel
            </button>
            <button 
                onClick={handleSave}
                className="flex-[2] py-3 rounded-xl bg-emerald-800 text-white font-bold shadow-lg shadow-emerald-900/20 hover:bg-emerald-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
                <Save size={18} />
                Save & Reload
            </button>
        </div>
      </div>
    </div>
  );
};

export default FirebaseConfigModal;
