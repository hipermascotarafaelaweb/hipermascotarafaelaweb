'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CustomerInput } from '@/types';

interface CustomerState {
  data: CustomerInput;
  setData: (data: Partial<CustomerInput>) => void;
}

const empty: CustomerInput = {
  first_name: '',
  last_name: '',
  dni: '',
  phone: '',
  street: '',
  city: '',
  province: '',
  postal_code: '',
};

/** Recuerda los datos del cliente para no tener que recargarlos en cada compra. */
export const useCustomerStore = create<CustomerState>()(
  persist(
    (set, get) => ({
      data: empty,
      setData: (partial) => set({ data: { ...get().data, ...partial } }),
    }),
    { name: 'hipermascota-customer' }
  )
);
