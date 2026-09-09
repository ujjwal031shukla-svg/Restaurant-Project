// Shared menu catalogue — consumed by Menu3D (Step 4) and menu overlays (Step 5).
// `accent` drives the procedural placeholder mesh; `modelUrl` points at a
// Draco-compressed .glb in /public/models. Drop `public/models/<id>.glb` in
// place and DishModel picks it up automatically — missing files fall back
// to the procedural mesh, so no code changes are needed either way.
export const CATEGORIES = ['All', 'Starters', 'Mains', 'Desserts', 'Drinks'];

const modelUrl = (id) => `/models/${id}.glb`;

export const DISHES = [
  {
    id: 'salmon',
    modelUrl: modelUrl('salmon'),
    name: 'Glacier Salmon',
    desc: 'Hibiscus salt cure, yuzu spheres, pine-smoked.',
    price: 46,
    category: 'Starters',
    tags: ['Gluten-Free'],
    sourcing: 'Tromsø',
    accent: '#f5bc7c',
    shape: 'sashimi',
  },
  {
    id: 'burrata',
    modelUrl: modelUrl('burrata'),
    name: 'Ember Burrata',
    desc: 'Charred citrus, basil oil, smoked sea salt.',
    price: 28,
    category: 'Starters',
    tags: ['Vegetarian'],
    sourcing: 'Puglia',
    accent: '#e8d9c0',
    shape: 'sphere',
  },
  {
    id: 'wagyu',
    modelUrl: modelUrl('wagyu'),
    name: 'Truffle Infused Wagyu',
    desc: 'A5 Miyazaki, marrow jus, 36-mo truffle pearls.',
    price: 68,
    category: 'Mains',
    tags: ['Gluten-Free', 'Signature'],
    sourcing: 'Miyazaki',
    accent: '#ffbe80',
    shape: 'box',
  },
  {
    id: 'agnolotti',
    modelUrl: modelUrl('agnolotti'),
    name: 'Truffle Agnolotti',
    desc: 'Norcia truffle, Parmigiano emulsion, brown butter.',
    price: 52,
    category: 'Mains',
    tags: ['Signature'],
    sourcing: 'Umbria',
    accent: '#e6a15c',
    shape: 'knot',
  },
  {
    id: 'cacao',
    modelUrl: modelUrl('cacao'),
    name: 'Gold Cacao Sphere',
    desc: '72% Ecuadorian cacao, vanilla core, 24k gold.',
    price: 38,
    category: 'Desserts',
    tags: ['Vegetarian'],
    sourcing: 'Atelier Lab',
    accent: '#eaa05b',
    shape: 'sphere',
  },
  {
    id: 'yuzu',
    modelUrl: modelUrl('yuzu'),
    name: 'Yuzu Cloud',
    desc: 'Frozen yuzu mousse, meringue shards, shiso.',
    price: 24,
    category: 'Desserts',
    tags: ['Vegan', 'Gluten-Free'],
    sourcing: 'Atelier Lab',
    accent: '#f0e0a0',
    shape: 'sphere',
  },
  {
    id: 'bourbon',
    modelUrl: modelUrl('bourbon'),
    name: 'Saffron Bourbon',
    desc: 'Smoked saffron, oak bourbon, orange oils.',
    price: 32,
    category: 'Drinks',
    tags: ['Artisan'],
    sourcing: 'Apothecary',
    accent: '#c46a1e',
    shape: 'glass',
  },
  {
    id: 'matcha',
    modelUrl: modelUrl('matcha'),
    name: 'Smoked Matcha',
    desc: 'Ceremonial matcha, pine smoke, oat silk.',
    price: 18,
    category: 'Drinks',
    tags: ['Vegan'],
    sourcing: 'Apothecary',
    accent: '#6a8a4a',
    shape: 'glass',
  },
];

// The three dishes on the storytelling spline (Step 4, Section 2).
export const SHOWCASE_IDS = ['wagyu', 'salmon', 'cacao'];

export function dishesByCategory(category) {
  if (!category || category === 'All') return DISHES;
  return DISHES.filter((d) => d.category === category);
}
