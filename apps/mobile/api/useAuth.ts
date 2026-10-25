import { useMutation } from '@tanstack/react-query';
import {
  authApi,
  FirebaseLoginPayload,
  FirebaseLoginResponse,
} from './authApi';

export function useFirebaseLogin() {
  return useMutation<FirebaseLoginResponse, Error, FirebaseLoginPayload>({
    mutationFn: (payload: FirebaseLoginPayload) => authApi.firebaseLogin(payload),
  });
}
