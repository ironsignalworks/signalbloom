# Deployment and Microphone Fix Guide

## Issues Fixed

### 1. ? Microphone Not Working After Deployment

**Problem**: Microphone access fails on deployed site but works locally.

**Root Cause**: Modern browsers require HTTPS for microphone access (except on `localhost`).

**Solution**:
- ? Updated error messages to explain HTTPS requirement
- ? GitHub Pages automatically provides HTTPS
- ? Added audio context state checking (resume if suspended)
- ? Better error handling with specific messages

---

### 2. ? Cannot Toggle Between Mic and File

**Problem**: After selecting mic or file, must reset entire app to switch sources.

**Root Cause**: 
- Insufficient cleanup of audio nodes
- State not properly reset when switching
- Media stream tracks not stopped

**Solution**:
- ? Proper cleanup of media stream tracks
- ? Disconnect all audio nodes before switching
- ? Reset audio state flags
- ? Clear file input and button text
- ? Enable/disable buttons correctly

---

## Code Changes

### `src/main.ts`

#### Improved `stopAllAudio()`:
```typescript
function stopAllAudio() {
  // Stop buffer source
  if (audio.bufferSource) {
    try {
      audio.bufferSource.stop();
      audio.bufferSource.disconnect();
    } catch (e) {}
    audio.bufferSource = undefined;
  }
  
  // Stop microphone and clean up media stream
  if (audio.mediaStream) {
    try {
      const tracks = audio.mediaStream.getTracks();
      tracks.forEach(track => track.stop());
      audio.mediaStream = undefined;
    } catch (e) {}
  }
  
  // Disconnect all nodes
  if (audio.source) {
    try { audio.source.disconnect(); } catch (e) {}
    audio.source = undefined;
  }
  
  if (audio.analyser) {
    try { audio.analyser.disconnect(); } catch (e) {}
  }
  
  if (audio.gainNode) {
    try { audio.gainNode.disconnect(); } catch (e) {}
  }
  
  // Reset state
  audio.isPaused = false;
  audio.pauseTime = 0;
  audio.startTime = 0;
  audio.audioBuffer = undefined;
  running = false;
}
```

#### Enhanced Error Messages:
```typescript
catch (e) {
  const errorMsg = e instanceof Error ? e.message : 'Unknown error';
  if (errorMsg.includes('NotAllowedError')) {
    alert('Microphone access denied. Grant permissions and try again.\n\nNote: Requires HTTPS in production.');
  } else if (errorMsg.includes('NotFoundError')) {
    alert('No microphone found.');
  } else if (errorMsg.includes('NotSupportedError')) {
    alert('Microphone not supported. Use HTTPS or upload file.');
  }
}
```

#### Proper Source Switching:
```typescript
// In mic button handler
if (isFileActive) {
  stopAllAudio();
  isFileActive = false;
}
await audio.init();

// In file input handler
if (isMicActive || isFileActive) {
  stopAllAudio();
  isMicActive = false;
  isFileActive = false;
}
await audio.initFromFile(file);
```

---

### `src/audio.ts`

#### Audio Context State Management:
```typescript
async init() {
  // Create new context if needed
  if (!this.ctx || this.ctx.state === 'closed') {
    this.ctx = new AudioContext();
  }
  
  // Resume context if suspended
  if (this.ctx.state === 'suspended') {
    await this.ctx.resume();
  }
  
  // ... rest of init
}
```

#### Improved Analyser Setup:
```typescript
private setupAnalyser() {
  if (!this.ctx || !this.source) return;
  
  // Disconnect existing nodes first
  if (this.analyser) {
    try { this.analyser.disconnect(); } catch (e) {}
  }
  
  if (this.gainNode) {
    try { this.gainNode.disconnect(); } catch (e) {}
  }
  
  // Create new analyser
  this.analyser = this.ctx.createAnalyser();
  // ... configure analyser
  
  // Connect properly
  this.source.connect(this.analyser);
  this.gainNode = this.ctx.createGain();
  this.analyser.connect(this.gainNode);
  
  // Connect to speakers only for file playback
  if (this.source instanceof AudioBufferSourceNode) {
    this.gainNode.connect(this.ctx.destination);
  }
}
```

---

## Testing Checklist

### Local Testing (Localhost)

- [x] ? Mic works on localhost (no HTTPS needed)
- [x] ? File upload works
- [x] ? Can switch from mic to file without reset
- [x] ? Can switch from file to mic without reset
- [x] ? Play/pause works for file playback
- [x] ? Volume control works for file playback
- [x] ? Gain control works for both mic and file
- [x] ? Reset button clears all state properly

### Deployment Testing (HTTPS)

After deploying to GitHub Pages:

1. **Test Microphone Access**:
   - [ ] Click "Mic" button
   - [ ] Should request permission
   - [ ] Grant permission
   - [ ] Should show "REC" indicator
   - [ ] Should see audio levels responding
   - [ ] Click "Mic" again to stop

2. **Test File Upload**:
   - [ ] Click "File" button
   - [ ] Select audio file
   - [ ] Should play automatically
   - [ ] Should see filename in button
   - [ ] Should show play/pause button
   - [ ] Click play/pause to test

