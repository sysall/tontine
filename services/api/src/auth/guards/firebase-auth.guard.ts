import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { FirestoreService } from '../../firestore/firestore.service';
import { UserDocument } from '@tontine/types';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private readonly firestoreService: FirestoreService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
      const decodedToken = await this.firestoreService.auth.verifyIdToken(idToken);
      const userDocRef = this.firestoreService.users().doc(decodedToken.uid);
      const userSnapshot = await userDocRef.get();

      if (!userSnapshot.exists) {
        throw new UnauthorizedException('User profile not found in database');
      }

      const user = userSnapshot.data() as UserDocument;
      request.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException(`Invalid Firebase token: ${error.message}`);
    }
  }
}
