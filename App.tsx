
import React, { useState } from 'react';
import { BookOpen, MessageCircle, Image as ImageIcon, Mic, LogIn, LogOut, User, Moon, Sun } from 'lucide-react';
import ChatMode from './components/ChatMode';
import LiveMode from './components/LiveMode';
import ImageMode from './components/ImageMode';
import { AppMode } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

function MainApp() {
  const [mode, setMode] = useState<AppMode>(AppMode.CHAT);
  const { user, signInWithGoogle, signOut, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#e8ecef] dark:bg-stone-950 p-0 md:p-4 gap-4 font-sans text-stone-900 dark:text-stone-100 transition-colors duration-300">

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex w-20 lg:w-72 bg-emerald-950 dark:bg-emerald-950/50 text-white flex-col items-center lg:items-start rounded-[2.5rem] shadow-2xl shadow-emerald-950/20 z-20 py-8 transition-all duration-300">
        <div className="px-6 mb-8 flex items-center justify-center lg:justify-start w-full gap-4">
          <div className="w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-400/30 text-emerald-950 transform hover:rotate-6 transition-transform">
            <BookOpen size={24} strokeWidth={2.5} />
          </div>
          <div className="hidden lg:block">
            <span className="font-serif text-2xl font-bold text-white tracking-wide block">Al-Hikmah</span>
            <span className="text-xs text-emerald-300 font-medium tracking-widest uppercase">Scholar AI</span>
          </div>
        </div>

        <nav className="flex-1 w-full space-y-3 px-3 lg:px-6">
          <button
            onClick={() => setMode(AppMode.CHAT)}
            className={`w-full p-4 rounded-3xl flex items-center justify-center lg:justify-start gap-4 transition-all duration-300 group ${
              mode === AppMode.CHAT 
                ? 'bg-white text-emerald-900 shadow-lg shadow-emerald-900/20 transform scale-[1.02]' 
                : 'text-emerald-100 hover:bg-emerald-900/50 hover:text-white'
            }`}
          >
            <MessageCircle size={24} className={mode === AppMode.CHAT ? "fill-current" : ""} />
            <span className="hidden lg:block font-bold">Scholar Chat</span>
          </button>

          <button
            onClick={() => setMode(AppMode.LIVE)}
            className={`w-full p-4 rounded-3xl flex items-center justify-center lg:justify-start gap-4 transition-all duration-300 group ${
              mode === AppMode.LIVE 
                ? 'bg-white text-emerald-900 shadow-lg shadow-emerald-900/20 transform scale-[1.02]' 
                : 'text-emerald-100 hover:bg-emerald-900/50 hover:text-white'
            }`}
          >
            <Mic size={24} className={mode === AppMode.LIVE ? "fill-current" : ""} />
            <span className="hidden lg:block font-bold">Live Voice</span>
          </button>

          <button
            onClick={() => setMode(AppMode.IMAGE)}
            className={`w-full p-4 rounded-3xl flex items-center justify-center lg:justify-start gap-4 transition-all duration-300 group ${
              mode === AppMode.IMAGE 
                ? 'bg-white text-emerald-900 shadow-lg shadow-emerald-900/20 transform scale-[1.02]' 
                : 'text-emerald-100 hover:bg-emerald-900/50 hover:text-white'
            }`}
          >
            <ImageIcon size={24} className={mode === AppMode.IMAGE ? "fill-current" : ""} />
            <span className="hidden lg:block font-bold">Restoration</span>
          </button>
        </nav>

        {/* Auth & Footer Section */}
        <div className="px-4 w-full mt-auto space-y-4">
            <button 
                onClick={toggleTheme}
                className="w-full p-3 rounded-2xl bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-200 flex items-center justify-center lg:justify-start gap-3 transition-colors"
            >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                <span className="hidden lg:inline text-sm font-semibold">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            <div className="bg-emerald-900/40 rounded-3xl p-2 backdrop-blur-sm">
           {loading ? (
             <div className="flex justify-center p-4"><div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div></div>
           ) : user ? (
              <div className="flex flex-col gap-2">
                 <div className="flex items-center justify-center lg:justify-start gap-3 p-2 bg-emerald-900/50 rounded-2xl">
                    {user.photoURL ? (
                        <img 
                          src={user.photoURL} 
                          alt="User" 
                          className="w-10 h-10 rounded-full border-2 border-amber-400/50" 
                          referrerPolicy="no-referrer"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-emerald-800 flex items-center justify-center text-emerald-200"><User size={20} /></div>
                    )}
                    <div className="hidden lg:flex flex-col overflow-hidden">
                        <span className="text-sm font-bold text-white truncate">{user.displayName?.split(' ')[0]}</span>
                        <span className="text-[10px] text-emerald-300 truncate">Online</span>
                    </div>
                 </div>
                 <button 
                    onClick={signOut}
                    className="w-full p-3 rounded-2xl bg-emerald-800/50 hover:bg-red-500/20 text-emerald-200 hover:text-red-200 flex items-center justify-center lg:justify-start gap-3 transition-colors text-sm font-semibold"
                 >
                    <LogOut size={18} />
                    <span className="hidden lg:inline">Sign Out</span>
                 </button>
              </div>
           ) : (
              <button 
                onClick={signInWithGoogle}
                className="w-full p-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold flex items-center justify-center lg:justify-start gap-3 transition-all shadow-lg hover:shadow-amber-400/40 hover:-translate-y-0.5"
              >
                <LogIn size={22} />
                <span className="hidden lg:block">Sign In</span>
              </button>
           )}
           </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-emerald-950 text-white shadow-md z-30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center text-emerald-950">
                <BookOpen size={20} strokeWidth={2.5} />
            </div>
            <span className="font-serif text-xl font-bold">Al-Hikmah</span>
          </div>
          <div className="flex items-center gap-2">
             <button onClick={toggleTheme} className="p-2 text-emerald-200 hover:text-white">
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
             </button>
             {user ? (
                <img 
                    src={user.photoURL || ''} 
                    alt="User" 
                    className="w-8 h-8 rounded-full border border-amber-400" 
                    referrerPolicy="no-referrer"
                    onClick={signOut}
                />
             ) : (
                <button onClick={signInWithGoogle} className="bg-amber-400 text-emerald-950 p-2 rounded-full">
                    <LogIn size={18} />
                </button>
             )}
          </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 h-[calc(100vh-80px)] md:h-full bg-white dark:bg-stone-900 md:rounded-[2.5rem] shadow-xl shadow-stone-200/50 dark:shadow-none overflow-hidden relative border border-white dark:border-stone-800 transition-colors duration-300">
        {mode === AppMode.CHAT && <ChatMode />}
        {mode === AppMode.LIVE && <LiveMode />}
        {mode === AppMode.IMAGE && <ImageMode />}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex justify-around items-center p-2 pb-safe z-30">
          <button
            onClick={() => setMode(AppMode.CHAT)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${mode === AppMode.CHAT ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 'text-stone-400 dark:text-stone-500'}`}
          >
            <MessageCircle size={24} className={mode === AppMode.CHAT ? "fill-current" : ""} />
            <span className="text-[10px] font-bold">Chat</span>
          </button>
          <button
            onClick={() => setMode(AppMode.LIVE)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${mode === AppMode.LIVE ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 'text-stone-400 dark:text-stone-500'}`}
          >
            <Mic size={24} className={mode === AppMode.LIVE ? "fill-current" : ""} />
            <span className="text-[10px] font-bold">Live</span>
          </button>
          <button
            onClick={() => setMode(AppMode.IMAGE)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${mode === AppMode.IMAGE ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 'text-stone-400 dark:text-stone-500'}`}
          >
            <ImageIcon size={24} className={mode === AppMode.IMAGE ? "fill-current" : ""} />
            <span className="text-[10px] font-bold">Restore</span>
          </button>
      </nav>
    </div>
  );
}

export default function App() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <MainApp />
            </ThemeProvider>
        </AuthProvider>
    );
}
