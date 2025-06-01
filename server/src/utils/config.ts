// Server configuration settings
export const config = {
  // Server settings
  server: {
    port: Number(process.env.PORT) || 5000,
    nodeEnv: process.env.NODE_ENV || 'development'
  },
    // Database settings
  database: {
    uri: process.env.DATABASE_URL || 'postgresql://nuthan:AgeMQtnJQ6h0OBEixaBd4A@nuthancluster-11900.j77.aws-ap-south-1.cockroachlabs.cloud:26257/Launchit?sslmode=verify-full'
  },
  
  // JWT settings
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-this-in-production',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  } as const,
  
  // Cors settings
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
  },
  
  // API settings
  api: {
    prefix: '/api'
  },
  // Google OAuth settings
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '93207605897-f25143b641e0daceb50c58.apps.googleusercontent.com',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
  },

  // Gemini AI settings
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || 'AIzaSyAHUFfOA4lildkHmB73fCov6fD-MKjdq3M'
  }
};

// Export a function to check if we're in production
export const isProduction = (): boolean => config.server.nodeEnv === 'production';

// Export a function to check if we're in development
export const isDevelopment = (): boolean => config.server.nodeEnv === 'development';

// Default export to satisfy module requirements
export default { config, isProduction, isDevelopment };
