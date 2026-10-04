import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirestoreService implements OnModuleInit {
  private readonly logger = new Logger(FirestoreService.name);
  private firestoreDb: admin.firestore.Firestore;
  private firebaseAuth: admin.auth.Auth;

  onModuleInit() {
    if (!admin.apps.length) {
      const projectId = process.env.FIREBASE_PROJECT_ID;
      if (!projectId) {
        this.logger.error('FIREBASE_PROJECT_ID non défini dans le fichier .env !');
      }
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY
        ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        : undefined;

      if (clientEmail && privateKey) {
        try {
          admin.initializeApp({
            credential: admin.credential.cert({
              projectId,
              clientEmail,
              privateKey,
            }),
          });
          this.logger.log(`Initialized Firebase Admin SDK with Service Account for project ${projectId}`);
        } catch (error: any) {
          this.logger.warn(`Clé privée Firebase invalide dans .env (${error.message}). Bascule sur l'initialisation standard.`);
          admin.initializeApp({
            projectId,
          });
        }
      } else {
        admin.initializeApp({
          projectId,
        });
        this.logger.warn(`Initialized Firebase Admin SDK with default credentials for project ${projectId}`);
      }
    }

    this.firestoreDb = admin.firestore();
    try {
      this.firestoreDb.settings({ ignoreUndefinedProperties: true });
    } catch (e) {
      // Settings already applied or ignored
    }
    this.firebaseAuth = admin.auth();
  }

  get db(): admin.firestore.Firestore {
    return this.firestoreDb;
  }

  get auth(): admin.auth.Auth {
    return this.firebaseAuth;
  }

  // Typed collection getters
  users() {
    return this.firestoreDb.collection('users');
  }

  eventNatts() {
    return this.firestoreDb.collection('event_natts');
  }

  userNatts() {
    return this.firestoreDb.collection('user_natts');
  }

  payments() {
    return this.firestoreDb.collection('natt_payments');
  }

  transactions() {
    return this.firestoreDb.collection('transactions');
  }

  treasury() {
    return this.firestoreDb.collection('treasury');
  }

  kyc() {
    return this.firestoreDb.collection('kyc_documents');
  }
}
