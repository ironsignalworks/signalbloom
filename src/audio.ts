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
  mediaStream?: MediaStream; // Exposed for proper cleanup

  async init() {
    // Create new context if needed
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    // Resume context if suspended
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    
    // Request microphone access
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: { 
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false 
      }, 
      video: false 
    });
    
    this.mediaStream = stream; // Store for cleanup
    this.source = this.ctx.createMediaStreamSource(stream);
    this.setupAnalyser();
    
    // Note: Microphone input is not connected to speakers to avoid feedback
  }

  async initFromFile(file: File) {
    // Create new context if needed
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    // Resume context if suspended
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    
    // Stop existing buffer source if any
    if (this.bufferSource) {
      try {
        this.bufferSource.stop();
        this.bufferSource.disconnect();
      } catch (e) {
        // Already stopped
      }
    }

    const arrayBuffer = await file.arrayBuffer();
    this.audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
    
    // Reset pause time when loading new file
    this.pauseTime = 0;
    
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
    
    // If analyser already exists, disconnect it first
    if (this.analyser) {
      try {
        this.analyser.disconnect();
      } catch (e) {
        // Already disconnected
      }
    }
    
    // If gain node exists, disconnect it first
    if (this.gainNode) {
      try {
        this.gainNode.disconnect();
      } catch (e) {
        // Already disconnected
      }
    }
    
    // Create new analyser
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.75;
    this.analyser.minDecibels = -90;
    this.analyser.maxDecibels = -10;
    
    // Connect source to analyser
    this.source.connect(this.analyser);
    
    // Create gain node for volume control
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.value = 1.0;
    this.analyser.connect(this.gainNode);
    
    // Connect to speakers only for file playback (not microphone to avoid feedback)
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
