import type { NextConfig } from "next";

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

/** @type {NextConfig} */
const nextConfig = {
  images: {
    domains: ['safwzkcdomnvlggzxjdr.supabase.co'], // ✅ autorise les images Supabase Storage
  },
  // 👉 ajoute d'autres options ici si besoin plus tard (reactStrictMode, etc.)
};

module.exports = withPWA(nextConfig);
