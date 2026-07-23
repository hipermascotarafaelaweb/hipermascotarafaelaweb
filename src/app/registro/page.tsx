'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, Mail, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Logo from '@/components/Logo';

interface RegistroForm {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone: string;
  dni: string;
}

const emptyForm: RegistroForm = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  phone: '',
  dni: '',
};

export default function RegistroPage() {
  const [form, setForm] = useState<RegistroForm>(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const router = useRouter();

  const set = (field: keyof RegistroForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError('Ingresá tu nombre y apellido.');
      return;
    }
    const dniClean = form.dni.replace(/\D/g, '');
    if (!/^\d{7,9}$/.test(dniClean)) {
      setError('DNI inválido (7 a 9 dígitos).');
      return;
    }
    const phoneClean = form.phone.replace(/\D/g, '');
    if (!/^\d{10}$/.test(phoneClean) && !/^549\d{9}$/.test(phoneClean)) {
      setError('Teléfono inválido (10 dígitos).');
      return;
    }
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          phone: form.phone.trim(),
          dni: dniClean,
        },
      },
    });
    setLoading(false);

    if (signUpError) {
      setError(
        signUpError.message.toLowerCase().includes('already registered') ||
          signUpError.message.toLowerCase().includes('already been registered')
          ? 'Ese email ya está registrado. Iniciá sesión en su lugar.'
          : 'No se pudo crear la cuenta. Probá de nuevo.'
      );
      return;
    }

    if (data.session) {
      router.push('/productos');
      router.refresh();
    } else {
      setAwaitingConfirmation(true);
    }
  };

  if (awaitingConfirmation) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm text-center bg-white rounded-3xl border border-gray-100 p-8 shadow-lg shadow-gray-200/50">
          <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-brand-600" />
          </div>
          <h1 className="text-lg font-extrabold text-gray-900 mb-2">Revisá tu email</h1>
          <p className="text-sm text-gray-500 mb-6">
            Te enviamos un link para confirmar tu cuenta. Una vez confirmada, iniciá sesión para ver
            los precios y comprar.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-2.5 rounded-xl transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            Ir a iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8 flex flex-col items-center">
          <Logo className="h-20 w-auto" />
          <div className="flex items-center justify-center gap-1.5 text-sm text-gray-500 mt-3">
            <UserPlus className="w-3.5 h-3.5" />
            Registrate para ver precios y comprar
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl border border-gray-100 p-7 space-y-4 shadow-lg shadow-gray-200/50"
        >
          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre</label>
              <input
                value={form.first_name}
                onChange={set('first_name')}
                required
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                placeholder="Juan"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Apellido</label>
              <input
                value={form.last_name}
                onChange={set('last_name')}
                required
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                placeholder="Pérez"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
              required
              autoComplete="email"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              placeholder="tucorreo@ejemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contraseña</label>
            <input
              type="password"
              value={form.password}
              onChange={set('password')}
              required
              autoComplete="new-password"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Teléfono</label>
            <input
              value={form.phone}
              onChange={set('phone')}
              required
              inputMode="tel"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              placeholder="3492 123456"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">DNI</label>
            <input
              value={form.dni}
              onChange={set('dni')}
              required
              inputMode="numeric"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              placeholder="30123456"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white font-bold py-3 rounded-xl transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? 'Creando cuenta…' : 'Registrarme'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" className="text-brand-600 font-semibold hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
