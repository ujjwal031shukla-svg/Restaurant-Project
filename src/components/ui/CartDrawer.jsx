'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '@/store/useStore';

/** Slide-over order cart. */
export function CartDrawer() {
  const cartOpen = useStore((s) => s.cartOpen);
  const closeCart = useStore((s) => s.closeCart);
  const cartItems = useStore((s) => s.cartItems);
  const setItemQty = useStore((s) => s.setItemQty);
  const removeFromOrder = useStore((s) => s.removeFromOrder);
  const clearCart = useStore((s) => s.clearCart);

  const [placed, setPlaced] = useState(false);
  const total = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);

  useEffect(() => {
    if (!cartOpen) setPlaced(false);
  }, [cartOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') closeCart();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeCart]);

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            aria-hidden
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Your order"
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col gap-4 overflow-y-auto rounded-l-2xl bg-surface-container-lowest/95 p-6 shadow-2xl backdrop-blur-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">Tasting flight</p>
                <h3 className="font-display text-2xl text-on-surface">Your Order</h3>
              </div>
              <button
                onClick={closeCart}
                className="rounded-full bg-surface-container p-2 text-on-surface-variant hover:text-on-surface"
                aria-label="Close order"
              >
                ✕
              </button>
            </div>

            {placed ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl text-on-primary">✓</span>
                <h4 className="font-display text-xl text-on-surface">Order sent to the kitchen</h4>
                <p className="text-sm text-on-surface-variant">Courses will arrive with the next seating wave.</p>
                <button
                  onClick={closeCart}
                  className="mt-2 rounded-full bg-primary px-8 py-3 text-xs font-bold uppercase tracking-widest text-on-primary"
                >
                  Continue exploring
                </button>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
                <p className="font-display text-lg text-on-surface">Your tasting is empty</p>
                <p className="max-w-60 text-sm text-on-surface-variant">Add dishes from the Degustation Archive below.</p>
              </div>
            ) : (
              <>
                <ul className="flex flex-col gap-2">
                  {cartItems.map((item) => (
                    <li key={item.id} className="flex items-center gap-3 rounded-lg bg-surface-container-low p-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-on-surface">{item.name}</p>
                        <p className="text-xs text-secondary">${item.price} each</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setItemQty(item.id, item.qty - 1)} className="h-7 w-7 rounded bg-surface-container text-sm font-bold text-on-surface hover:bg-surface-container-high" aria-label={`Less ${item.name}`}>−</button>
                        <span className="w-5 text-center text-sm font-semibold text-on-surface">{item.qty}</span>
                        <button onClick={() => setItemQty(item.id, item.qty + 1)} className="h-7 w-7 rounded bg-surface-container text-sm font-bold text-on-surface hover:bg-surface-container-high" aria-label={`More ${item.name}`}>+</button>
                      </div>
                      <span className="w-12 text-right text-sm font-bold text-primary">${item.price * item.qty}</span>
                      <button onClick={() => removeFromOrder(item.id)} className="rounded p-1 text-xs text-outline hover:text-error" aria-label={`Remove ${item.name}`}>✕</button>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto flex flex-col gap-3">
                  <div className="flex items-center justify-between border-t border-surface-container-high pt-3">
                    <span className="text-xs uppercase tracking-widest text-on-surface-variant">Total</span>
                    <span className="font-display text-3xl text-primary">${total}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={clearCart} className="rounded-lg bg-surface-container-high py-3 text-xs font-bold uppercase tracking-widest text-on-surface hover:bg-surface-container-highest">
                      Clear
                    </button>
                    <button
                      onClick={() => {
                        setPlaced(true);
                        clearCart();
                      }}
                      className="rounded-lg bg-primary py-3 text-xs font-bold uppercase tracking-widest text-on-primary shadow-[0_0_20px_rgba(255,190,128,0.3)] hover:bg-secondary"
                    >
                      Send Order
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default CartDrawer;
