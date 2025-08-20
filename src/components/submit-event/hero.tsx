// src/components/submit-event/hero.tsx
"use client";

import { motion } from "framer-motion";

export function Hero() {
  return (
    <div className="text-center py-24 sm:py-32">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold tracking-tight text-white sm:text-6xl"
      >
        Share Amazing Tech Events
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-6 text-lg leading-8 text-slate-300 max-w-2xl mx-auto"
      >
        Help fellow developers in Mumbai discover workshops, conferences, meetups, and networking events. Your submission powers our community.
      </motion.p>
    </div>
  );
}
