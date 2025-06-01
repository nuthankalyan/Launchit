# Launchit API Server

A Node.js Express server with TypeScript for the Launchit application.

## Features

- Express web server
- TypeScript integration
- RESTful API endpoints
- Environment configuration
- Error handling
- Request logging
- Security middleware
- MVC-like structure

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm 6.x or higher

### Installation

1. Clone the repository
2. Navigate to the server directory:
   ```bash
   cd server
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file in the root directory (use `.env.example` as a template)

### Development

Start the development server:

```bash
npm run dev
```

This will:
- Compile TypeScript files in watch mode
- Run the server with nodemon for auto-restart

### Building for Production

```bash
npm run clean  # Clean previous builds
npm run build  # Build TypeScript files
npm start      # Start the server
```

## Project Structure

```
/server
  ├── /src                  # Source code
  │   ├── /controllers      # Route controllers
  │   ├── /middleware       # Custom middleware
  │   ├── /models           # Data models
  │   ├── /routes           # API routes
  │   ├── /services         # Business logic
  │   ├── /utils            # Utility functions
  │   └── index.ts          # Application entry point
  ├── /dist                 # Compiled output
  ├── .env                  # Environment variables
  ├── package.json          # Project dependencies
  └── tsconfig.json         # TypeScript configuration
```

## API Endpoints

### Health Check

- `GET /api/health` - Returns server health status

### Items API

- `GET /api/v1/items` - Get all items
- `GET /api/v1/items/:id` - Get item by ID
- `POST /api/v1/items` - Create a new item
- `PUT /api/v1/items/:id` - Update an item
- `DELETE /api/v1/items/:id` - Delete an item

## License

ISC
