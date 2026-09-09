import { create } from 'zustand';

// Static table catalogue — positions consumed by TableBooking3D in Step 4.
// Status: 'available' | 'reserved' | 'selected' (selected is derived from selectedTableId).
export const TABLES = [
  { id: 'T-01', seats: 2, zone: 'Main Hall', x: -3.2, z: -1.6, status: 'available' },
  { id: 'T-02', seats: 2, zone: 'Main Hall', x: 0, z: -1.6, status: 'available' },
  { id: 'T-04', seats: 4, zone: 'Main Hall', x: 3.2, z: -1.6, status: 'available' },
  { id: 'T-05', seats: 4, zone: 'Main Hall', x: -3.2, z: 1.6, status: 'available' },
  { id: 'T-07', seats: 4, zone: 'Main Hall', x: 0, z: 1.6, status: 'reserved' },
  { id: 'T-09', seats: 6, zone: 'Main Hall', x: 3.2, z: 1.6, status: 'available', vip: true },
  { id: 'T-10', seats: 4, zone: 'Terrace', x: -1.6, z: 3.4, status: 'available' },
  { id: 'T-12', seats: 2, zone: 'Terrace', x: 1.6, z: 3.4, status: 'available' },
];

export const TIME_SLOTS = ['6:30 PM', '7:00 PM', '8:30 PM', '9:15 PM'];

const todayLabel = () => {
  try {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Tonight';
  }
};

export const useStore = create((set, get) => ({
  // ── Scroll / section state (written by ScrollRig, read by overlays) ──
  activeSection: 'hero',
  scrollProgress: 0,
  setActiveSection: (activeSection) => set({ activeSection }),
  setScrollProgress: (scrollProgress) => set({ scrollProgress }),

  // ── Table booking state ──
  bookingOpen: false,
  selectedTableId: null,
  bookingDate: todayLabel(),
  bookingTime: '7:00 PM',
  guestCount: 2,
  bookingNotes: '',

  openBooking: (tableId) => {
    const table = TABLES.find((t) => t.id === tableId);
    if (!table || table.status === 'reserved') return;
    set({
      bookingOpen: true,
      selectedTableId: tableId,
      guestCount: Math.min(get().guestCount || 2, table.seats),
    });
  },
  closeBooking: () => set({ bookingOpen: false }),
  selectTable: (tableId) => {
    // Clicking a second table while drawer is open just retargets it.
    if (get().bookingOpen) {
      get().openBooking(tableId);
    } else {
      const table = TABLES.find((t) => t.id === tableId);
      if (!table || table.status === 'reserved') return;
      set({ selectedTableId: tableId });
    }
  },
  setBookingDate: (bookingDate) => set({ bookingDate }),
  setBookingTime: (bookingTime) => set({ bookingTime }),
  setGuestCount: (guestCount) =>
    set((s) => ({
      guestCount: Math.max(1, Math.min(12, Number(guestCount) || s.guestCount)),
    })),
  incrementGuests: (max = 12) =>
    set((s) => ({ guestCount: Math.min(max, s.guestCount + 1) })),
  decrementGuests: () =>
    set((s) => ({ guestCount: Math.max(1, s.guestCount - 1) })),
  setBookingNotes: (bookingNotes) => set({ bookingNotes }),
  resetBooking: () =>
    set({
      bookingOpen: false,
      selectedTableId: null,
      bookingDate: todayLabel(),
      bookingTime: '7:00 PM',
      guestCount: 2,
      bookingNotes: '',
    }),

  // Derived helper (not reactive by itself — call inside components/selectors)
  getSelectedTable: () => {
    const { selectedTableId } = get();
    return TABLES.find((t) => t.id === selectedTableId) ?? null;
  },

  // ── Cart / order drawer state ──
  cartOpen: false,
  cartItems: [], // { id, name, price, qty, image? }

  setCartOpen: (cartOpen) => set({ cartOpen }),
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),

  addToOrder: (dish) =>
    set((s) => {
      if (!dish?.id) return s;
      const existing = s.cartItems.find((i) => i.id === dish.id);
      if (existing) {
        return {
          cartItems: s.cartItems.map((i) =>
            i.id === dish.id ? { ...i, qty: i.qty + (dish.qty ?? 1) } : i
          ),
        };
      }
      return {
        cartItems: [
          ...s.cartItems,
          {
            id: dish.id,
            name: dish.name ?? dish.id,
            price: Number(dish.price) || 0,
            qty: dish.qty ?? 1,
            image: dish.image,
          },
        ],
      };
    }),
  removeFromOrder: (id) =>
    set((s) => ({ cartItems: s.cartItems.filter((i) => i.id !== id) })),
  setItemQty: (id, qty) =>
    set((s) => ({
      cartItems:
        qty <= 0
          ? s.cartItems.filter((i) => i.id !== id)
          : s.cartItems.map((i) => (i.id === id ? { ...i, qty } : i)),
    })),
  clearCart: () => set({ cartItems: [] }),

  getCartCount: () => get().cartItems.reduce((n, i) => n + i.qty, 0),
  getCartTotal: () =>
    get().cartItems.reduce((sum, i) => sum + i.price * i.qty, 0),

  // ── Menu inspector state (2D filters ↔ Menu3D) ──
  menuCategory: 'All',
  selectedDishId: 'wagyu',
  setMenuCategory: (menuCategory) => set({ menuCategory }),
  setSelectedDishId: (selectedDishId) => set({ selectedDishId }),
}));

export default useStore;
