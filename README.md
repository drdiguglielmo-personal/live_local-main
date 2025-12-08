# Live Local

A web application to discover and support local businesses in your community.

**Partners:** Drew DiGuglielmo and Nancy Norton

## Overview

Live Local helps users discover local businesses (cafes, restaurants, shops, services) and leave reviews. Business owners can submit their businesses to appear on the platform.

### Key Features

- **Browse Local Businesses**: Search and filter by category (Cafes, Lunch, Other) or keyword
- **Business Listings**: View businesses with photos, descriptions, addresses, and reviews
- **User Authentication**: Sign up, log in, manage your profile
- **Leave Reviews**: Rate and review businesses you've visited
- **Business Registration**: Submit your business to the platform with photos (via Cloudinary)
- **Mapbox Integration**: View businesses on an interactive map

## Tech Stack

- **Frontend**: React 19, react-router-dom v7.9.4, Create React App 5
- **Backend**: Parse (Back4App) v3.5.1
- **Image Hosting**: Cloudinary (free tier)
- **Testing**: Jest + React Testing Library
- **Styling**: CSS3 (global + component-scoped)
- **Deployment**: Netlify with automatic builds from main branch

## Getting Started

### Prerequisites

- Node.js (v14+) and npm
- Cloudinary account (free tier) for image uploads
- Back4App account with Parse database
- Mapbox account (optional, for map features)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the project root (see `.env.example` for template):

```bash
# Parse configuration (Back4App)
REACT_APP_PARSE_APP_ID=OzeGZnVRk2XBdXanHmKdT5ZGrQVcBBDFbcp1b5es
REACT_APP_PARSE_JS_KEY=WmAlAUboHcTJo3pNg72zZ5I3dQvofRQNRGvR2BDK
REACT_APP_PARSE_SERVER_URL=https://parseapi.back4app.com/

# Cloudinary configuration (for image uploads)
REACT_APP_CLOUDINARY_CLOUD_NAME=dezroqels
REACT_APP_CLOUDINARY_PRESET=live_local_uploads
```

For detailed Cloudinary setup, see [CLOUDINARY_SETUP.md](./CLOUDINARY_SETUP.md).

### Running Locally

```bash
npm start
```

Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) in your browser.

The page will auto-reload when you make changes.

### Running Tests

```bash
npm test
```

Launches Jest in interactive watch mode. Tests cover Parse integration, components, business logic, and authentication.

For test details, see [TESTING.md](./TESTING.md).

### Building for Production

```bash
npm run build
```

Builds the app for production to the `build` folder with optimization and minification.

### Deployment

The app is configured for automatic deployment to Netlify. When deploying:

1. Add environment variables in Netlify **Site settings → Build & Deploy → Environment**:
   - `REACT_APP_PARSE_APP_ID`
   - `REACT_APP_PARSE_JS_KEY`
   - `REACT_APP_PARSE_SERVER_URL`
   - `REACT_APP_CLOUDINARY_CLOUD_NAME`
   - `REACT_APP_CLOUDINARY_PRESET`

2. Push to `main` branch to trigger automatic build and deployment.

See [NETLIFY_SETUP.md](./NETLIFY_SETUP.md) for complete deployment guide.

## Project Structure

```
src/
  components/
    Auth/               # Authentication (login, register, protected routes)
    Application.js      # Business registration form
    BusinessCard.js     # Business tile component
    BusinessDetail.js   # Business detail view
    BusinessList.js     # Business listing with search
    Profile.js          # User profile component (uses Parse.User)
    Results.js          # Search results page
  models/
    Business.js         # Parse Business CRUD operations
    Review.js           # Parse Review CRUD operations
    Review.js           # Parse Review CRUD operations
  services/
    authService.js      # Authentication utilities
    businessService.js  # Business queries and normalization
    cloudinaryService.js # Cloudinary image upload
    parseService.js     # Parse SDK initialization
  App.js               # Main app routing
  App.css              # Global styles
```

## Features in Detail

### Image Uploads (Cloudinary)

Business images are uploaded directly to Cloudinary (free tier CDN). The app:
- Uploads images client-side via unsigned preset (no backend auth needed)
- Stores the Cloudinary secure_url in Parse
- Falls back to placeholder images if upload fails
- Automatically sanitizes filenames for safety

See [CLOUDINARY_SETUP.md](./CLOUDINARY_SETUP.md) for setup instructions.

### Testing

Comprehensive test suite (77 test cases) covering:
- Parse SDK integration
- Business model (CRUD, search, filtering)
- Application form validation and submission
- Authentication (signup, login, logout)

Run `npm test` to verify functionality.

See [TESTING.md](./TESTING.md) for detailed test documentation.

## Troubleshooting

### Images Not Uploading

1. Verify Cloudinary env vars are set in `.env.local` or Netlify
2. Check that your Cloudinary preset is set to "Unsigned" mode
3. See [CLOUDINARY_SETUP.md](./CLOUDINARY_SETUP.md) for full setup

### Parse Connection Errors

1. Verify Back4App credentials in `.env.local`
2. Check that Parse classes (Business, Profile, Review) exist in Back4App dashboard
3. Ensure Class-Level Permissions allow client creation/reads

### Tests Failing

Run `npm test` to see detailed error messages. Most failures are due to:
- Missing env vars in setupTests.js (mock values)
- Parse SDK not initialized (check parseService.js imports)
- Component dependencies not installed (run `npm install`)

## Documentation

- [CHANGELOG.md](./CHANGELOG.md) - Version history and feature updates

## Contributing

To contribute:
1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add your feature'`
3. Push to GitHub: `git push origin feature/your-feature`
4. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Support

For issues or questions, please open a GitHub issue or contact the maintainers.

---

**Happy exploring! Discover and support local businesses in your community. 🚀**
