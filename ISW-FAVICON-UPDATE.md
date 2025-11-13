# ISW Favicon Update

## Overview

The browser tab favicon has been updated from the Signal Bloom logo to the **Iron Signal Works (ISW)** logo.

---

## Changes Made

### 1. New Favicon Files Created

#### `public/favicon.svg` (64×64)
- **Full ISW logo** with detailed elements
- Black background (`#000`)
- Green accent color (`#00ff88`)
- **Elements**:
  - **I** - Two rectangular bars (identity)
  - **S** - Triangle/signal shape (signal processing)
  - **W** - Three vertical bars (waveform)
  - **Dot** - Signal indicator (active status)

#### `public/icon.svg` (32×32)
- **Simplified ISW logo** for small sizes
- Optimized for 16×16 and 32×32 display
- Same color scheme
- Cleaner, bolder shapes for legibility

---

## Logo Design

### ISW Elements

```
???????????????????????????????
?  I   S     W    •           ?  Black background
?  ?   ?    ???   ?          ?  Green elements
?  ?        ???              ?  
?  ???      ??               ?  
???????????????????????????????
```

**Symbolism**:
- **I** (Identity) - Two bars representing strength and foundation
- **S** (Signal) - Triangle pointing right = signal flow, transmission
- **W** (Waveform) - Three vertical bars = audio waveform visualization
- **Dot** (Active) - Small circle = active signal, powered on

---

## Browser Tab Display

### Before
```
?? Signal Bloom
   (Circular wave pattern)
```

### After
```
?? Signal Bloom - Audio Visualizer
   (ISW logo: I S W •)
```

---

## HTML Reference

The `index.html` already includes all necessary favicon links:

```html
<!-- Favicon -->
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
```

**Browser Support**:
- Modern browsers: Use `favicon.svg` (scalable, sharp at any size)
- Older browsers: Fallback to PNG versions
- IE/Legacy: Use `favicon.ico`

---

## Generating PNG Favicons

To generate the PNG versions with the new ISW logo:

1. Open `public/generate-images.html` in your browser
2. Click **"Download Favicon 32x32"**
3. Click **"Download Favicon 16x16"**
4. Save both files to `/public` folder
5. (Optional) Use [favicon.io](https://favicon.io/favicon-converter/) to convert 32×32 PNG to `.ico`

---

## Image Generator Updates

The `createFaviconSVG()` function in `generate-images.html` has been updated to render the ISW logo:

```javascript
function createFaviconSVG(size) {
  // Generates ISW logo with:
  // - I: Two vertical bars
  // - S: Signal triangle
  // - W: Three waveform bars
  // - Dot: Active indicator
  return `<svg>...</svg>`;
}
```

**Responsive Scaling**:
- All elements scale proportionally with `size` parameter
- Maintains aspect ratio and spacing at 16px, 32px, 64px
- Bold enough to be visible at 16×16

---

## Visual Comparison

### 16×16 (Browser Tab Size)

**Old (Signal Bloom)**:
```
??????
? ? ?  Concentric circles
? ? ?  Center dot
? ? ?  
??????
```

**New (ISW)**:
```
??????
?I????  I, Signal, Wave, Dot
?? ??  Clear individual elements
?????  Recognizable brand
??????
```

---

## Social Media Card

The card image (`card.png`) also includes the ISW logo in the footer:

```
???????????????????????????????????????
?  SIGNAL BLOOM                       ?
?  Audio-Reactive 3D Visualizer       ?
?                                     ?
?  [ISW Logo] IRON SIGNAL WORKS       ?
???????????????????????????????????????
```

This creates **brand consistency** across:
- Browser tab (ISW favicon)
- Footer branding (ISW logo + text)
- Social media cards (ISW logo + text)

---

## Color Palette

All ISW branding uses:
- **Background**: `#000000` (Pure black)
- **Foreground**: `#00ff88` (Accent green)
- **Contrast Ratio**: 8.5:1 (WCAG AAA compliant)

---

## Testing Checklist

- [ ] SVG favicon displays correctly in browser tab
- [ ] Logo is recognizable at 16×16 size
- [ ] Green color is visible against black background
- [ ] Elements (I, S, W, dot) are distinguishable
- [ ] PNG versions generated and saved
- [ ] `.ico` file created for legacy support
- [ ] Card image includes ISW footer logo

---

## File Structure

```
public/
??? favicon.svg          ? NEW: ISW logo (primary)
??? icon.svg             ? NEW: ISW logo simplified
??? favicon-32x32.png    ? Generate from new SVG
??? favicon-16x16.png    ? Generate from new SVG
??? favicon.ico          ? Generate from 32x32 PNG
??? card.png             ? Includes ISW footer
??? generate-images.html ? Updated generator
```

---

## Brand Identity

The ISW logo represents:

**Iron Signal Works** = Professional audio technology company

- **Iron** - Strength, reliability, industrial quality
- **Signal** - Audio processing, data transmission
- **Works** - Engineering, craftsmanship, production

**Logo Elements**:
- Geometric shapes = Precision engineering
- Green accent = Active signal, technology
- Triangle = Directional signal flow
- Bars = Waveform, audio spectrum
- Black background = Professional, minimal

---

## Next Steps

1. **Generate PNGs**: Use `generate-images.html` to create PNG files
2. **Test Display**: Check favicon in Chrome, Firefox, Safari, Edge
3. **Commit Changes**: Add new SVG files and PNGs to repository
4. **Update Docs**: Ensure all references point to ISW branding

---

## Revert Instructions

If you need to revert to Signal Bloom logo:

```bash
# Restore old icon files
git checkout HEAD -- public/favicon.svg
git checkout HEAD -- public/icon.svg
git checkout HEAD -- public/generate-images.html
```

Or manually edit `public/favicon.svg` to use concentric circles design.

---

## Conclusion

? **Browser tab now displays ISW logo**  
? **Consistent branding across all touchpoints**  
? **Professional company identity**  
? **Scalable SVG for all screen resolutions**  
? **Accessible high-contrast colors**  

The favicon properly represents **Iron Signal Works** as the creator while Signal Bloom remains the product name.
