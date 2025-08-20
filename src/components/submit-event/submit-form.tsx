// src/components/submit-event/submit-form.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Link, Loader2, CheckCircle, AlertCircle, PartyPopper } from "lucide-react";
import { platformIcons, detectPlatform } from "./platform-icons";
import Confetti from 'react-confetti';

type FormData = {
  eventUrl: string;
};

// A simple client-side URL validation
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return url.includes('http');
  } catch (e) {
    return false;
  }
};


export function SubmitForm() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  const eventUrl = watch("eventUrl", "");
  const platform = detectPlatform(eventUrl);

  useEffect(() => {
    const handleResize = () => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
}, []);


  const onSubmit = (data: FormData) => {
    setStatus("loading");
    // Simulate API call
    setTimeout(() => {
      if (isValidUrl(data.eventUrl)) {
        setStatus("success");
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 8000); // Stop confetti after 8s
      } else {
        setStatus("error");
      }
    }, 2000);
  };
  
  const resetForm = () => {
    setStatus("idle");
  }

  const renderStatus = () => {
    switch (status) {
        case "loading": return <Loader2 className="animate-spin" />;
        case "success": return <CheckCircle className="text-green-400" />;
        case "error": return <AlertCircle className="text-red-400" />;
        default: return "Submit for Review";
    }
  }

  if (status === 'success') {
    return (
        <motion.div 
            className="text-center bg-slate-800/50 border border-purple-500/30 rounded-xl p-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} />}
            <PartyPopper className="w-16 h-16 mx-auto text-purple-400 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Event Submitted Successfully! 🎉</h2>
            <p className="text-slate-300 mb-6">Our admin team will review and approve it within 24 hours.</p>
            <motion.button
                onClick={resetForm}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
                Submit Another Event
            </motion.button>
        </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto">
      <motion.div 
        className="relative"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
            <AnimatePresence>
                <motion.div
                    key={platform}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="w-6 h-6"
                >
                    {platformIcons[platform]}
                </motion.div>
            </AnimatePresence>
        </div>
        <input
          {...register("eventUrl", { required: true, validate: isValidUrl })}
          placeholder="🔗 Paste your event URL here (e.g., meetup.com, lu.ma...)"
          className="w-full h-16 pl-12 pr-40 py-2 text-lg text-white bg-slate-800/50 border-2 border-slate-700/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-300 ease-in-out backdrop-blur-sm"
          aria-invalid={errors.eventUrl ? "true" : "false"}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <motion.button
              type="submit"
              disabled={status === "loading"}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2.5 font-semibold text-white bg-gradient-to-r from-purple-600 to-orange-500 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 ease-in-out hover:from-purple-700 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {renderStatus()}
            </motion.button>
        </div>
      </motion.div>
      <AnimatePresence>
        {errors.eventUrl && (
          <motion.p 
            className="mt-2 text-sm text-orange-400" 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            role="alert"
          >
            Please enter a valid event URL.
          </motion.p>
        )}
      </AnimatePresence>
      <p className="text-center mt-8 text-slate-400 text-sm">
        1,247 events submitted this month | 50+ active organizers | 10k+ attendees reached
      </p>
    </form>
  );
}
