'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { scrollToSection } from './Navbar';

/** Fixed bottom footer — slides up on the final (visit) section. */
export function Footer() {
  const activeSection = useStore((s) => s.activeSection);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const visible = activeSection === 'visit';

  return (
    <AnimatePresence>
      {visible && (
        <motion.footer
          className="fixed inset-x-0 bottom-0 z-30 border-t border-surface-container-high bg-surface-container-lowest/90 backdrop-blur-2xl"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 260 }}
        >
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-4 text-sm md:grid-cols-4 md:px-6">
            <div>
              <p className="font-display text-lg text-on-surface">AURA<span className="italic text-primary"> Dine</span></p>
              <p className="mt-1 text-xs text-on-surface-variant">Level 42, Garden Tower<br />Tue – Sun · 6 PM – 11 PM</p>
            </div>
            <div className="flex flex-col gap-1 text-xs">
              <span className="uppercase tracking-widest text-secondary">Explore</span>
              {['story', 'booking', 'menu'].map((id) => (
                <button key={id} onClick={() => scrollToSection(id)} className="w-fit capitalize text-on-surface-variant hover:text-primary">
                  {id}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-1 text-xs">
              <span className="uppercase tracking-widest text-secondary">Contact</span>
              <a href="tel:+810312345678" className="text-on-surface-variant hover:text-primary">+81 03-1234-5678</a>
              <a href="mailto:reserve@auradine.example" className="text-on-surface-variant hover:text-primary">reserve@auradine.example</a>
              <span className="text-on-surface-variant">35.6586° N, 139.7454° E</span>
            </div>
            <div className="col-span-2 md:col-span-1">
              <span className="text-xs uppercase tracking-widest text-secondary">Newsletter</span>
              {subscribed ? (
                <p className="mt-1 text-xs text-primary">You&apos;re on the list — see you at the table.</p>
              ) : (
                <form
                  className="mt-1 flex gap-1.5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (email.trim()) setSubscribed(true);
                  }}
                >
                  <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                  <input
                    id="newsletter-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="min-w-0 flex-1 rounded-full bg-surface-container-low px-3 py-2 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button className="shrink-0 rounded-full bg-primary px-4 py-2 text-xs font-bold uppercase text-on-primary hover:bg-secondary">
                    Join
                  </button>
                </form>
              )}
            </div>
          </div>
          <p className="border-t border-surface-container-high py-2 text-center text-[11px] uppercase tracking-widest text-outline">
            © 2026 AURA Dine · Crafted in WebGL
          </p>
        </motion.footer>
      )}
    </AnimatePresence>
  );
}

export default Footer;
