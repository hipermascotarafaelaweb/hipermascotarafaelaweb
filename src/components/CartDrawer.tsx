'use client';

import { useState, useEffect } from 'react';
import {
  X, Minus, Plus, Trash2, MessageCircle, ShoppingBag, PawPrint,
  ArrowLeft, ArrowRight, Truck, CheckCircle2, PartyPopper, Check, AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/store/cart';
import { useCustomerStore } from '@/store/customer';
import { generateWhatsAppLink } from '@/utils/whatsapp';
import { formatPrice, effectivePrice, hasDiscount, tieredUnitPrice } from '@/utils/format';
import { useToast } from '@/hooks/useToast';
import type { CustomerInput, Coupon } from '@/types';

type Step = 'cart' | 'form' | 'done';

export default function CartDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalPrice = useCartStore((s) => s.totalPrice);

  const customer = useCustomerStore((s) => s.data);
  const setCustomer = useCustomerStore((s) => s.setData);

  const toast = useToast();

  const [step, setStep] = useState<Step>('cart');
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerInput, string>>>({});
  const [sentLink, setSentLink] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [lookingUpDni, setLookingUpDni] = useState(false);

  const total = totalPrice();
  const couponDiscount = coupon ? (total * coupon.discount_percent) / 100 : 0;
  const finalTotal = total - couponDiscount;

  // Cierra el panel y, si el pedido ya se envió, vuelve al estado inicial.
  const handleClose = () => {
    onClose();
    if (step === 'done') setStep('cart');
  };

  const lookupCustomerByDni = async (dni: string) => {
    const dniClean = dni.replace(/\D/g, '');
    if (!/^\d{7,9}$/.test(dniClean)) return;

    setLookingUpDni(true);
    try {
      const response = await fetch('/api/customers/by-dni', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni: dniClean }),
      });
      const data = await response.json();
      if (data.customer) {
        setCustomer({
          first_name: data.customer.first_name,
          last_name: data.customer.last_name,
          dni: data.customer.dni,
          phone: data.customer.phone,
          street: data.customer.street || '',
          city: data.customer.city || '',
          province: data.customer.province || '',
          postal_code: data.customer.postal_code || '',
        });
      }
    } catch (err) {
      console.error('Error looking up customer:', err);
    } finally {
      setLookingUpDni(false);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Ingresá un código.');
      return;
    }
    setApplyingCoupon(true);
    setCouponError('');
    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim() }),
      });
      const data = await response.json();
      if (!response.ok) {
        setCouponError(data.error || 'Código inválido.');
        return;
      }
      setCoupon(data.coupon as Coupon);
      setCouponCode('');
    } catch {
      setCouponError('Error al validar código.');
    } finally {
      setApplyingCoupon(false);
    }
  };

  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscapeKey);
    return () => window.removeEventListener('keydown', handleEscapeKey);
  }, [open, onClose]);

  const validate = (): boolean => {
    const e: Partial<Record<keyof CustomerInput, string>> = {};
    if (!customer.first_name.trim()) e.first_name = 'Ingresá tu nombre';
    if (!customer.last_name.trim()) e.last_name = 'Ingresá tu apellido';
    const dniClean = customer.dni.replace(/\D/g, '');
    if (!/^\d{7,9}$/.test(dniClean)) e.dni = 'DNI inválido (7 a 9 dígitos)';
    const phoneClean = customer.phone.trim().replace(/\D/g, '');
    if (!/^\d{10}$/.test(phoneClean) && !/^549\d{9}$/.test(phoneClean)) {
      e.phone = 'Teléfono inválido (10 dígitos)';
    }
    if (!customer.street.trim()) e.street = 'Ingresá calle y número';
    if (!customer.city.trim()) e.city = 'Ingresá la ciudad';
    if (!customer.province.trim()) e.province = 'Ingresá la provincia';
    if (!customer.postal_code.trim()) e.postal_code = 'Ingresá el código postal';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleConfirm = async () => {
    if (!validate()) return;
    setSending(true);

    const clean: CustomerInput = {
      first_name: customer.first_name.trim(),
      last_name: customer.last_name.trim(),
      dni: customer.dni.trim(),
      phone: customer.phone.trim(),
      street: customer.street.trim(),
      city: customer.city.trim(),
      province: customer.province.trim(),
      postal_code: customer.postal_code.trim(),
    };

    try {
      const checkoutItems = items.map((i) => ({
        product_id: i.product.id,
        qty: i.quantity,
      }));

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: checkoutItems,
          customer: clean,
          couponCode: coupon?.code || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al crear pedido');
      }

      const result = await response.json();
      const serverTotal = result.order.total;

      const link = generateWhatsAppLink(items, serverTotal, clean, result.order.couponDiscount, coupon?.code);
      window.open(link, '_blank');

      clearCart();
      setSentLink(link);
      setStep('done');
      toast.success('Pedido creado exitosamente');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al crear el pedido';
      toast.error(message);
    } finally {
      setSending(false);
    }
  };

  const field = (
    name: keyof CustomerInput,
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement> = {}
  ) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      <input
        value={customer[name]}
        onChange={(e) => setCustomer({ [name]: e.target.value })}
        className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${
          errors[name] ? 'border-red-400' : 'border-gray-200'
        }`}
        {...props}
      />
      {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <>
      <div
        className={`fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
      />

      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl transform transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!open}
        // `inert` cuando está cerrado: saca el subtree del orden de tabulación y
        // del árbol de accesibilidad (evita la violación aria-hidden-focus).
        inert={!open}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              {step === 'form' ? (
                <button
                  onClick={() => setStep('cart')}
                  className="p-1 -ml-1 text-gray-500 hover:text-gray-800"
                  aria-label="Volver al carrito"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              ) : (
                <ShoppingBag className="w-5 h-5 text-brand-600" />
              )}
              <h2 className="text-lg font-extrabold text-gray-900">
                {step === 'form' ? 'Tus datos' : step === 'done' ? '¡Listo!' : 'Tu pedido'}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Cerrar carrito"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {step === 'done' ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-11 h-11 text-brand-600" />
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 mb-1.5 flex items-center gap-2">
                ¡Gracias por tu pedido! <PartyPopper className="w-5 h-5 text-brand-600" />
              </h3>
              <p className="text-gray-500 text-sm max-w-xs mb-6">
                Te abrimos WhatsApp para confirmar la disponibilidad y coordinar el envío. Si no se abrió, tocá el botón de abajo.
              </p>
              <a
                href={sentLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#1ebe5a] text-white font-bold py-3.5 px-4 rounded-2xl transition-colors mb-3"
              >
                <MessageCircle className="w-5 h-5" />
                Abrir WhatsApp de nuevo
              </a>
              <button
                onClick={handleClose}
                className="w-full text-sm font-semibold text-gray-500 hover:text-brand-700 transition-colors py-2"
              >
                Seguir comprando
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-8 text-center">
              <div>
                <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PawPrint className="w-10 h-10 text-brand-300" />
                </div>
                <p className="text-gray-700 text-lg font-bold mb-1">Tu carrito está vacío</p>
                <p className="text-gray-400 text-sm mb-6">Agregá productos desde el catálogo</p>
                <Link
                  href="/productos"
                  onClick={onClose}
                  className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-2.5 rounded-xl transition-colors"
                >
                  Ver productos
                </Link>
              </div>
            </div>
          ) : step === 'cart' ? (
            <>
              <ul className="flex-1 overflow-y-auto p-4 space-y-3">
                {items.map((item) => {
                  const lowStock = item.product.stock > 0 && item.product.stock <= 3;
                  const unitPrice = tieredUnitPrice(item.product, item.quantity);
                  return (
                    <li key={item.product.id} className="flex gap-3 bg-gray-50 rounded-2xl p-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">
                          {item.product.name}
                        </h3>
                        <p className="text-brand-700 font-bold text-sm mt-0.5">
                          {formatPrice(unitPrice)}
                          {hasDiscount(item.product) && unitPrice === effectivePrice(item.product) && (
                            <span className="text-gray-400 font-normal line-through ml-1.5">
                              {formatPrice(item.product.price)}
                            </span>
                          )}
                          <span className="text-gray-400 font-normal"> c/u</span>
                        </p>
                        {lowStock && (
                          <div className="flex items-center gap-1.5 text-xs text-amber-600 mt-2">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Solo {item.product.stock} en stock
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 hover:border-brand-400 hover:text-brand-600 transition-colors"
                            aria-label="Reducir cantidad"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-sm font-bold w-7 text-center tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 hover:border-brand-400 hover:text-brand-600 transition-colors"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors"
                          aria-label="Eliminar producto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-extrabold text-gray-900">
                          {formatPrice(unitPrice * item.quantity)}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="border-t border-gray-100 p-5 space-y-4 bg-gray-50/80">
                {/* Cupón */}
                <div className="flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value);
                      setCouponError('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
                    placeholder="Código cupón"
                    className={`flex-1 px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                      couponError ? 'border-red-400' : 'border-gray-200'
                    }`}
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={applyingCoupon}
                    className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white font-bold rounded-xl text-sm transition-colors"
                  >
                    Aplicar
                  </button>
                </div>
                {couponError && <p className="text-xs text-red-600">{couponError}</p>}
                {coupon && (
                  <div className="flex items-center gap-2 bg-green-50 text-green-700 rounded-xl px-3 py-2 text-sm font-semibold">
                    <Check className="w-4 h-4" />
                    Cupón {coupon.code} aplicado (-{coupon.discount_percent}%)
                    <button
                      onClick={() => setCoupon(null)}
                      className="ml-auto text-green-600 hover:text-red-600"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2 text-brand-700 bg-brand-50 rounded-xl px-3 py-2 text-sm font-semibold">
                  <Truck className="w-4 h-4" />
                  Coordinamos tu envío
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  {coupon && (
                    <div className="flex justify-between text-sm text-green-600 font-semibold">
                      <span>Descuento ({coupon.discount_percent}%)</span>
                      <span>-{formatPrice(couponDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-gray-600 font-semibold">Total</span>
                    <span className="text-2xl font-extrabold text-gray-900">{formatPrice(finalTotal)}</span>
                  </div>
                </div>
                <button
                  onClick={() => setStep('form')}
                  className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white font-bold py-3.5 px-4 rounded-2xl transition-all shadow-lg shadow-brand-600/20"
                >
                  Continuar
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={clearCart}
                  className="w-full text-sm text-gray-400 hover:text-red-500 transition-colors"
                >
                  Vaciar carrito
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <p className="text-sm text-gray-500">
                  Ingresá tu DNI para cargar automáticamente tus datos, o completá el formulario. Tu
                  pedido se confirma por WhatsApp.
                </p>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">DNI {lookingUpDni && <span className="text-xs text-brand-600">buscando...</span>}</label>
                  <input
                    value={customer.dni}
                    onChange={(e) => {
                      setCustomer({ dni: e.target.value });
                      if (e.target.value.length >= 7) {
                        lookupCustomerByDni(e.target.value);
                      }
                    }}
                    placeholder="30123456"
                    inputMode="numeric"
                    className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                      errors.dni ? 'border-red-400' : 'border-gray-200'
                    }`}
                  />
                  {errors.dni && <p className="text-xs text-red-500 mt-1">{errors.dni}</p>}
                </div>
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                  {field('first_name', 'Nombre', { placeholder: 'Juan' })}
                  {field('last_name', 'Apellido', { placeholder: 'Pérez' })}
                </div>
                {field('phone', 'Teléfono', { placeholder: '3492 123456', inputMode: 'tel' })}
                {field('street', 'Calle y Número', { placeholder: 'Av. San Martín 123' })}
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                  {field('city', 'Ciudad', { placeholder: 'Rafaela' })}
                  {field('province', 'Provincia', { placeholder: 'Santa Fe' })}
                </div>
                {field('postal_code', 'Código Postal', { placeholder: '2300' })}
                <p className="text-xs text-gray-400 leading-relaxed">
                  Tus datos se usan únicamente para coordinar la entrega.{' '}
                  <Link href="/privacidad" onClick={onClose} className="text-brand-600 hover:underline font-semibold">
                    Aviso de privacidad
                  </Link>
                  .
                </p>
              </div>

              <div className="border-t border-gray-100 p-5 space-y-3 bg-gray-50/80">
                {coupon && (
                  <div className="space-y-2 pb-3 border-b border-gray-200">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-green-600 font-semibold">
                      <span>{coupon.code} (-{coupon.discount_percent}%)</span>
                      <span>-{formatPrice(couponDiscount)}</span>
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-semibold">Total</span>
                  <span className="text-xl font-extrabold text-gray-900">{formatPrice(finalTotal)}</span>
                </div>
                <button
                  onClick={handleConfirm}
                  disabled={sending}
                  className="w-full flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#1ebe5a] disabled:opacity-70 active:scale-[0.98] text-white font-bold py-3.5 px-4 rounded-2xl transition-all shadow-lg shadow-green-900/10"
                >
                  <MessageCircle className="w-5 h-5" />
                  {sending ? 'Abriendo WhatsApp…' : 'Confirmar pedido por WhatsApp'}
                </button>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
