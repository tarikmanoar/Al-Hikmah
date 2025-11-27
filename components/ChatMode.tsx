import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Globe, User, Bot, Plus, MessageSquare, Trash2, Menu, X, History } from 'lucide-react';
import { ChatSession, ChatState, Message, Role } from '../types';
import { STARTERS } from '../constants';
import { streamScholarChat, searchGroundedQuery } from '../services/geminiService';
import { ChatStorage } from '../services/chatStorage';
import MarkdownRenderer from './MarkdownRenderer';
import { useAuth } from '../context/AuthContext';

const ChatMode: React.FC = () => {
  const { user } = useAuth();
  
  // State for the active chat
  const [currentSession, setCurrentSession] = useState<ChatSession>(ChatStorage.createSession());
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const [useSearch, setUseSearch] = useState(false);
  
  // State for history sidebar
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isSessionsLoading, setIsSessionsLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load history on mount or when user changes
  useEffect(() => {
    const loadSessions = async () => {
        setIsSessionsLoading(true);
        const loadedSessions = await ChatStorage.getSessions(user);
        setSessions(loadedSessions);
        setIsSessionsLoading(false);
    };
    loadSessions();
  }, [user]);

  // Save current session whenever it changes (if it has messages)
  useEffect(() => {
    const lastMsg = currentSession.messages[currentSession.messages.length - 1];
    if (lastMsg?.isStreaming) return;

    const save = async () => {
        if (currentSession.messages.length > 0) {
            await ChatStorage.saveSession(user, currentSession);
            const updatedSessions = await ChatStorage.getSessions(user);
            setSessions(updatedSessions);
        }
    }
    save();
  }, [currentSession, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession.messages, isLoading]);

  const createNewChat = () => {
    const newSession = ChatStorage.createSession();
    setCurrentSession(newSession);
    setIsLoading(false);
    setInput('');
    if (window.innerWidth < 768) setShowHistory(false);
  };

  const loadSession = (session: ChatSession) => {
    setCurrentSession(session);
    if (window.innerWidth < 768) setShowHistory(false);
  };

  const deleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await ChatStorage.deleteSession(user, id);
    setSessions(prev => prev.filter(s => s.id !== id));
    
    if (currentSession.id === id) {
      createNewChat();
    }
  };

  const updateSessionTitleIfNeeded = (text: string) => {
    if (currentSession.messages.length === 0) {
      const title = text.length > 30 ? text.substring(0, 30) + '...' : text;
      setCurrentSession(prev => ({ ...prev, title }));
    }
  };

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;

    updateSessionTitleIfNeeded(text);

    const userMsg: Message = { id: Date.now().toString(), role: Role.USER, text };
    
    setCurrentSession(prev => ({
      ...prev,
      messages: [...prev.messages, userMsg]
    }));
    
    setIsLoading(true);
    setInput('');

    try {
      if (useSearch) {
        const result = await searchGroundedQuery(text);
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: Role.MODEL,
          text: result.text || "I found no results.",
          groundingUrls: result.groundingChunks?.map(c => ({ uri: c.web?.uri || '', title: c.web?.title || 'Source' })).filter(u => u.uri)
        };
        setCurrentSession(prev => ({
          ...prev,
          messages: [...prev.messages, aiMsg]
        }));
        setIsLoading(false);
      } else {
        const aiMsgId = (Date.now() + 1).toString();
        
        setCurrentSession(prev => ({
          ...prev,
          messages: [...prev.messages, { id: aiMsgId, role: Role.MODEL, text: '', isStreaming: true }]
        }));

        const history = currentSession.messages.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }));
        
        const stream = streamScholarChat(history, text);
        let fullText = "";

        for await (const chunk of stream) {
            fullText += chunk;
            setCurrentSession(prev => ({
                ...prev,
                messages: prev.messages.map(m => 
                    m.id === aiMsgId ? { ...m, text: fullText } : m
                )
            }));
        }
        
        setCurrentSession(prev => ({
            ...prev,
            messages: prev.messages.map(m => 
                m.id === aiMsgId ? { ...m, isStreaming: false } : m
            )
        }));
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      setCurrentSession(prev => ({
        ...prev,
        messages: [...prev.messages, { id: Date.now().toString(), role: Role.MODEL, text: "I apologize, but I encountered an error. Please try asking again." }]
      }));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex h-full bg-stone-50 overflow-hidden relative">
      
      {/* Mobile History Toggle Overlay */}
      {showHistory && (
        <div 
          className="fixed inset-0 bg-emerald-950/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setShowHistory(false)}
        />
      )}

      {/* Sidebar (History) */}
      <div className={`
        absolute md:relative z-40 h-full w-80 bg-stone-100/50 backdrop-blur-md border-r border-white/50 transform transition-transform duration-300 ease-in-out flex flex-col shadow-xl md:shadow-none
        ${showHistory ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:hidden xl:w-80 xl:flex'}
      `}>
        <div className="p-6 flex items-center justify-between">
            <h3 className="font-bold text-stone-700 text-lg">Knowledge Log</h3>
            <button onClick={() => setShowHistory(false)} className="md:hidden text-stone-400 hover:text-stone-600">
                <X size={24} />
            </button>
        </div>

        <div className="px-5 pb-2">
             <button 
                onClick={createNewChat}
                className="w-full flex items-center justify-center gap-2 bg-white text-emerald-800 py-4 rounded-2xl hover:bg-emerald-50 hover:shadow-lg transition-all shadow-sm border border-stone-200 font-bold text-sm"
            >
                <Plus size={18} /> New Discussion
            </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
            {isSessionsLoading ? (
                <div className="flex justify-center p-8">
                    <Sparkles className="animate-spin text-emerald-300" size={24} />
                </div>
            ) : sessions.length === 0 ? (
                <div className="text-center text-stone-400 text-sm py-12 px-4">
                    {user ? "Your journey of knowledge begins here." : "Discussions will be saved to your device."}
                </div>
            ) : (
                sessions.map(session => (
                    <div 
                        key={session.id}
                        onClick={() => loadSession(session)}
                        className={`group flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border ${currentSession.id === session.id ? 'bg-white shadow-md border-emerald-100 ring-1 ring-emerald-100' : 'border-transparent hover:bg-white hover:shadow-sm text-stone-500 hover:text-stone-700'}`}
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className={`p-2 rounded-xl ${currentSession.id === session.id ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-200 text-stone-500'}`}>
                                <MessageSquare size={16} flex-shrink-0 />
                            </div>
                            <div className="flex flex-col overflow-hidden min-w-0">
                                <span className="text-sm truncate font-bold">{session.title}</span>
                                <span className="text-[10px] text-stone-400 font-medium">{formatDate(session.updatedAt || session.createdAt)}</span>
                            </div>
                        </div>
                        <button 
                            onClick={(e) => deleteSession(e, session.id)}
                            className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-400 transition-opacity p-2 hover:bg-red-50 rounded-lg"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))
            )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full w-full relative bg-gradient-to-br from-white via-stone-50 to-emerald-50/30">
        
        {/* Header - Mobile Sidebar Toggle */}
        <div className="md:hidden xl:hidden absolute top-4 left-4 z-10">
            <button 
                onClick={() => setShowHistory(true)}
                className="p-3 bg-white/90 backdrop-blur border border-stone-200 rounded-2xl shadow-sm text-stone-600 hover:text-emerald-700"
            >
                <History size={20} />
            </button>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth">
          {currentSession.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-10 pt-10 animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 bg-gradient-to-tr from-emerald-100 to-white rounded-[2rem] flex items-center justify-center text-emerald-800 shadow-xl shadow-emerald-900/5 rotate-3">
                  <Bot size={48} />
              </div>
              <div className="space-y-3">
                <h2 className="text-4xl font-serif text-emerald-950">Al-Hikmah Scholar</h2>
                <p className="text-stone-500 max-w-lg mx-auto text-lg leading-relaxed">
                  Ask about Islamic history, the lives of Prophets, or biographies of the Sahaba.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full px-4">
                {STARTERS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(s.prompt)}
                    className="p-4 bg-white border border-stone-100 rounded-3xl text-sm text-emerald-900 hover:bg-emerald-50 hover:border-emerald-200 transition-all shadow-sm hover:shadow-md text-left flex items-center gap-3 group"
                  >
                    <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold group-hover:scale-110 transition-transform">{i+1}</span>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            currentSession.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === Role.USER ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-4xl gap-4 ${msg.role === Role.USER ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === Role.USER ? 'bg-amber-100 text-amber-700 rounded-tr-none' : 'bg-emerald-100 text-emerald-700 rounded-tl-none'}`}>
                    {msg.role === Role.USER ? <User size={20} /> : <Bot size={20} />}
                  </div>
                  <div className={`rounded-[2rem] px-8 py-6 shadow-sm ${
                      msg.role === Role.USER 
                      ? 'bg-gradient-to-br from-emerald-800 to-emerald-900 text-white rounded-tr-sm shadow-emerald-900/10' 
                      : 'bg-white text-stone-800 border border-stone-100 rounded-tl-sm shadow-stone-200/50'
                    }`}>
                    {msg.role === Role.USER ? (
                      <p className="whitespace-pre-wrap text-lg leading-relaxed">{msg.text}</p>
                    ) : (
                      <div className="min-w-[200px]">
                          <MarkdownRenderer content={msg.text} />
                          {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                              <div className="mt-6 pt-4 border-t border-dashed border-stone-200">
                                  <p className="text-xs font-extrabold text-stone-400 mb-3 uppercase tracking-widest flex items-center gap-2">
                                    <Globe size={12} /> Sources from Web
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                      {msg.groundingUrls.map((url, idx) => (
                                          <a key={idx} href={url.uri} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-semibold bg-stone-50 hover:bg-emerald-50 text-emerald-700 hover:text-emerald-800 px-3 py-2 rounded-xl transition-colors border border-stone-100">
                                              {url.title}
                                          </a>
                                      ))}
                                  </div>
                              </div>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
               <div className="flex justify-start pl-14">
                   <div className="flex items-center gap-3 text-stone-500 bg-white/80 backdrop-blur px-5 py-3 rounded-full text-sm shadow-sm border border-stone-100 animate-pulse">
                       <Sparkles size={16} className="animate-spin text-amber-400" />
                       <span className="font-medium">Reflecting on history...</span>
                   </div>
               </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Floating Input Area */}
        <div className="p-4 md:p-6 bg-gradient-to-t from-white via-white/80 to-transparent relative z-20">
          <div className="max-w-4xl mx-auto flex flex-col gap-3">
              <div className="flex items-center justify-between px-2">
                  <label className="flex items-center gap-3 cursor-pointer group bg-white/50 px-3 py-1.5 rounded-full border border-transparent hover:border-stone-200 transition-all">
                      <div className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-300 ${useSearch ? 'bg-amber-400' : 'bg-stone-300'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${useSearch ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                      <span className="text-xs font-bold text-stone-500 group-hover:text-stone-700 uppercase tracking-wide">
                          {useSearch ? 'Web Search Enabled' : 'Scholar Mode'}
                      </span>
                      <input type="checkbox" checked={useSearch} onChange={() => setUseSearch(!useSearch)} className="hidden" />
                  </label>
                  
                  {/* Desktop History Toggle */}
                  <button 
                    onClick={() => setShowHistory(!showHistory)}
                    className="hidden xl:flex items-center gap-2 text-xs font-bold text-stone-400 hover:text-emerald-800 transition-colors bg-white/50 px-3 py-1.5 rounded-full"
                  >
                      <History size={14} />
                      {showHistory ? 'Hide History' : 'Show History'}
                  </button>
              </div>
              
              <div className="relative flex items-end gap-2 bg-white shadow-xl shadow-stone-200/50 border border-stone-100 rounded-[2rem] p-2 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all">
                  <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={useSearch ? "Ask Google to search history..." : "Ask a question about Islamic History..."}
                  className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[56px] py-4 px-4 text-stone-800 placeholder-stone-400 text-lg"
                  rows={1}
                  />
                  <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className={`p-4 rounded-full mb-1 transition-all duration-300 transform ${
                      input.trim() && !isLoading
                      ? 'bg-emerald-800 text-white hover:bg-emerald-700 shadow-lg hover:shadow-emerald-900/20 hover:scale-105'
                      : 'bg-stone-100 text-stone-300 cursor-not-allowed'
                  }`}
                  >
                  <Send size={20} className={input.trim() ? "translate-x-0.5" : ""} />
                  </button>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMode;