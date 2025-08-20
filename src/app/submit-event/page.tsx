// src/app/submit-event/page.tsx
"use client";

import * as React from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/submit-event/hero";
import { SubmitForm } from "@/components/submit-event/submit-form";
import { FeaturesGrid } from "@/components/submit-event/features-grid";
import { motion } from "framer-motion";
import { Code, GitBranch, Zap } from "lucide-react";

// Floating icons in the background
const FloatingIcons = () => {
    const icons = [
        { icon: <Code />, className: "top-1/4 left-1/4" },
        { icon: <Zap />, className: "top-1/3 right-1/4" },
        { icon: <GitBranch />, className: "bottom-1/4 left-1/3" },
        { icon: <Code />, className: "bottom-1/3 right-1/3" }
    ];

    return (
        <div className="absolute inset-0 overflow-hidden -z-10">
            {icons.map((item, index) => (
                <motion.div
                    key={index}
                    className={`absolute text-slate-700/50 ${item.className}`}
                    initial={{ opacity: 0, scale: 0.5, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                        delay: index * 0.2,
                        duration: 1.5,
                        repeat: Infinity,
                        repeatType: "mirror",
                        ease: "easeInOut"
                    }}
                >
                    {React.cloneElement(item.icon, { className: "w-16 h-16" })}
                </motion.div>
            ))}
        </div>
    );
};

export default function SubmitEventPage() {
    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#0F172A] to-[#1E293B] text-white">
            <Header />
            <main className="flex-1">
                <div className="relative isolate overflow-hidden">
                    <FloatingIcons />
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Hero />
                        <div className="container py-16 sm:py-24">
                            <SubmitForm />
                            <div className="my-16 text-center">
                                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                    How It Works
                                </h2>
                                <p className="mt-4 text-lg leading-8 text-slate-400">
                                    From submission to promotion, we make it seamless.
                                </p>
                            </div>
                            <FeaturesGrid />
                        </div>
                    </motion.div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
