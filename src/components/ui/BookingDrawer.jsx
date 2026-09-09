'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TABLES, TIME_SLOTS, useStore } from '@/store/useStore';

/** Slide-over reservation card driven by the 3D table selection. */
export function BookingDrawer() {
  const bookingOpen = useStore((s) => s.bookingOpen);
  const closeBooking = useStore((s) => s.closeBooking);
  const selectedTableId = useStore((s) => s.selectedTableId);
  const bookingDate = useStore((s) => s.bookingDate);
  const bookingTime = useStore((s) => s.bookingTime);
  const guestCount = useStore((s) => s.guestCount);
  const bookingNotes = useStore((s) => s.bookingNotes);
  const setBookingTime = useStore((s) => s.setBookingTime);
  const incrementGuests = useStore((s) => s.incrementGuests);
  const decrementGuests = useStore((s) => s.decrementGuests);
  const setBookingNotes = useStore((s) => s.setBookingNotes);

  const [confirmed, setConfirmed] = useState(false);
  const table = TABLES.find((t) => t.id === selectedTableId) ?? null;

  useEffect(() => {
    if (!bookingOpen) setConfirmed(false);
  }, [bookingOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') closeBooking();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeBooking]);

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
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">Active Selection</p>
                <h3 className="font-display text-2xl text-on-surface">
                  {table ? `Table ${table.id} — ${table.zone}` : 'No table selected'}
                </h3>
                {table && (
                  <p className="mt-1 text-sm text-on-surface-variant">
                    {table.seats} seats · {table.vip ? 'VIP booth' : 'Standard'} · Window vista
                  </p>
                )}
              </div>
              <button
                onClick={closeBooking}
                className="rounded-full bg-surface-container p-2 text-on-surface-variant hover:text-on-surface"
                aria-label="Close reservation"
              >
                ✕
              </button>
            </div>

            {confirmed ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl text-on-primary">✓</span>
                <h4 className="font-display text-xl text-on-surface">Reservation confirmed</h4>
                <p className="text-sm text-on-surface-variant">
                  Table {selectedTableId} · {bookingDate} · {bookingTime} · {guestCount} guest{guestCount > 1 ? 's' : ''}
                </p>
                <p className="text-xs uppercase tracking-widest text-secondary">
                  Ref AURA-{selectedTableId?.replace('T-', '') ?? '00'}-{String(guestCount).padStart(2, '0')}
                </p>
                <button
                  onClick={closeBooking}
                  className="mt-2 rounded-full bg-primary px-8 py-3 text-xs font-bold uppercase tracking-widest text-on-primary"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-wider text-on-surface-variant">Date</label>
                  <div className="rounded-lg bg-surface-container-low p-3 text-sm font-medium text-on-surface">
                    {bookingDate}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-xs uppercase tracking-wider text-on-surface-variant" id="slot-label">Seating slot</span>
                  <div className="grid grid-cols-4 gap-2" role="group" aria-labelledby="slot-label">
                    {TIME_SLOTS.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setBookingTime(slot)}
                        className={`rounded-md py-2 text-xs font-semibold transition-colors ${
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

                <div className="flex flex-col gap-1.5">
                  <span className="text-xs uppercase tracking-wider text-on-surface-variant" id="party-label">Party size</span>
                  <div className="flex items-center justify-between rounded-lg bg-surface-container-low p-2" role="group" aria-labelledby="party-label">
                    <button onClick={decrementGuests} className="h-8 w-8 rounded bg-surface-container text-lg font-bold text-on-surface hover:bg-surface-container-high" aria-label="Fewer guests">−</button>
                    <span className="text-sm font-semibold text-on-surface">
                      {guestCount} Guest{guestCount > 1 ? 's' : ''}{table ? ` (max ${table.seats})` : ''}
                    </span>
                    <button onClick={() => incrementGuests(table?.seats ?? 12)} className="h-8 w-8 rounded bg-surface-container text-lg font-bold text-on-surface hover:bg-surface-container-high" aria-label="More guests">+</button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="booking-notes" className="text-xs uppercase tracking-wider text-on-surface-variant">Requests & allergies</label>
                  <textarea
                    id="booking-notes"
                    rows={2}
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    placeholder="Anniversary, truffle preference, wine pairings…"
                    className="resize-none rounded-lg bg-surface-container-low p-3 text-sm text-on-surface placeholder:text-outline focus:bg-surface-container focus:outline-none"
                  />
                </div>

                <button
                  onClick={() => setConfirmed(true)}
                  disabled={!table}
                  className="mt-1 w-full rounded-lg bg-primary py-3.5 text-sm font-bold uppercase tracking-wider text-on-primary shadow-[0_0_24px_rgba(255,190,128,0.4)] transition-all hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Confirm Reservation
                </button>
                <p className="text-center text-xs text-on-surface-variant">Instant Maître d&apos; confirmation · No card required</p>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default BookingDrawer;
