// src/components/submit-event/features-grid.tsx
"use client";

import { motion } from "framer-motion";
import { UploadCloud, CheckCircle, Rocket, MessageSquareShare } from "lucide-react";
import React from 'react';

const features = [
  {
    name: "Submit URL",
    description: "Paste any public event link from platforms like Meetup, Luma, Eventbrite, and more.",
    icon: UploadCloud,
  },
  {
    name: "Admin Review",
    description: "Our team verifies each submission to ensure it meets our quality standards for the community.",
    icon: CheckCircle,
  },
  {
    name: "Auto-Publish",
    description: "Approved events are automatically published with enriched content and custom graphics.",
    icon: Rocket,
  },
  {
    name: "Social Ready",
    description: "We generate promotional content for WhatsApp and other social media to maximize reach.",
    icon: MessageSquareShare,
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.5,
      ease: "easeOut",
    },
  }),
};

export function FeaturesGrid() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, i) => (
          <motion.div
            key={feature.name}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            className="flex flex-col items-center text-center p-6 rounded-xl bg-slate-800/50 border border-slate-700/50"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600/20 text-purple-400">
              <feature.icon className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-semibold leading-7 text-white">{feature.name}</h3>
            <p className="mt-2 text-base leading-7 text-slate-400">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
