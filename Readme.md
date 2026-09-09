# 🍽️ Interactive 3D Scroll-Driven Restaurant Web Application

An immersive, high-performance 3D web application built using **Next.js**, **React Three Fiber (R3F)**, **Three.js**, and **Tailwind CSS**. The website offers an interactive dining preview where users navigate through 3D food showcases, interactive floor-plan table bookings, and dynamic menus using smooth scroll-based camera movements.

---

## ✨ Features

- **🌀 Scroll-Driven 3D Storytelling:** Smooth camera pathways along 3D scenes synchronized with vertical scroll.
- **🍱 Interactive Dish Showcase:** Photorealistic 3D food models with rotating, zoomable, and expanding component views.
- **🪑 3D Table Booking System:** Interactive 3D restaurant layout allowing users to select tables visually to initiate reservations.
- **📜 Dynamic 3D Menu:** Interactive dish carousel with 360° inspection and dietary filters.
- **📱 Responsive & GPU-Aware:** Built to detect hardware capabilities and adjust render quality automatically for mobile and lower-end devices.
- **⚡ Fast Asset Loading:** Pre-compressed `.glb`/`.gltf` 3D models utilizing Draco compression and progressive asset preloading.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router) / React 18+
- **3D Graphics Engine:** [Three.js](https://threejs.org/)
- **React 3D Renderer:** [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber/)
- **3D Helpers & Utilities:** [@react-three/drei](https://github.com/pmndrs/drei)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/) / GSAP
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **3D Asset Preparation:** [Blender](https://www.blender.org/) (Draco GLTF Exporter)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher (or `pnpm` / `yarn`)

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/ujjwal031shukla-svg/Restaurant-Project.git](https://github.com/ujjwal031shukla-svg/Restaurant-Project.git)
   cd 3d-restaurant-website