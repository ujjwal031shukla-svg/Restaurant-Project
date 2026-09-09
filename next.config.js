/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three'],
  webpack(config) {
    // Support .glb / .gltf / .hdr / .bin imports as static assets
    // Required for R3F GLTFLoader / Environment HDRI pipeline.
    // Keeps individual models compressible (<2MB Draco) and bundle <10MB via code-splitting.
    config.module.rules.push({
      test: /\.(glb|gltf|hdr|bin)$/i,
      type: 'asset/resource',
    });
    return config;
  },
};

module.exports = nextConfig;
