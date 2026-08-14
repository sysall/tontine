import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tontineApi, SubscribeOfferPayload, JoinTontinePayload } from './tontineApi';

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['tontines-dashboard'],
    queryFn: () => tontineApi.getDashboardSummary(),
  });
}

export function useTransactionHistory() {
  return useQuery({
    queryKey: ['tontines-transactions'],
    queryFn: () => tontineApi.getTransactions(),
  });
}

export function useSubscribeOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubscribeOfferPayload) => tontineApi.subscribeOffer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tontines-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['tontines-transactions'] });
    },
  });
}

export function useJoinTontine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: JoinTontinePayload) => tontineApi.joinTontine(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tontines-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['tontines-transactions'] });
    },
  });
}
