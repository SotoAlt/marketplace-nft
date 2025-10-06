# Favicon Design Guide

## Overview
Create a favicon from the provided blue flan image for the remi NFT marketplace.

## Required Files & Specifications

### Primary Favicon (Required)
- **File**: `favicon.ico`
- **Location**: Replace `/src/app/favicon.ico`
- **Sizes**: Multi-size ICO containing:
  - 16x16 pixels
  - 32x32 pixels
  - 48x48 pixels
- **Format**: ICO file format
- **Color**: 24-bit or 32-bit with transparency support

### Additional Formats (Optional but Recommended)

#### PNG Favicons
- `favicon-16x16.png` (16×16px)
- `favicon-32x32.png` (32×32px)
- **Location**: `/public/` folder

#### Apple Touch Icon
- `apple-touch-icon.png` (180×180px)
- **Location**: `/public/` folder
- **Purpose**: iOS Safari bookmark icon

#### Android Chrome Icons
- `android-chrome-192x192.png` (192×192px)
- `android-chrome-512x512.png` (512×512px)
- **Location**: `/public/` folder
- **Purpose**: Android PWA icons

## Design Requirements

### Source Material
- **Base Image**: Blue flan image provided
- **Style**: Clean, simple design that works at small sizes
- **Background**: Should work on both light and dark browser themes

### Technical Specifications
- **Aspect Ratio**: 1:1 (square)
- **Color Depth**: 24-bit minimum, 32-bit preferred (for transparency)
- **File Size**: Optimized for web (under 50KB for ICO)
- **Transparency**: Recommended for clean edges

### Design Guidelines
1. **Simplicity**: Must be recognizable at 16x16 pixels
2. **Contrast**: Ensure good visibility in browser tabs
3. **Brand Consistency**: Maintain blue color theme from source image
4. **Cross-Platform**: Should look good on Windows, Mac, mobile browsers

## Browser Compatibility
- **Chrome**: Supports ICO, PNG
- **Firefox**: Supports ICO, PNG
- **Safari**: Supports ICO, PNG, Apple Touch Icon
- **Edge**: Supports ICO, PNG
- **Mobile**: Uses various sizes depending on context

## Delivery Instructions

### Minimum Delivery
Just provide the **favicon.ico** file and I'll handle the replacement.

### Complete Delivery (Preferred)
Provide all formats listed above for full cross-platform support.

## File Paths for Implementation
```
/src/app/favicon.ico (replace existing)
/public/favicon-16x16.png (new)
/public/favicon-32x32.png (new)
/public/apple-touch-icon.png (new)
/public/android-chrome-192x192.png (new)
/public/android-chrome-512x512.png (new)
```

## Testing Checklist
After delivery, the favicon will be tested on:
- [ ] Chrome desktop
- [ ] Firefox desktop  
- [ ] Safari desktop
- [ ] Mobile browsers
- [ ] Vercel deployment

## Notes
- Current favicon exists and will be replaced
- New favicon should match the remi brand aesthetic
- Optimized files ensure fast loading on Vercel