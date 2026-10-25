import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { FirestoreService } from '../../firestore/firestore.service';
import { findUserProfile, AuthenticatedUser } from '../user-identity';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private readonly firestoreService: FirestoreService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader: string | undefined = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Jeton d’authentification manquant ou invalide (Bearer token requis)');
    }

    const idToken = authHeader.slice('Bearer '.length).trim();

    try {
      const decodedToken = await this.firestoreService.auth.verifyIdToken(idToken);
      const profile = await findUserProfile(
        this.firestoreService,
        decodedToken.uid,
        decodedToken.phone_number || null,
      );

      if (!profile) {
        throw new UnauthorizedException('Profil utilisateur introuvable dans la base de données');
      }

      const authUser: AuthenticatedUser = {
        ...profile.data,
        docId: profile.ref.id,
        firebaseUid: decodedToken.uid,
      };

      request.user = authUser;
      return true;
    } catch (error: any) {
      throw new UnauthorizedException(`Jeton Firebase invalide: ${error.message}`);
    }
  }
}

