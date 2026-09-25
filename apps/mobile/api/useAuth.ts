import { useMutation } from '@tanstack/react-query';
import {
  authApi,
  RequestOtpPayload,
  RequestOtpResponse,
  VerifyOtpPayload,
  VerifyOtpResponse,
  FirebaseLoginPayload,
  FirebaseLoginResponse,
} from './authApi';

export function useFirebaseLogin() {
  return useMutation<FirebaseLoginResponse, Error, FirebaseLoginPayload>({
    mutationFn: (payload: FirebaseLoginPayload) => authApi.firebaseLogin(payload),
  });
}

export function useRequestOtp() {
  return useMutation<RequestOtpResponse, Error, RequestOtpPayload>({
    mutationFn: (payload: RequestOtpPayload) => authApi.requestOtp(payload),
  });
}

export function useVerifyOtp() {
  return useMutation<VerifyOtpResponse, Error, VerifyOtpPayload>({
    mutationFn: (payload: VerifyOtpPayload) => authApi.verifyOtp(payload),
  });
}
