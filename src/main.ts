import { MicAnalyser } from './audio';
import { BloomScene } from './scene';
import type { VisMode } from './scene';

const canvas = document.getElementById('stage') as HTMLCanvasElement;
const startBtn = document.getElementById('start') as HTMLButtonElement;
const fileBtn = document.getElementById('fileBtn') as HTMLButtonElement;
const playBtn = document.getElementById('playBtn') as HTMLButtonElement;
const modeBtn = document.getElementById('modeBtn') as HTMLButtonElement;
const resetBtn = document.getElementById('resetBtn') as HTMLButtonElement;
const aboutBtn = document.getElementById('aboutBtn') as HTMLButtonElement;
const aboutLink = document.getElementById('aboutLink') as HTMLAnchorElement;
const fullscreenBtn = document.getElementById('fullscreenBtn') as HTMLButtonElement;
const fileInput = document.getElementById('fileInput') as HTMLInputElement;
const gainEl = document.getElementById('gain') as HTMLInputElement;
const volumeEl = document.getElementById('volume') as HTMLInputElement;
const levelValue = document.getElementById('levelValue') as HTMLSpanElement;
const fpsValue = document.getElementById('fpsValue') as HTMLSpanElement;
const modeValue = document.getElementById('modeValue') as HTMLSpanElement;
const modal = document.getElementById('modal') as HTMLDivElement;
const modalClose = document.getElementById('modalClose') as HTMLButtonElement;

const audio = new MicAnalyser();
const app = new BloomScene(canvas);

let running = false;
let isPaused = false;
let isFullscreen = false;
let isMicActive = false;
let isFileActive = false;

const modes: VisMode[] = ['sphere', 'waveform', 'bars', 'tunnel', 'galaxy', 'fractals', 'water', 'texture', 'melt'];
let currentModeIndex = 0;

// Helper function to create play/pause icon
function setPlayPauseIcon(isPlaying: boolean) {
  const iconContainer = playBtn.querySelector('.play-pause-icon') as HTMLElement;
  
  if (isPlaying) {
    // Show pause icon (two bars)
    iconContainer.innerHTML = `
      <span class="pause-icon">
        <span class="pause-bar"></span>
        <span class="pause-bar"></span>
      </span>
    `;
  } else {
    // Show play icon (triangle)
    iconContainer.innerHTML = '<span class="play-icon"></span>';
  }
}

// Stop all audio sources properly
function stopAllAudio() {
  // Stop buffer source
  if (audio.bufferSource) {
    try {
      audio.bufferSource.stop();
      audio.bufferSource.disconnect();
    } catch (e) {
      // Already stopped
    }
    audio.bufferSource = undefined;
  }
  
  // Stop microphone and clean up media stream
  if (audio.mediaStream) {
    try {
      const tracks = audio.mediaStream.getTracks();
      tracks.forEach(track => track.stop());
      audio.mediaStream = undefined;
    } catch (e) {
      // Already stopped
    }
  }
  
  // Disconnect source
  if (audio.source) {
    try {
      audio.source.disconnect();
    } catch (e) {
      // Already disconnected
    }
    audio.source = undefined;
  }
  
  // Disconnect analyser
  if (audio.analyser) {
    try {
      audio.analyser.disconnect();
    } catch (e) {
      // Already disconnected
    }
  }
  
  // Disconnect gain node
  if (audio.gainNode) {
    try {
      audio.gainNode.disconnect();
    } catch (e) {
      // Already disconnected
    }
  }
  
  // Reset audio state
  audio.isPaused = false;
  audio.pauseTime = 0;
  audio.startTime = 0;
  audio.audioBuffer = undefined;
  
  running = false;
}

// Update UI state
function updateUIState() {
  // Update mic button
  if (isMicActive) {
    startBtn.classList.add('active');
    startBtn.innerHTML = '<span class="recording-icon"></span>REC';
    fileBtn.disabled = true;
  } else {
    startBtn.classList.remove('active');
    startBtn.textContent = 'Mic';
    fileBtn.disabled = false;
  }
  
  // Update file button
  if (isFileActive) {
    fileBtn.classList.add('active');
    startBtn.disabled = true;
  } else {
    fileBtn.classList.remove('active');
    fileBtn.disabled = false;
    fileBtn.textContent = 'File';
  }
  
  // Show/hide play button
  if (isFileActive) {
    playBtn.style.display = 'flex';
  } else {
    playBtn.style.display = 'none';
  }
  
  // Volume control
  volumeEl.disabled = !isFileActive;
}

// Fullscreen toggle
function toggleFullscreen() {
  isFullscreen = !isFullscreen;
  document.body.classList.toggle('fullscreen', isFullscreen);
  fullscreenBtn.textContent = isFullscreen ? '[ - ]' : '[ ]';
}

