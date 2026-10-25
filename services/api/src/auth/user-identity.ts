import type { DocumentReference } from 'firebase-admin/firestore';
import { UserDocument } from '@tontine/types';
import { FirestoreService } from '../firestore/firestore.service';

/**
 * Identity attached to `request.user` by FirebaseAuthGuard.
 * It is ALWAYS derived from a verified Firebase ID token, never from the request body.
 */
export interface AuthenticatedUser extends UserDocument {
  /** Firestore document ID of the profile in `users/` */
  docId: string;
  /** UID from the verified Firebase ID token */
  firebaseUid: string;
}

export const SENEGAL_PHONE_REGEX = /^(\+221|221)?[7][05678]\d{7}$/;

export function normalizePhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+221')) return cleaned;
  if (cleaned.startsWith('221')) return `+${cleaned}`;
  if (/^[7]\d{8}$/.test(cleaned)) return `+221${cleaned}`;
  return cleaned;
}

/** Compare two phone numbers on their last 9 digits (Senegalese local format). */
export function phonesMatch(a?: string | null, b?: string | null): boolean {
  if (!a || !b) return false;
  const da = a.replace(/\D/g, '');
  const db = b.replace(/\D/g, '');
  return da.length >= 9 && db.length >= 9 && da.slice(-9) === db.slice(-9);
}

/** All identifiers under which a user's data may have been stored (uid, doc id, phone formats). */
export function userIdentifiers(user: AuthenticatedUser): string[] {
  const ids = new Set<string>([user.uid, user.docId, user.firebaseUid].filter(Boolean));
  if (user.phoneNumber) {
    const normalized = normalizePhoneNumber(user.phoneNumber);
    const digits = normalized.replace(/\D/g, '');
    ids.add(normalized);
    ids.add(digits);
    ids.add(digits.slice(-9));
  }
  return Array.from(ids);
}

/** True if a record (userNatt, transaction…) belongs to the authenticated user. */
export function belongsToUser(
  record: { userId?: string | null; userPhone?: string | null },
  user: AuthenticatedUser,
): boolean {
  const ids = userIdentifiers(user);
  if (record.userId && ids.includes(record.userId)) return true;
  return phonesMatch(record.userPhone, user.phoneNumber) || phonesMatch(record.userId, user.phoneNumber);
}

/**
 * Find the Firestore profile of a verified Firebase identity.
 * Looks up `users/{uid}` first, then legacy documents keyed by phone number.
 * The phone number MUST come from a verified token (decoded.phone_number).
 */
export async function findUserProfile(
  firestore: FirestoreService,
  uid: string,
  verifiedPhone: string | null,
): Promise<{ ref: DocumentReference; data: UserDocument } | null> {
  const primaryRef = firestore.users().doc(uid);
  const primarySnap = await primaryRef.get();
  if (primarySnap.exists) {
    return { ref: primaryRef, data: primarySnap.data() as UserDocument };
  }

  if (!verifiedPhone) return null;

  const normalized = normalizePhoneNumber(verifiedPhone);
  const digits = normalized.replace(/\D/g, '');
  const local9 = digits.slice(-9);

  for (const candidateId of [normalized, digits, local9, `user_${digits}`, `user_${local9}`]) {
    const ref = firestore.users().doc(candidateId);
    const snap = await ref.get();
    if (snap.exists) {
      return { ref, data: snap.data() as UserDocument };
    }
  }

  for (const phoneValue of [normalized, local9]) {
    const q = await firestore.users().where('phoneNumber', '==', phoneValue).limit(1).get();
    if (!q.empty) {
      return { ref: q.docs[0].ref, data: q.docs[0].data() as UserDocument };
    }
  }

  return null;
}
