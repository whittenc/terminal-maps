# Terminal & Shipping Tracker - Angular Material App

A modern Angular Material application for tracking terminal locations and daily shipping destinations, designed to replace Google My Maps with enhanced functionality.

## Features

- **Interactive Google Maps** with custom markers
- **Location Search & Autocomplete** - Search for any location with smart suggestions
- **Layer Management** - Toggle terminals and shipping destinations
- **Terminal Filtering** - Filter shipping locations by terminal
- **Responsive Design** with Material Design UI
- **KML Import/Export** - Import your existing Google My Maps data
- **Real-time Statistics** - View summary data and counts
- **Detailed Info Windows** - Rich information display for each location

## Quick Start

### 1. Prerequisites
```bash
# Install Node.js (16+ recommended)
# Install Angular CLI
npm install -g @angular/cli
```

### 2. Project Setup
```bash
# Create new Angular project
ng new terminal-maps --routing=true --style=scss

# Navigate to project directory
cd terminal-maps

# Install dependencies
npm install @angular/material @angular/cdk @angular/animations
npm install @angular/google-maps
npm install @types/google.maps
```

### 3. Configure Angular Material
```bash
# Add Angular Material
ng add @angular/material
# Choose Indigo/Pink theme
# Set up global typography styles: Yes
# Include browser animations: Yes
```

### 4. Google Maps API Setup

**See [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md) for detailed configuration instructions.**

Quick setup:
1. Get a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Maps JavaScript API
3. Add your API key to `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  googleMapsApiKey: 'YOUR_API_KEY_HERE'
};
```

### 5. File Structure
Replace the generated files with the provided code:

```
src/
├── app/
│   ├── app.component.ts
│   ├── app.component.html
│   ├── app.component.scss
│   ├── app.module.ts
│   └── app.component.spec.ts
├── index.html
├── main.ts
└── styles.scss
```

### 6. Global Styles (src/styles.scss)
```scss
@import '@angular/material/prebuilt-themes/indigo-pink.css';

html, body { height: 100%; }
body { margin: 0; font-family: Roboto, "Helvetica Neue", sans-serif; }

// Custom snackbar styles
.terminal-snackbar {
  background-color: #c2185b !important;
  color: white !important;
}

.shipping-snackbar {
  background-color: #1a237e !important;
  color: white !important;
}
```

## Usage

### Running the Application
```bash
# Development server
ng serve

# Production build
ng build --prod
```

### Importing Your KML Data

1. Export your Google My Maps data:
   - Open your Google My Maps
   - Click the 3-dot menu next to your map title
   - Select "Export to KML/KMZ"
   - Choose KML format and download

2. Import into the app:
   - Click the upload icon in the toolbar
   - Select your KML file
   - The app will automatically parse terminals and shipping locations

### Features Overview

#### Layer Controls
- **Terminal Locations**: Shows all terminal facilities with detailed information
- **Daily Shipping Destinations**: Shows where inventory is being shipped

#### Terminal Filtering
- Select a specific terminal to view only its shipping destinations
- Clear selection to view all shipping locations

#### Interactive Elements
- Click terminals to see detailed facility information
- Click shipping locations to see shipment counts and source terminal
- Use toolbar buttons to center map on different data types

#### Data Management
- Export current data as JSON for backup
- Import KML files from Google My Maps
- Real-time statistics in the sidebar

## Customization

### Adding New Data Fields
To add new fields to terminals or shipping locations:

1. Update the TypeScript interfaces in `app.component.ts`
2. Modify the KML parsing logic in the `parseKML()` method
3. Update the info window templates in `app.component.html`
4. Add new fields to the sidebar display

### Styling
- Modify colors in the `layers` array in `app.component.ts`
- Update CSS classes in `app.component.scss`
- Change Material theme in `styles.scss`

### Map Styles
- Add new map styles to the `mapStyles` array
- Include custom Google Maps styling JSON

## API Reference

### Main Components

#### Terminal Interface
```typescript
interface Terminal {
  id: string;
  name: string;
  terminalNumber: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  manager: string;
  drivers: number;
  shop: number;
  other: number;
  total: number;
  opened: string;
  shopBays: string;
  facilityType: string;
  primaryShippers: string;
  position: google.maps.LatLngLiteral;
}
```

#### ShippingLocation Interface
```typescript
interface ShippingLocation {
  id: string;
  name: string;
  terminalSource: string;
  city: string;
  state: string;
  count: number;
  position: google.maps.LatLngLiteral;
}
```

## Deployment

### Development
```bash
ng serve
# App runs on http://localhost:4200
```

### Production Build
```bash
ng build
# Creates production files in dist/terminal-maps/
```

### Netlify Deployment

**See [NETLIFY_SETUP.md](NETLIFY_SETUP.md) for complete deployment guide.**

Quick steps:
1. Set `GOOGLE_MAPS_API_KEY` environment variable in Netlify
2. Push to GitHub
3. Netlify auto-deploys with the configured `netlify.toml`

### Environment Configuration

**See [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md) for detailed environment setup.**

The application uses environment files for configuration:
- Development: `src/environments/environment.ts`
- Production: `src/environments/environment.prod.ts` (auto-configured by Netlify)

## Troubleshooting

### Common Issues

1. **Google Maps not loading**: Check API key and enabled APIs
2. **KML import errors**: Ensure KML file follows the expected structure
3. **Marker clustering**: For large datasets, consider implementing marker clustering
4. **Performance**: Use OnPush change detection for large marker sets

### Browser Support
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
