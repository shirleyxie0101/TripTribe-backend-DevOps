import AdminJS from 'adminjs';
import * as AdminJSExpress from '@adminjs/express';
import express from 'express';
import mongoose from 'mongoose';
import * as AdminJSMongoose from '@adminjs/mongoose';
import MongoStore from 'connect-mongo';
import { User } from './entity/user.entity.js';
import { Photo } from './entity/photo.entity.js';
import { Review } from './entity/review.entity.js';
import { Restaurant } from './entity/restaurant.entity.js';
import { Attraction } from './entity/attraction.entity.js';
import dotenv from 'dotenv';

if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: '.env.development' });
} else {
  dotenv.config();
}

const PORT = process.env.PORT || 3000;

const DEFAULT_ADMIN = {
  email: 'admin@triptribe.com',
  password: 'password',
};

AdminJS.registerAdapter({
  Resource: AdminJSMongoose.Resource,
  Database: AdminJSMongoose.Database,
});

const authenticate = async (email: string, password: string) => {
  if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
    // console.log('Login worked!');
    return Promise.resolve(DEFAULT_ADMIN);
  }
  return null;
};

const start = async () => {
  const app = express();
  const dbConnectionString = process.env.DATABASE_CONNECTION_URI as string;
  await mongoose.connect(dbConnectionString);

  const sessionStore = MongoStore.create({
    mongoUrl: dbConnectionString,
    collectionName: 'session',
    stringify: false,
    autoRemove: 'interval',
    autoRemoveInterval: 1,
  });
  const adminOptions = {
    resources: [User, Photo, Review, Restaurant, Attraction],
    rootPath: '/admin',
  };

  const admin = new AdminJS(adminOptions);

  const adminRouter = AdminJSExpress.default.buildAuthenticatedRouter(
    admin,
    {
      authenticate,
      cookieName: 'adminjs',
      cookiePassword: 'sessionsecret',
    },
    null,
    {
      store: sessionStore,
      resave: true,
      saveUninitialized: true,
      secret: 'sessionsecret',
      cookie: {
        httpOnly: process.env.NODE_ENV === 'production',
        secure: process.env.NODE_ENV === 'production',
      },
      name: 'adminjs',
    }
  );
  app.use(admin.options.rootPath, adminRouter);

  app.listen(PORT, () => {
    console.log(`AdminJS started on http://localhost:${PORT}${admin.options.rootPath}`);
  });
};

start();
