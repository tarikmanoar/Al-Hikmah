import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { MODELS, SYSTEM_INSTRUCTION_SCHOLAR } from "../constants";
import { arrayBufferToBase64, decodeAudioData } from "../utils";
import { LiveConfig } from "../types";

export class LiveManager {
  private ai: GoogleGenAI;
  private sessionPromise: Promise<any> | null = null;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private nextStartTime = 0;
  private sources = new Set<AudioBufferSourceNode>();
  
  // Callbacks
  public onOutputVolume: (vol: number) => void = () => {};
  public onInputVolume: (vol: number) => void = () => {};
  public onDisconnect: () => void = () => {};

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async connect(config: LiveConfig) {
    try {
        this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        
        // Setup Microphone
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        const inputNode = this.inputAudioContext.createGain();
        const source = this.inputAudioContext.createMediaStreamSource(this.stream);
        
        // Analyze input volume
        const analyzer = this.inputAudioContext.createAnalyser();
        source.connect(analyzer);
        const dataArray = new Uint8Array(analyzer.frequencyBinCount);
        
        const updateInputVol = () => {
            if (!this.stream) return;
            analyzer.getByteFrequencyData(dataArray);
            const avg = dataArray.reduce((a,b) => a+b) / dataArray.length;
            this.onInputVolume(avg);
            requestAnimationFrame(updateInputVol);
        }
        updateInputVol();

        // Processor for sending audio
        const scriptProcessor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);
        scriptProcessor.onaudioprocess = (e) => {
            if (!this.sessionPromise) return;

            const inputData = e.inputBuffer.getChannelData(0);
            const pcmData = this.float32ToInt16(inputData);
            const base64Data = arrayBufferToBase64(pcmData.buffer);

            // Capture the current promise to prevent race conditions if it changes
            const currentPromise = this.sessionPromise;
            
            currentPromise.then(session => {
                // Ensure we are still using the same session
                if (this.sessionPromise !== currentPromise) return;
                
                session.sendRealtimeInput({
                    media: {
                        mimeType: "audio/pcm;rate=16000",
                        data: base64Data
                    }
                });
            }).catch((err) => {
                // Squelch errors from closed sessions to prevent log noise
            }); 
        };

        source.connect(scriptProcessor);
        scriptProcessor.connect(this.inputAudioContext.destination);

        // Prepare system instruction with language and style preference
        let systemInstruction = SYSTEM_INSTRUCTION_SCHOLAR;
        
        // Style adjustments
        if (config.responseStyle === 'Concise') {
            systemInstruction += "\nKeep responses brief, direct, and to the point. Avoid lengthy elaboration unless asked.";
        } else if (config.responseStyle === 'Detailed') {
            systemInstruction += "\nProvide comprehensive, detailed, and academic explanations.";
        } else {
            // Default Conversational
            systemInstruction += "\nKeep responses relatively brief, warm, and conversational suitable for voice chat.";
        }

        if (config.language) {
            systemInstruction += `\nIMPORTANT: You must converse in ${config.language}.`;
        }

        // Initialize Gemini Live Session
        this.sessionPromise = this.ai.live.connect({
        model: MODELS.LIVE,
        callbacks: {
            onopen: () => console.log("Live Session Connected"),
            onmessage: (msg: LiveServerMessage) => this.handleMessage(msg),
            onclose: () => {
                console.log("Live Session Closed");
                this.disconnect();
            },
            onerror: (err) => {
                console.error("Live Session Error", err);
                // On critical error, we might want to notify or close.
            },
        },
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: config.voiceName || 'Zephyr' } },
            },
            systemInstruction: systemInstruction,
        },
        });

        // Await connection to ensure we catch initial network errors (like invalid key/model)
        await this.sessionPromise;
    } catch (error) {
        console.error("Connection failed:", error);
        // CRITICAL: If connection fails, nullify the promise so disconnect() 
        // doesn't try to close a failed session object.
        this.sessionPromise = null;
        this.disconnect(); 
        throw error;
    }
  }

  private async handleMessage(message: LiveServerMessage) {
    const serverContent = message.serverContent;
    
    // Handle Interruption
    if (serverContent?.interrupted) {
      this.sources.forEach(src => {
        try { src.stop(); } catch(e){}
      });
      this.sources.clear();
      this.nextStartTime = 0;
      return;
    }

    // Handle Audio
    const base64Audio = serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (base64Audio && this.outputAudioContext) {
       // Simulate output volume roughly
       this.onOutputVolume(Math.random() * 50 + 50); 
       setTimeout(() => this.onOutputVolume(0), 200);

       this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
       
       const rawBytes = this.base64ToUint8(base64Audio);
       const audioBuffer = await decodeAudioData(rawBytes, this.outputAudioContext);
       
       const source = this.outputAudioContext.createBufferSource();
       source.buffer = audioBuffer;
       source.connect(this.outputAudioContext.destination);
       
       source.addEventListener('ended', () => {
         this.sources.delete(source);
       });
       
       source.start(this.nextStartTime);
       this.nextStartTime += audioBuffer.duration;
       this.sources.add(source);
    }
  }

  public disconnect() {
    this.stream?.getTracks().forEach(t => t.stop());
    
    if (this.inputAudioContext) {
        try {
            if (this.inputAudioContext.state !== 'closed') {
                this.inputAudioContext.close();
            }
        } catch (e) {
            console.warn("Error closing input audio context", e);
        }
    }
    
    if (this.outputAudioContext) {
        try {
            if (this.outputAudioContext.state !== 'closed') {
                this.outputAudioContext.close();
            }
        } catch (e) {
            console.warn("Error closing output audio context", e);
        }
    }

    // Only attempt to close session if the promise exists and was successfully created
    if (this.sessionPromise) {
        const currentSession = this.sessionPromise;
        this.sessionPromise = null; // Prevent double close or usage
        currentSession
            .then(s => s.close())
            .catch(e => console.warn("Failed to close session properly (it might be already closed)", e));
    }
    
    this.stream = null;
    this.onDisconnect();
  }

  private float32ToInt16(float32: Float32Array): Int16Array {
    const int16 = new Int16Array(float32.length);
    for (let i = 0; i < float32.length; i++) {
        let s = Math.max(-1, Math.min(1, float32[i]));
        int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return int16;
  }

  private base64ToUint8(base64: string): Uint8Array {
      const binaryString = atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
  }
}