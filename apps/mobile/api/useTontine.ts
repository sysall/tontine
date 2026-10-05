import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tontineApi, SubscribeOfferPayload, JoinTontinePayload, ProcessContributionPayload } from './tontineApi';

export function useDashboardSummary(userId?: string) {
  return useQuery({
    queryKey: ['tontines-dashboard', userId],
    queryFn: () => tontineApi.getDashboardSummary(userId),
  });
}

export function useTransactionHistory(userId?: string) {
  return useQuery({
    queryKey: ['tontines-transactions', userId],
    queryFn: () => tontineApi.getTransactions(userId),
  });
}

export function useEventNatts() {
  return useQuery({
    queryKey: ['tontines-events'],
    queryFn: () => tontineApi.getEventNatts(),
  });
}

export function useSubscribeOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubscribeOfferPayload) => tontineApi.subscribeOffer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tontines-dashboard'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['tontines-transactions'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['tontines-events'], exact: false });
      queryClient.refetchQueries({ queryKey: ['tontines-dashboard'] });
    },
  });
}

export function useJoinTontine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: JoinTontinePayload) => tontineApi.joinTontine(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tontines-dashboard'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['tontines-transactions'], exact: false });
      queryClient.refetchQueries({ queryKey: ['tontines-dashboard'] });
    },
  });
}

export function useProcessContribution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProcessContributionPayload) => tontineApi.processContribution(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tontines-dashboard'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['tontines-transactions'], exact: false });
      queryClient.refetchQueries({ queryKey: ['tontines-dashboard'] });
    },
  });
}
