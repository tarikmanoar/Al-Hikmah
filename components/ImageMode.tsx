import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Sparkles, ArrowRight, Download, Wand2 } from 'lucide-react';
import { editImage } from '../services/geminiService';
import { blobToBase64 } from '../utils';

const ImageMode: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResultImage(null);
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile || !prompt.trim() || isProcessing) return;

    setIsProcessing(true);
    try {
      const base64 = await blobToBase64(selectedFile);
      const { imageBase64, text } = await editImage(base64, selectedFile.type, prompt);

      if (imageBase64) {
        setResultImage(`data:image/png;base64,${imageBase64}`);
      } else {
        alert("No image returned. The model might have just chatted back: " + text);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to edit image.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full bg-stone-50 dark:bg-stone-900 p-4 md:p-6 overflow-y-auto rounded-[2.5rem] transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-10 py-8">
        <div className="text-center space-y-3">
            <h2 className="text-4xl font-serif text-emerald-950 dark:text-emerald-100">Restoration & Edits</h2>
            <p className="text-stone-500 dark:text-stone-400 font-medium">Upload historical images or art to enhance, edit, or modify.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Input Section */}
            <div className="bg-white dark:bg-stone-800 p-6 md:p-8 rounded-[2.5rem] shadow-xl shadow-stone-200/50 dark:shadow-none border border-white dark:border-stone-700 space-y-8 h-full flex flex-col">
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-4 border-dashed rounded-[2rem] h-64 md:h-80 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group ${previewUrl ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-900/10' : 'border-stone-200 dark:border-stone-600 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-stone-50 dark:hover:bg-stone-700'}`}
                >
                    {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="h-full w-full object-contain rounded-3xl p-2" />
                    ) : (
                        <>
                            <div className="w-16 h-16 bg-stone-100 dark:bg-stone-700 rounded-full flex items-center justify-center text-stone-400 dark:text-stone-500 group-hover:scale-110 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-all mb-4">
                                <Upload size={28} />
                            </div>
                            <span className="text-stone-600 dark:text-stone-300 font-bold text-lg">Upload an Image</span>
                            <span className="text-sm text-stone-400 dark:text-stone-500 mt-2 font-medium">PNG, JPG (Max 5MB)</span>
                        </>
                    )}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                    />
                </div>

                <div className="space-y-3 flex-1">
                    <label className="text-sm font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wide ml-2">Magic Instruction</label>
                    <div className="relative">
                        <textarea 
                            className="w-full border-0 bg-stone-100 dark:bg-stone-900 rounded-3xl p-5 text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white dark:focus:bg-stone-800 transition-all resize-none shadow-inner dark:shadow-none"
                            rows={4}
                            placeholder="e.g., 'Restore this old photo', 'Make it look like a watercolor painting', 'Remove the person in the background'"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        />
                        <Wand2 className="absolute right-4 bottom-4 text-emerald-500/50" size={20} />
                    </div>
                </div>

                <button 
                    onClick={handleGenerate}
                    disabled={!selectedFile || !prompt || isProcessing}
                    className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg transition-all transform ${
                        !selectedFile || !prompt || isProcessing
                        ? 'bg-stone-100 dark:bg-stone-700 text-stone-300 dark:text-stone-500 cursor-not-allowed'
                        : 'bg-emerald-800 text-white hover:bg-emerald-700 shadow-xl hover:shadow-emerald-900/20 hover:-translate-y-1'
                    }`}
                >
                    {isProcessing ? (
                        <>
                            <Sparkles size={20} className="animate-spin" />
                            Applying Magic...
                        </>
                    ) : (
                        <>
                            <Sparkles size={20} />
                            Generate Edit
                        </>
                    )}
                </button>
            </div>

            {/* Output Section */}
            <div className="bg-white dark:bg-stone-800 p-6 md:p-8 rounded-[2.5rem] shadow-xl shadow-stone-200/50 dark:shadow-none border border-white dark:border-stone-700 min-h-[400px] md:min-h-[600px] flex flex-col">
                <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-6 flex items-center gap-3 px-2">
                    <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                        <ImageIcon size={18} />
                    </div>
                    Result
                </h3>
                
                <div className="flex-1 bg-stone-50 dark:bg-stone-900 rounded-[2rem] flex items-center justify-center relative overflow-hidden border border-stone-100 dark:border-stone-700 group">
                    {resultImage ? (
                        <img src={resultImage} alt="Generated" className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                        <div className="text-center text-stone-400 dark:text-stone-500">
                            {isProcessing ? (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="relative">
                                        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900 rounded-full animate-ping opacity-75 absolute"></div>
                                        <div className="w-20 h-20 bg-white dark:bg-stone-800 rounded-full flex items-center justify-center relative shadow-sm border border-emerald-100 dark:border-emerald-900">
                                            <Sparkles className="text-emerald-500 animate-spin" size={32} />
                                        </div>
                                    </div>
                                    <p className="font-medium animate-pulse">Consulting the archives...</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-4 opacity-50">
                                    <div className="w-20 h-20 bg-stone-200 dark:bg-stone-700 rounded-3xl rotate-12"></div>
                                    <p className="font-medium">Edited image will appear here</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {resultImage && (
                    <a 
                        href={resultImage} 
                        download="edited-image.png"
                        className="mt-6 w-full py-4 bg-amber-400 hover:bg-amber-300 rounded-2xl flex items-center justify-center gap-3 text-emerald-950 font-bold shadow-lg hover:shadow-amber-400/30 transition-all hover:-translate-y-1"
                    >
                        <Download size={20} />
                        Download Image
                    </a>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ImageMode;