import { useState, useEffect, useCallback } from 'react';
import type { DeliveryTask } from '../types';
import { deliveryService } from '../services/deliveryService';

export const useDelivery = (deliveryId?: string) => {
  const [availableDeliveries, setAvailableDeliveries] = useState<DeliveryTask[]>([]);
  const [myDeliveries, setMyDeliveries] = useState<DeliveryTask[]>([]);
  const [currentDelivery, setCurrentDelivery] = useState<DeliveryTask | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailableDeliveries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await deliveryService.getAvailableDeliveries();
      setAvailableDeliveries(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch available deliveries';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMyDeliveries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await deliveryService.getVolunteerDeliveries();
      setMyDeliveries(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch volunteer deliveries';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchDeliveryById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await deliveryService.getDeliveryById(id);
      setCurrentDelivery(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch delivery details';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const acceptDelivery = async (id: string, notes?: string): Promise<DeliveryTask> => {
    setIsLoading(true);
    setError(null);
    try {
      const task = await deliveryService.acceptDeliveryTask(id, notes);
      setCurrentDelivery(task);
      await fetchAvailableDeliveries();
      await fetchMyDeliveries();
      return task;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to accept delivery task';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const confirmPickup = async (id: string, notes?: string, proofImageUrl?: string): Promise<DeliveryTask> => {
    setIsLoading(true);
    setError(null);
    try {
      const task = await deliveryService.confirmPickup(id, notes, proofImageUrl);
      setCurrentDelivery(task);
      await fetchMyDeliveries();
      return task;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to confirm pickup';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const startDelivery = async (id: string): Promise<DeliveryTask> => {
    setIsLoading(true);
    setError(null);
    try {
      const task = await deliveryService.startDelivery(id);
      setCurrentDelivery(task);
      await fetchMyDeliveries();
      return task;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to start delivery';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const completeDelivery = async (id: string, notes?: string, proofImageUrl?: string): Promise<DeliveryTask> => {
    setIsLoading(true);
    setError(null);
    try {
      const task = await deliveryService.completeDelivery(id, notes, proofImageUrl);
      setCurrentDelivery(task);
      await fetchMyDeliveries();
      return task;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to complete delivery';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (deliveryId) {
      fetchDeliveryById(deliveryId);
    } else {
      Promise.all([fetchAvailableDeliveries(), fetchMyDeliveries()]);
    }
  }, [deliveryId, fetchDeliveryById, fetchAvailableDeliveries, fetchMyDeliveries]);

  return {
    availableDeliveries,
    myDeliveries,
    currentDelivery,
    isLoading,
    error,
    fetchAvailableDeliveries,
    fetchMyDeliveries,
    fetchDeliveryById,
    acceptDelivery,
    confirmPickup,
    startDelivery,
    completeDelivery,
  };
};