// Reset to initial state
function resetToInitialState() {
  // Exit fullscreen if active
  if (isFullscreen) {
    toggleFullscreen();
  }
  
  // Stop all audio
  stopAllAudio();
  
  // Reset flags
  isMicActive = false;
  isFileActive = false;
  
  // Reset scene
  app.reset();
  app.setMode('sphere');
  
  // Reset UI state
  isPaused = false;
  currentModeIndex = 0;
  
  // Reset controls
  gainEl.value = '2';
  volumeEl.value = '0.7';
  audio.gain = 2;
  audio.setVolume(0.7);
  
  // Reset file input
  fileInput.value = '';
  
  // Reset mode display
  modeValue.textContent = 'SPHERE';
  
  // Reset stats
  levelValue.textContent = '0%';
  
  // Update UI
  updateUIState();
}

// Modal handlers
function showModal() {
  modal.classList.add('show');
}

function hideModal() {
  modal.classList.remove('show');
}

aboutBtn.addEventListener('click', showModal);
aboutLink.addEventListener('click', showModal);
modalClose.addEventListener('click', hideModal);

modal.addEventListener('click', (e) => {
  if (e.target === modal) hideModal();
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (modal.classList.contains('show')) {
      hideModal();
    } else if (isFullscreen) {
      toggleFullscreen();
    }
  } else if (e.key === 'f' || e.key === 'F') {
    if (!modal.classList.contains('show')) {
      toggleFullscreen();
    }
  } else if (e.key === ' ' && isFileActive) {
    e.preventDefault();
    playBtn.click();
  }
});

fullscreenBtn.addEventListener('click', toggleFullscreen);

// Mic button - toggle on/off
startBtn.addEventListener('click', async () => {
  if (isMicActive) {
    // Stop microphone
    stopAllAudio();
    isMicActive = false;
    updateUIState();
  } else {
    // Start microphone
    try {
      // Stop any file playback first
      if (isFileActive) {
        stopAllAudio();
        isFileActive = false;
      }
      
      await audio.init();
      running = true;
      isMicActive = true;
      updateUIState();
    } catch (e) {
      console.error('Microphone error:', e);
      
      // More detailed error message
      const errorMsg = e instanceof Error ? e.message : 'Unknown error';
      if (errorMsg.includes('NotAllowedError') || errorMsg.includes('Permission')) {
        alert('Microphone access denied. Please grant microphone permissions in your browser settings and try again.\n\nNote: Microphone requires HTTPS in production.');
      } else if (errorMsg.includes('NotFoundError')) {
        alert('No microphone found. Please connect a microphone and try again.');
      } else if (errorMsg.includes('NotSupportedError')) {
        alert('Microphone not supported. Please use HTTPS or try uploading an audio file instead.');
      } else {
        alert(`Microphone error: ${errorMsg}\n\nPlease try uploading an audio file instead.`);
      }
    }
  }
});

// File button
fileBtn.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', async (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  
  try {
    // Stop any existing audio (mic or previous file)
    if (isMicActive || isFileActive) {
      stopAllAudio();
      isMicActive = false;
      isFileActive = false;
    }
    
    // Load new file
    await audio.initFromFile(file);
    running = true;
    isPaused = false;
    isFileActive = true;
    
    // Update file button text
    const fileName = file.name.length > 15 ? file.name.slice(0, 15) + '...' : file.name;
    fileBtn.textContent = fileName;
    
    setPlayPauseIcon(true);
    audio.setVolume(parseFloat(volumeEl.value));
    
    updateUIState();
  } catch (e) {
    console.error('File load error:', e);
    alert('Failed to load audio file. Please try a different file.');
  }
});

playBtn.addEventListener('click', () => {
  if (!running || !isFileActive) return;
  
  isPaused = audio.togglePlayPause();
  setPlayPauseIcon(!isPaused);
});

modeBtn.addEventListener('click', () => {
  currentModeIndex = (currentModeIndex + 1) % modes.length;
  const mode = modes[currentModeIndex];
  app.setMode(mode);
  modeValue.textContent = mode.toUpperCase();
});

resetBtn.addEventListener('click', () => {
  resetToInitialState();
});

gainEl.addEventListener('input', () => {
  audio.gain = parseFloat(gainEl.value);
});

volumeEl.addEventListener('input', () => {
  audio.setVolume(parseFloat(volumeEl.value));
});

// Initialize
audio.gain = parseFloat(gainEl.value);
audio.setVolume(parseFloat(volumeEl.value));
updateUIState();

function loop() {
  const lvl = running ? audio.level() : 0.0;
  const freqData = running ? audio.getFrequencyData() : undefined;
  
  levelValue.textContent = `${Math.round(lvl * 100)}%`;
  fpsValue.textContent = `${app.fps}`;
  
  app.update(lvl, freqData);
  requestAnimationFrame(loop);
}
loop();
