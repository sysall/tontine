import { useMutation } from '@tanstack/react-query';
import { authApi, RequestOtpPayload, RequestOtpResponse, VerifyOtpPayload, VerifyOtpResponse } from './authApi';

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
