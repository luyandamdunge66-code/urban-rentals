import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { testDbConnection } from './config/db';
import authRoutes from './routes/authRoutes';
import ownerRoutes from './routes/ownerRoutes';
import propertyRoutes from './routes/propertyRoutes';
import favoriteRoutes from './routes/favoriteRoutes';
import viewingRoutes from './routes/viewingRoutes';
import messageRoutes from './routes/messageRoutes';
import applicationRoutes from './routes/applicationRoutes';
import analyticsRoutes from './routes/analyticsRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure local uploads folder exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve saved photos statically
app.use('/uploads', express.static(uploadsDir));

// Health Check Route
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    message: 'Urban Rentals API is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

// Authentication Routes
app.use('/api/v1/auth', authRoutes);

// Owner Verification & Admin Approval Routes
app.use('/api/v1/owners', ownerRoutes);

// Property Listings & Management Routes
app.use('/api/v1/properties', propertyRoutes);
app.use('/api/v1/favorites', favoriteRoutes);
app.use('/api/v1/viewings', viewingRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/analytics', analyticsRoutes);



// Start Server and Test DB Connection
const startServer = async () => {
  await testDbConnection();
  app.listen(PORT, () => {
    console.log(`🚀 Urban Rentals server running on http://localhost:${PORT}`);
  });
};

startServer();