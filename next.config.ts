import type { NextConfig } from "next";

// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
  // Ton ancienne config ici (s'il y a des options, tu les laisses)
};

module.exports = withPWA(nextConfig);
