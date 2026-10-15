import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { FirestoreService } from '../../firestore/firestore.service';

/**
 * Profile stored in Firestore at `admins/{uid}`.
 * The document ID must be the Firebase Auth UID of the admin account.
 */
export interface AdminProfile {
  uid: string;
  email: string | null;
  fullName: string;
  role: string;
  active: boolean;
}

/**
 * Protects backoffice endpoints:
 * 1. Verifies the Firebase ID token (Authorization: Bearer <token>)
 * 2. Requires an `admins/{uid}` document with `active !== false`
 */
@Injectable()
export class AdminAuthGuard implements CanActivate {
  private readonly logger = new Logger(AdminAuthGuard.name);

  constructor(private readonly firestoreService: FirestoreService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader: string | undefined = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Jeton d’authentification manquant');
    }

    const idToken = authHeader.slice('Bearer '.length);

    let decoded: { uid: string; email?: string };
    try {
      decoded = await this.firestoreService.auth.verifyIdToken(idToken);
    } catch (error: any) {
      throw new UnauthorizedException(`Jeton Firebase invalide: ${error.message}`);
    }

    const snap = await this.firestoreService.admins().doc(decoded.uid).get();
    const data = snap.data();

    if (!snap.exists || !data || data.active === false) {
      this.logger.warn(`Accès backoffice refusé pour ${decoded.email ?? decoded.uid}`);
      throw new ForbiddenException('Ce compte n’est pas autorisé à accéder au backoffice');
    }

    const admin: AdminProfile = {
      uid: decoded.uid,
      email: data.email ?? decoded.email ?? null,
      fullName: data.fullName ?? 'Administrateur',
      role: data.role ?? 'ADMIN',
      active: true,
    };
    request.admin = admin;
    return true;
  }
}
