'use client';

import { X, Minus, Plus, Trash2, MessageCircle, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { generateWhatsAppLink } from '@/utils/whatsapp';

function formatPrice(price: number): string {
  return price.toLocaleString('es-AR', { minimumFractionDigits: 0 });
}

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

  const total = totalPrice();

  const handleCheckout = () => {
    const link = generateWhatsAppLink(items, total);
    window.open(link, '_blank');
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-50 transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl transform transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-bold text-gray-900">Tu Carrito</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Cerrar carrito"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-8 text-center">
              <div>
                <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium mb-1">Tu carrito está vacío</p>
                <p className="text-gray-400 text-sm">
                  Agregá productos desde nuestro catálogo
                </p>
              </div>
            </div>
          ) : (
            <>
              <ul className="flex-1 overflow-y-auto p-4 space-y-3">
                {items.map((item) => (
                  <li
                    key={item.product.id}
                    className="flex gap-3 bg-gray-50 rounded-xl p-4"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">
                        {item.product.name}
                      </h3>
                      <p className="text-green-700 font-bold text-sm mt-0.5">
                        ${formatPrice(item.product.price)} c/u
                      </p>
                      <div className="flex items-center gap-2 mt-2.5">
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 hover:border-green-400 transition-colors"
                          aria-label="Reducir cantidad"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-sm font-bold w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 hover:border-green-400 transition-colors"
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
                        ${formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="border-t border-gray-100 p-5 space-y-4 bg-gray-50">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Total</span>
                  <span className="text-2xl font-extrabold text-gray-900">
                    ${formatPrice(total)}
                  </span>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full flex items-center justify-center gap-2.5 bg-green-600 hover:bg-green-700 active:scale-[0.98] text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-green-600/20"
                >
                  <MessageCircle className="w-5 h-5" />
                  Confirmar Pedido por WhatsApp
                </button>

                <button
                  onClick={clearCart}
                  className="w-full text-sm text-gray-400 hover:text-red-500 transition-colors py-1"
                >
                  Vaciar carrito
                </button>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