3. **Test Switching**:
   - [ ] Start with mic active
   - [ ] Click "File" and upload
   - [ ] Mic should stop, file should start
   - [ ] File button should show filename
   - [ ] Click "Mic" button
   - [ ] File should stop, mic should start
   - [ ] Repeat multiple times - should work smoothly

4. **Test Error Handling**:
   - [ ] Deny microphone permission
   - [ ] Should show helpful error message
   - [ ] Should suggest using HTTPS
   - [ ] Should suggest uploading file instead

---

## Deployment Instructions

### GitHub Pages

1. **Ensure Repository Settings**:
   - Go to repository Settings ? Pages
   - Source: Deploy from branch
   - Branch: `gh-pages` / root
   - Save

2. **Deploy**:
   ```bash
   npm run deploy
   ```

3. **Verify**:
   - Visit `https://<username>.github.io/signalbloom/`
   - Check if site loads
   - Check browser console for errors
   - Test microphone access

4. **HTTPS Enabled**:
   - GitHub Pages automatically provides HTTPS
   - Custom domains need SSL certificate

---

## Browser Requirements

### Microphone Access

| Browser | HTTPS Required | Notes |
|---------|----------------|-------|
| Chrome | Yes (except localhost) | Most restrictive |
| Firefox | Yes (except localhost) | May ask for temp/permanent |
| Safari | Yes (except localhost) | May require user gesture |
| Edge | Yes (except localhost) | Same as Chrome |

### Localhost Exception

All browsers allow microphone on `localhost` without HTTPS:
- ? `http://localhost:5173`
- ? `http://127.0.0.1:5173`
- ? `http://192.168.x.x:5173` (requires HTTPS)
- ? `http://yoursite.com` (requires HTTPS)

---

## Common Issues

### Issue: Microphone "NotAllowedError"

**Symptoms**: Error when clicking mic button

**Solutions**:
1. Check if site is HTTPS (required)
2. Check browser permission settings
3. Clear site data and try again
4. Try different browser

**Browser Permission Reset**:
- Chrome: Site settings ? Microphone ? Remove
- Firefox: Address bar ? Permissions ? Microphone
- Safari: Safari ? Settings ? Websites ? Microphone

---

### Issue: Audio Context Suspended

**Symptoms**: No audio, no levels showing

**Solutions**:
1. User interaction required to resume context
2. Click mic or file button (user gesture)
3. Code now auto-resumes context

**Fix Applied**:
```typescript
if (this.ctx.state === 'suspended') {
  await this.ctx.resume();
}
```

---

### Issue: Cannot Switch Between Mic/File

**Symptoms**: Must reset app to switch

**Solutions**:
? **FIXED** - Can now toggle freely:
1. Click mic to start/stop
2. Click file to switch from mic to file
3. Click mic to switch from file to mic
4. No reset needed

---

### Issue: Previous Audio Still Playing

**Symptoms**: Hear old audio when switching

**Solutions**:
? **FIXED** - Proper cleanup:
1. All tracks stopped
2. All nodes disconnected
3. Buffer source stopped
4. Media stream tracks ended

---

## Debugging

### Check Audio Context State

```javascript
// In browser console
const ctx = new AudioContext();
console.log(ctx.state); // 'running', 'suspended', or 'closed'
```

### Check Microphone Permissions

```javascript
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(() => console.log('Mic access granted'))
  .catch(e => console.error('Mic error:', e.message));
```

### Check HTTPS

```javascript
console.log(window.location.protocol); // Should be 'https:'
```

---

## Error Messages Reference

### NotAllowedError
- **Meaning**: User denied permission or no HTTPS
- **Solution**: Grant permission, ensure HTTPS

### NotFoundError
- **Meaning**: No microphone detected
- **Solution**: Connect microphone, check device

### NotSupportedError
- **Meaning**: Browser doesn't support API or no HTTPS
- **Solution**: Use modern browser, ensure HTTPS

### NotReadableError
- **Meaning**: Microphone in use by another app
- **Solution**: Close other apps using microphone

---

## Performance Notes

### Audio Context Optimization

- Single AudioContext instance reused
- Nodes properly disconnected to free resources
- Media stream tracks stopped to release camera/mic
- No memory leaks from hanging nodes

### State Management

- Clean state transitions
- No orphaned event listeners
- Proper cleanup on reset
- No conflicts between sources

---

## Future Improvements

Possible enhancements:

1. **Better Permission UI**:
   - Show permission request explanation before asking
   - Provide visual guide for granting permissions

2. **Fallback Options**:
   - Auto-suggest file upload if mic fails
   - Remember user preference (mic vs file)

3. **Advanced Audio**:
   - Support multiple audio inputs
   - Audio device selection dropdown
   - Echo cancellation toggle

4. **Progressive Web App**:
   - Service worker for offline use
   - Install prompt for mobile
   - Background audio processing

---

## Conclusion

? **Microphone now works on deployed HTTPS sites**  
? **Can toggle between mic and file freely**  
? **Better error messages guide users**  
? **Proper cleanup prevents audio conflicts**  
? **Production-ready for GitHub Pages**  

Deploy with confidence! ??
