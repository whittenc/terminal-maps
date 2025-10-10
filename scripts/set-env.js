const fs = require('fs');
const path = require('path');

// Get the Google Maps API key from environment variables
const googleMapsApiKey =
  process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyA7JrzE8P6BjwqvniwTu42QyUQFQz8hcE8';

// Path to the environment.prod.ts file
const envPath = path.join(__dirname, '../src/environments/environment.prod.ts');

// Generate the environment file content
const envContent = `export const environment = {
  production: true,
  googleMapsApiKey: '${googleMapsApiKey}'
};
`;

// Write the file
fs.writeFileSync(envPath, envContent, 'utf8');

console.log('Environment file generated successfully!');
console.log(`API Key: ${googleMapsApiKey.substring(0, 10)}...`);
