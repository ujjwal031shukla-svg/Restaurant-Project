3d-restaurant-website/
├── public/
│   ├── models/           # Compressed .glb / .gltf 3D assets
│   ├── textures/         # HDRI maps and material textures
│   └── images/           # Static fallback image assets
├── src/
│   ├── app/              # Next.js App Router (pages and layouts)
│   ├── components/
│   │   ├── 3d/           # Canvas, Lights, Camera, and 3D Models
│   │   └── ui/           # 2D overlays (Header, Booking Drawer, Footer)
│   ├── hooks/            # Custom hooks (e.g., Performance / GPU check)
│   ├── store/            # Zustand store (booking state, cart, scroll status)
│   └── styles/           # Tailwind and global CSS styles
├── requirement.md        # Software Requirement Specifications (SRS)
├── package.json          # Dependencies and scripts
└── README.md             # Project documentation