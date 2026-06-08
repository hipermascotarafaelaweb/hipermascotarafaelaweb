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

/** Recuerda los datos del cliente (excepto DNI) para no tener que recargarlos en cada compra. */
export const useCustomerStore = create<CustomerState>()(
  persist(
    (set, get) => ({
      data: empty,
      setData: (partial) => set({ data: { ...get().data, ...partial } }),
    }),
    {
      name: 'hipermascota-customer',
      partialize: (state) => ({
        data: {
          first_name: state.data.first_name,
          last_name: state.data.last_name,
          phone: state.data.phone,
          street: state.data.street,
          city: state.data.city,
          province: state.data.province,
          postal_code: state.data.postal_code,
          dni: '', // No persistir DNI por seguridad
        },
      }),
    }
  )
);
