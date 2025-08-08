# Terminal & Shipping Tracker - Angular Material App

A modern Angular Material application for tracking terminal locations and daily shipping destinations, designed to replace Google My Maps with enhanced functionality.

## Features

- **Interactive Google Maps** with custom markers
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

1. Get a Google Maps JavaScript API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the following APIs:
   - Maps JavaScript API
   - Places API (optional, for address autocomplete)

3. Add the API key to your `src/index.html`:
```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Terminal Maps</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  <link rel="preconnect" href="https://fonts.gstatic.com">
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY_HERE"></script>
</head>
<body class="mat-typography">
  <app-root></app-root>
</body>
</html>
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
ng serve --host 0.0.0.0 --port 4200
```

### Production
```bash
ng build --prod
# Deploy the dist/ folder to your web server
```

### Environment Variables
For production deployment, consider using environment files for API keys:

```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  googleMapsApiKey: 'YOUR_PRODUCTION_API_KEY'
};
```

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
