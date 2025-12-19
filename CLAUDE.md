# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LG Branch Finder is a web application for locating LG Electronics stores across Egypt. It uses geolocation to find and sort branches by distance from the user's location. The site is deployed via GitHub Pages at `lg-branchs.store`.

## Architecture

### Frontend (Static Web App)
- **index.html**: Main HTML with RTL Arabic layout, accessibility features (ARIA labels, skip links, screen reader support), and Google Analytics integration
- **script.js**: Core application logic handling:
  - Geolocation via browser API with Haversine formula for distance calculation
  - Branch data fetching from JSON with localStorage caching (5-minute expiry)
  - Real-time search filtering across name, district, governorate, and address
  - Reverse geocoding via Nominatim (OpenStreetMap)
  - Intersection Observer for lazy loading animations
  - Keyboard shortcuts (Alt+S for search, Alt+R for refresh location)
- **style.css**: Modern CSS with custom properties, responsive grid layout, skeleton loading states, and reduced motion support

### Data Pipeline (Python)
- **script.py**: Extracts lat/lng coordinates from Google Maps URLs (handles short links, various URL formats) and outputs to `lg_branches_with_coords.json`
- **qr.py**: Generates QR codes with custom styling (gradients, logos, rounded corners) using the qrcode and Pillow libraries

### Data
- **lg_branches_with_coords.json**: Branch data (name, address, district, governorate, phone, maps_url, lat, lng) for 50+ LG locations in Egypt

## Commands

### Python Environment
```bash
pip install -r requirements.txt
```

### Extract Coordinates from Maps URLs
Requires `lg_branches.json` with `maps_url` fields:
```bash
python script.py
```

### Generate QR Codes
```bash
python qr.py
```

### Local Development
Serve the static files with any HTTP server:
```bash
python -m http.server 8000
```

## Key Implementation Details

- **Distance Calculation**: Uses Haversine formula for accurate great-circle distances
- **Caching Strategy**: localStorage with 5-minute TTL, automatic refresh on page visibility change
- **Error Handling**: Graceful degradation when geolocation is denied (shows all branches unsorted)
- **Search**: Debounced input (300ms) with Arabic text matching across multiple fields
- **RTL Support**: Full RTL layout with Arabic language throughout

## File Structure
```
lg-branchs/
├── index.html              # Main page
├── script.js               # Application logic
├── style.css               # Styles
├── lg_branches_with_coords.json  # Branch data
├── logo-lg.svg             # LG logo
├── script.py               # Coordinate extraction script
├── qr.py                   # QR code generator
├── requirements.txt        # Python dependencies
└── CNAME                   # Custom domain config
```
