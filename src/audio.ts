export class MicAnalyser {
  ctx?: AudioContext;
  analyser?: AnalyserNode;
  data?: Uint8Array<ArrayBuffer>;
  gain = 1.5;
  source?: MediaStreamAudioSourceNode | MediaElementAudioSourceNode | AudioBufferSourceNode;
  bufferSource?: AudioBufferSourceNode;
  isPaused = false;
  pauseTime = 0;
  startTime = 0;
  audioBuffer?: AudioBuffer;
  gainNode?: GainNode;
  mediaStream?: MediaStream; // Exposed for proper cleanup on reset

  async init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: { 
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false 
      }, 
      video: false 
    });
    this.mediaStream = stream; // Store media stream for cleanup
    this.source = this.ctx.createMediaStreamSource(stream);
    this.setupAnalyser();
    // Note: Microphone input is not connected to speakers to avoid feedback
  }

  async initFromFile(file: File) {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    // Stop existing source if any
    if (this.bufferSource) {
      this.bufferSource.stop();
      this.bufferSource.disconnect();
    }

    const arrayBuffer = await file.arrayBuffer();
    this.audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
    
    this.playBuffer();
  }

  private playBuffer() {
    if (!this.ctx || !this.audioBuffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = this.audioBuffer;
    source.loop = true;
    
    this.bufferSource = source;
    this.source = source;
    this.setupAnalyser();
    
    // Connect to speakers for audio playback
    if (this.gainNode) {
      this.gainNode.connect(this.ctx.destination);
    }
    
    this.startTime = this.ctx.currentTime - this.pauseTime;
    source.start(0, this.pauseTime);
    this.isPaused = false;
  }

  pause() {
    if (!this.ctx || !this.bufferSource || this.isPaused) return;
    
    this.pauseTime = this.ctx.currentTime - this.startTime;
    this.bufferSource.stop();
    this.bufferSource.disconnect();
    if (this.gainNode) {
      this.gainNode.disconnect();
    }
    this.isPaused = true;
  }

  resume() {
    if (!this.isPaused || !this.audioBuffer) return;
    this.playBuffer();
  }

  togglePlayPause(): boolean {
    if (this.isPaused) {
      this.resume();
      return false; // not paused
    } else {
      this.pause();
      return true; // is paused
    }
  }

  private setupAnalyser() {
    if (!this.ctx || !this.source) return;
    
    if (this.analyser) {
      this.source.connect(this.analyser);
      
      // For file playback, also connect to destination (speakers)
      if (this.source instanceof AudioBufferSourceNode) {
        if (!this.gainNode) {
          this.gainNode = this.ctx.createGain();
          this.gainNode.gain.value = 1.0;
          this.analyser.connect(this.gainNode);
        }
        this.source.connect(this.analyser);
      }
      return;
    }
    
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.75;
    this.analyser.minDecibels = -90;
    this.analyser.maxDecibels = -10;
    
    this.source.connect(this.analyser);
    
    // Create gain node for volume control and speaker output
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.value = 1.0;
    this.analyser.connect(this.gainNode);
    
    // Connect to speakers only for file playback, not microphone (to avoid feedback)
    if (this.source instanceof AudioBufferSourceNode) {
      this.gainNode.connect(this.ctx.destination);
    }
    
    this.data = new Uint8Array(this.analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>;
  }

  setVolume(volume: number) {
    if (this.gainNode) {
      this.gainNode.gain.value = volume;
    }
  }

  /** returns a smoothed 0..1 level */
  level(): number {
    if (!this.analyser || !this.data || this.isPaused) return 0;
    this.analyser.getByteFrequencyData(this.data);
    let acc = 0;
    for (let i = 0; i < this.data.length; i++) acc += this.data[i];
    const avg = acc / this.data.length;            // 0..255
    return Math.min(1, (avg / 128) * this.gain);   // adjusted sensitivity
  }

  getFrequencyData(): Uint8Array<ArrayBuffer> | undefined {
    if (!this.analyser || !this.data || this.isPaused) return undefined;
    this.analyser.getByteFrequencyData(this.data);
    return this.data;
  }
}
