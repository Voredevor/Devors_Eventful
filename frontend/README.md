# Eventful Frontend

Event Ticketing Platform Frontend built with React, TypeScript, Vite, and Tailwind CSS.

## Features

- ✅ User authentication (JWT) with role-based UI
- ✅ Browse and search events
- ✅ Event creation and management (creators)
- ✅ Ticket purchase and management
- ✅ QR code display and verification
- ✅ Payment integration with Paystack
- ✅ Event notifications and reminders
- ✅ Event sharing on social media
- ✅ Analytics dashboard (for creators)
- ✅ Responsive design (mobile-first)

## Tech Stack

- **Frontend Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6+
- **State Management**: Zustand
- **API Client**: Axios
- **Notifications**: React Hot Toast
- **Icons**: React Icons
- **QR Code**: qrcode.react
- **Charts**: Recharts
- **Testing**: Vitest & React Testing Library

## Prerequisites

- Node.js (v18+)
- npm or yarn

## Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your configuration
```

## Development

### Start Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm preview
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm run test:coverage
```

## Linting & Formatting

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run typecheck
```

## Project Structure

```
src/
├── components/      # Reusable React components
│   ├── Layout/
│   ├── Auth/
│   ├── Events/
│   ├── Forms/
│   └── Common/
├── pages/           # Full-page components for routes
├── services/        # API service clients
├── hooks/           # Custom React hooks
├── stores/          # Zustand state stores
├── context/         # React Context providers
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── styles/          # Global CSS and Tailwind setup
└── main.tsx         # Application entry point
```

## Key Pages

- **Login Page** (`/login`) - User authentication
- **Register Page** (`/register`) - New user registration
- **Home Page** (`/`) - Browse all events
- **Event Detail** (`/events/:eventId`) - Event information and ticket purchase
- **Checkout** (`/checkout/:eventId`) - Payment page
- **Dashboard** (`/dashboard`) - Creator/Eventee dashboard
- **My Tickets** (`/my-tickets`) - Eventee's purchased tickets
- **My Events** (`/my-events`) - Creator's published events
- **Analytics** (`/analytics`) - Creator's event analytics

## Environment Variables

```
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=Eventful
VITE_APP_VERSION=1.0.0
```

## API Integration

The frontend automatically handles:
- JWT token management
- Request/response interceptors
- Error handling and user feedback
- Automatic logout on 401 responses

## Styling

Uses Tailwind CSS for utility-based styling with custom components in `src/styles/index.css`:
- `.btn-*` - Button variants
- `.card` - Card containers
- `.badge-*` - Badge/tag components
- `.input` - Form input styling

## State Management

- **Auth State**: `useAuthStore` (Zustand)
- **Global Auth**: Auto-loads from localStorage on app mount
- **Component State**: Local React state with hooks

## Deployment

### Vercel

```bash
# Push to GitHub, then:
# 1. Connect repo in Vercel dashboard
# 2. Set environment variables
# 3. Deploy
```

### Netlify

```bash
npm run build
# Deploy the dist folder to Netlify
```

### Docker

```bash
docker build -t eventful-frontend .
docker run -p 3000:80 eventful-frontend
```

## Contributing

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open a Pull Request

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
