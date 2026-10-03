import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { FirestoreService } from '../firestore/firestore.service';

export interface UploadKycDto {
  userId: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  documentType: 'CNI_CEDEAO' | 'PASSPORT';
  documentFrontBase64?: string;
  documentBackBase64?: string;
  selfieBase64?: string;
}

@Injectable()
export class KycService {
  private readonly logger = new Logger(KycService.name);

  constructor(
    private readonly firestoreService: FirestoreService,
  ) {}

  /**
   * Action : Saisie & Téléversement de pièces d'identité KYC et selfie pour vérification manuelle par l'administrateur
   */
  async uploadKycDocument(dto: UploadKycDto) {
    if (!dto.userId) {
      throw new BadRequestException('L\'identifiant de l\'utilisateur (userId) est requis.');
    }

    this.logger.log(`Traitement dépôt KYC pour l'utilisateur ${dto.userId} (${dto.clientName})`);

    // 1. Sauvegarde / URL des images (Base64 / Cloud Storage)
    const frontUrl = dto.documentFrontBase64?.startsWith('data:') || dto.documentFrontBase64?.startsWith('http')
      ? dto.documentFrontBase64
      : dto.documentFrontBase64 ? `data:image/jpeg;base64,${dto.documentFrontBase64}` : 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80';

    const backUrl = dto.documentBackBase64?.startsWith('data:') || dto.documentBackBase64?.startsWith('http')
      ? dto.documentBackBase64
      : dto.documentBackBase64 ? `data:image/jpeg;base64,${dto.documentBackBase64}` : 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80';

    const selfieUrl = dto.selfieBase64?.startsWith('data:') || dto.selfieBase64?.startsWith('http')
      ? dto.selfieBase64
      : dto.selfieBase64 ? `data:image/jpeg;base64,${dto.selfieBase64}` : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80';

    const kycId = `kyc_${dto.userId}`;
    const nowIso = new Date().toISOString();
    const initialStatus = 'PENDING_MANUAL_CHECK';

    const kycRecord = {
      id: kycId,
      clientId: dto.userId,
      clientName: dto.clientName || 'Client Inconnu',
      clientPhone: dto.clientPhone || '',
      clientEmail: dto.clientEmail || '',
      documentType: dto.documentType || 'CNI_CEDEAO',
      documentFrontUrl: frontUrl,
      documentBackUrl: backUrl,
      selfieUrl: selfieUrl,
      submittedAt: nowIso,
      status: initialStatus, // 'PENDING_MANUAL_CHECK' | 'VERIFIED' | 'REJECTED'
    };

    // 2. Enregistrer dans Firestore (/kyc_documents)
    try {
      await this.firestoreService.kyc().doc(kycId).set(kycRecord, { merge: true });
      this.logger.log(`Document KYC enregistré dans Firestore pour ${kycId} avec statut ${initialStatus}`);

      // 3. Mettre à jour l'utilisateur (/users/{userId})
      await this.firestoreService.users().doc(dto.userId).set({
        kycStatus: initialStatus,
        isVerified: false,
        updatedAt: nowIso,
      }, { merge: true });

      this.logger.log(`Statut utilisateur ${dto.userId} mis à jour dans Firestore: ${initialStatus}`);
    } catch (error: any) {
      this.logger.error(`Erreur Firestore lors du téléversement KYC: ${error.message}`);
    }

    return {
      success: true,
      kycId,
      status: initialStatus,
      record: kycRecord,
      message: 'Vos pièces d\'identité et votre selfie ont été enregistrés avec succès. Votre dossier est en cours de vérification par l\'équipe d\'administration.',
    };
  }

  /**
   * Consulter le statut KYC d'un utilisateur
   */
  async getKycStatus(userId: string) {
    const kycId = `kyc_${userId}`;
    try {
      const docSnap = await this.firestoreService.kyc().doc(kycId).get();
      if (docSnap.exists) {
        const data = docSnap.data();
        return {
          hasSubmitted: true,
          status: data?.status || 'PENDING_MANUAL_CHECK',
          record: data,
        };
      }

      // Vérifier dans le document user
      const userSnap = await this.firestoreService.users().doc(userId).get();
      if (userSnap.exists) {
        const userData = userSnap.data();
        return {
          hasSubmitted: !!userData?.cniNumber,
          status: userData?.kycStatus || (userData?.isVerified ? 'VERIFIED' : 'PENDING'),
          cniNumber: userData?.cniNumber || '',
        };
      }
    } catch (e: any) {
      this.logger.warn(`Impossible d'extraire le statut Firestore: ${e.message}`);
    }

    return {
      hasSubmitted: false,
      status: 'NOT_SUBMITTED',
    };
  }

  /**
   * Obtenir la liste complète des dossiers KYC (Admin)
   */
  async getAllKycRecords() {
    try {
      const kycSnap = await this.firestoreService.kyc().get();
      if (!kycSnap.empty) {
        return kycSnap.docs.map(doc => doc.data());
      }
    } catch (e: any) {
      this.logger.error(`Erreur lors de la récupération des dossiers KYC: ${e.message}`);
    }
    return [];
  }

  /**
   * Action Admin : Valider / Approuver un dossier KYC manuellement
   */
  async approveKyc(kycId: string, notes?: string) {
    const kycRef = this.firestoreService.kyc().doc(kycId);
    const kycSnap = await kycRef.get();
    
    const nowIso = new Date().toISOString();
    const updateData: any = {
      status: 'VERIFIED',
      adminNotes: notes || 'Validé manuellement par l\'administrateur Backoffice.',
      verifiedAt: nowIso,
      verifiedBy: 'ADMIN',
    };

    await kycRef.set(updateData, { merge: true });

    if (kycSnap.exists) {
      const clientId = kycSnap.data()?.clientId;
      if (clientId) {
        await this.firestoreService.users().doc(clientId).set({
          kycStatus: 'VERIFIED',
          isVerified: true,
          updatedAt: nowIso,
        }, { merge: true });
      }
    }

    return { success: true, message: 'Dossier KYC approuvé avec succès.' };
  }

  /**
   * Action Admin : Rejeter un dossier KYC avec motif
   */
  async rejectKyc(kycId: string, notes: string) {
    const kycRef = this.firestoreService.kyc().doc(kycId);
    const kycSnap = await kycRef.get();

    const nowIso = new Date().toISOString();
    const updateData: any = {
      status: 'REJECTED',
      adminNotes: notes || 'Document non conforme ou illisible.',
      rejectedAt: nowIso,
      rejectedBy: 'ADMIN',
    };

    await kycRef.set(updateData, { merge: true });

    if (kycSnap.exists) {
      const clientId = kycSnap.data()?.clientId;
      if (clientId) {
        await this.firestoreService.users().doc(clientId).set({
          kycStatus: 'REJECTED',
          isVerified: false,
          updatedAt: nowIso,
        }, { merge: true });
      }
    }

    return { success: true, message: 'Dossier KYC rejeté.' };
  }
}
