'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  TABLES,
  TIME_SLOTS,
  formatBookingDate,
  maxBookingISO,
  todayISO,
  useStore,
} from '@/store/useStore';

const STEPS = ['Table', 'Time', 'Details'];

/** Slide-over reservation flow driven by the 3D table selection. */
export function BookingDrawer() {
  const bookingOpen = useStore((s) => s.bookingOpen);
  const closeBooking = useStore((s) => s.closeBooking);
  const selectedTableId = useStore((s) => s.selectedTableId);
  const bookingDate = useStore((s) => s.bookingDate);
  const setBookingDate = useStore((s) => s.setBookingDate);
  const bookingTime = useStore((s) => s.bookingTime);
  const guestCount = useStore((s) => s.guestCount);
  const bookingNotes = useStore((s) => s.bookingNotes);
  const contactName = useStore((s) => s.contactName);
  const contactPhone = useStore((s) => s.contactPhone);
  const setBookingTime = useStore((s) => s.setBookingTime);
  const incrementGuests = useStore((s) => s.incrementGuests);
  const decrementGuests = useStore((s) => s.decrementGuests);
  const setBookingNotes = useStore((s) => s.setBookingNotes);
  const setContactName = useStore((s) => s.setContactName);
  const setContactPhone = useStore((s) => s.setContactPhone);

  const [confirmed, setConfirmed] = useState(false);
  const [triedSubmit, setTriedSubmit] = useState(false);
  const table = TABLES.find((t) => t.id === selectedTableId) ?? null;

  useEffect(() => {
    if (!bookingOpen) {
      setConfirmed(false);
      setTriedSubmit(false);
    }
  }, [bookingOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') closeBooking();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeBooking]);

  const nameValid = contactName.trim().length >= 2;
  const phoneValid = contactPhone.replace(/\D/g, '').length >= 7;
  const dateValid = bookingDate >= todayISO() && bookingDate <= maxBookingISO();
  const canConfirm = Boolean(table) && nameValid && phoneValid && dateValid;
  const ref = `AURA-${selectedTableId?.replace('T-', '') ?? '00'}-${String(guestCount).padStart(2, '0')}`;

  const handleConfirm = () => {
    setTriedSubmit(true);
    if (canConfirm) setConfirmed(true);
  };

  return (
    <AnimatePresence>
      {bookingOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeBooking}
            aria-hidden
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Table reservation"
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col gap-4 overflow-y-auto rounded-l-2xl bg-surface-container-lowest/95 p-6 shadow-2xl backdrop-blur-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">Active Selection</p>
                <h3 className="font-display text-2xl text-on-surface">
                  {table ? `Table ${table.id} — ${table.zone}` : 'No table selected'}
                </h3>
                {table && (
                  <p className="mt-1 text-sm text-on-surface-variant">
                    Seats {table.seats} · {table.vip ? 'VIP booth' : 'Standard'} · Garden vista
                  </p>
                )}
              </div>
              <button
                onClick={closeBooking}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface"
                aria-label="Close reservation"
              >
                ✕
              </button>
            </div>

            {/* Step tracker */}
            <ol className="flex items-center gap-1.5" aria-label="Reservation progress">
              {STEPS.map((s, i) => {
                const done = confirmed || i < (table ? (triedSubmit || nameValid ? 2 : 1) : 0);
                const current = !confirmed && i === (table ? 1 : 0);
                return (
                  <li key={s} className="flex flex-1 items-center gap-1.5">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                        done ? 'bg-primary text-on-primary' : current ? 'bg-surface-container-high text-primary ring-1 ring-primary' : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {done ? '✓' : i + 1}
                    </span>
                    <span className={`text-[11px] font-semibold uppercase tracking-widest ${done || current ? 'text-on-surface' : 'text-outline'}`}>{s}</span>
                    {i < STEPS.length - 1 && <span className="h-px flex-1 bg-surface-container-high" aria-hidden />}
                  </li>
                );
              })}
            </ol>

            {confirmed ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl text-on-primary" aria-hidden>✓</span>
                <h4 className="font-display text-xl text-on-surface">Table reserved{contactName ? `, ${contactName.split(' ')[0]}` : ''}</h4>
                <dl className="w-full rounded-xl bg-surface-container-low p-4 text-left text-sm">
                  {[
                    ['Table', `${selectedTableId} · ${table?.zone ?? ''}`],
                    ['Date', formatBookingDate(bookingDate)],
                    ['Time', `${bookingTime} · ${guestCount} guest${guestCount > 1 ? 's' : ''}`],
                    ['Contact', `${contactName} · ${contactPhone}`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3 border-b border-surface-container-high py-1.5 last:border-0">
                      <dt className="uppercase tracking-widest text-on-surface-variant text-xs">{k}</dt>
                      <dd className="text-right font-medium text-on-surface">{v}</dd>
                    </div>
                  ))}
                </dl>
                <p className="text-xs uppercase tracking-widest text-secondary">Ref {ref} · SMS confirmation on its way</p>
                <button
                  onClick={closeBooking}
                  className="mt-2 min-h-[44px] rounded-full bg-primary px-8 text-xs font-bold uppercase tracking-widest text-on-primary"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="booking-date" className="text-xs uppercase tracking-wider text-on-surface-variant">Date</label>
                    <input
                      id="booking-date"
                      type="date"
                      value={bookingDate}
                      min={todayISO()}
                      max={maxBookingISO()}
                      onChange={(e) => e.target.value && setBookingDate(e.target.value)}
                      className="min-h-[44px] rounded-lg bg-surface-container-low px-3 text-sm font-medium text-on-surface [color-scheme:dark] focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs uppercase tracking-wider text-on-surface-variant" id="party-label">Party</span>
                    <div className="flex min-h-[44px] items-center justify-between rounded-lg bg-surface-container-low px-2" role="group" aria-labelledby="party-label">
                      <button onClick={decrementGuests} className="flex h-9 w-9 items-center justify-center rounded bg-surface-container text-lg font-bold text-on-surface hover:bg-surface-container-high" aria-label="Fewer guests">−</button>
                      <span className="text-sm font-semibold text-on-surface">
                        {guestCount}{table ? ` / ${table.seats}` : ''}
                      </span>
                      <button onClick={() => incrementGuests(table?.seats ?? 12)} className="flex h-9 w-9 items-center justify-center rounded bg-surface-container text-lg font-bold text-on-surface hover:bg-surface-container-high" aria-label="More guests">+</button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-xs uppercase tracking-wider text-on-surface-variant" id="slot-label">Seating slot · {formatBookingDate(bookingDate)}</span>
                  <div className="grid grid-cols-4 gap-2" role="group" aria-labelledby="slot-label">
                    {TIME_SLOTS.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setBookingTime(slot)}
                        aria-pressed={bookingTime === slot}
                        className={`min-h-[44px] rounded-md text-xs font-semibold transition-colors ${
                          bookingTime === slot
                            ? 'bg-primary text-on-primary shadow-[0_0_12px_rgba(255,190,128,0.3)]'
                            : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="booking-name" className="text-xs uppercase tracking-wider text-on-surface-variant">Full name</label>
                    <input
                      id="booking-name"
                      type="text"
                      autoComplete="name"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Aarav Sharma"
                      aria-invalid={triedSubmit && !nameValid}
                      className="min-h-[44px] rounded-lg bg-surface-container-low px-3 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    {triedSubmit && !nameValid && <p className="text-xs text-error">Please add your name.</p>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="booking-phone" className="text-xs uppercase tracking-wider text-on-surface-variant">Phone</label>
                    <input
                      id="booking-phone"
                      type="tel"
                      autoComplete="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      aria-invalid={triedSubmit && !phoneValid}
                      className="min-h-[44px] rounded-lg bg-surface-container-low px-3 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    {triedSubmit && !phoneValid && <p className="text-xs text-error">A reachable number is required.</p>}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="booking-notes" className="text-xs uppercase tracking-wider text-on-surface-variant">Requests & allergies <span className="normal-case text-outline">(optional)</span></label>
                  <textarea
                    id="booking-notes"
                    rows={2}
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    placeholder="Anniversary, truffle preference, wine pairings…"
                    className="resize-none rounded-lg bg-surface-container-low p-3 text-sm text-on-surface placeholder:text-outline focus:bg-surface-container focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <button
                  onClick={handleConfirm}
                  className="mt-1 min-h-[48px] w-full rounded-lg bg-primary text-sm font-bold uppercase tracking-wider text-on-primary shadow-[0_0_24px_rgba(255,190,128,0.4)] transition-all hover:bg-secondary"
                >
                  Reserve Table {selectedTableId ?? ''}
                </button>
                <p className="text-center text-xs text-on-surface-variant">Free cancellation up to 4h before · No card required</p>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default BookingDrawer;
