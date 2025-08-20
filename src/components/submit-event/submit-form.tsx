// src/components/submit-event/submit-form.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Link as LinkIcon, Loader2, CheckCircle, AlertCircle, PartyPopper, Clipboard, Share2 } from "lucide-react";
import { platformIcons, detectPlatform } from "./platform-icons";
import Confetti from 'react-confetti';
import { useToast } from "@/hooks/use-toast";


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
  const { toast } = useToast();

  const eventUrl = watch("eventUrl", "");
  const platform = detectPlatform(eventUrl);

  // Mock event data for template
   const mockEventDetails = {
    title: "OnlyDevs - Solana Developer Gathering",
    date: "Sat, Oct 4 • 10:00 AM",
    location: "Sofitel Mumbai BKC"
  };

  const generateTemplateMessage = (eventData: typeof mockEventDetails) => {
    const eventSlug = (eventData.title || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, '')
      + '-mumbai-' + new Date().toLocaleString('default', { month: 'short' }).toLowerCase() + '-' + new Date().getFullYear();
  
    const websiteUrl = `https://mumbai-event-techies.vercel.app/events/${eventSlug}`;
  
    return `🚀 *मुंबई Event Techies* presents

*${eventData.title}*

📅 ${eventData.date}
📍 ${eventData.location}

Curated by मुंबई Event Techies community for Mumbai's tech enthusiasts! 

👆 Tap to view full details, register & connect with fellow developers

${websiteUrl}

#MumbaiTech #EventTechies #TechCommunity`;
  };

  const whatsAppMessage = generateTemplateMessage(mockEventDetails);


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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(whatsAppMessage);
    toast({
        title: "Copied to clipboard!",
        description: "WhatsApp message template is ready to be pasted.",
    });
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "New Event Submission Template",
          text: whatsAppMessage,
        });
      } else {
        copyToClipboard();
        toast({
            title: "Share Not Supported",
            description: "Copied to clipboard instead.",
            variant: "default"
        });
      }
    } catch (error) {
        if (error instanceof DOMException && error.name === 'NotAllowedError') {
            copyToClipboard();
            toast({
                title: "Sharing Cancelled",
                description: "Copied to clipboard instead.",
                variant: "default",
            });
        } else {
            console.error("Error sharing:", error);
            toast({
                title: "Error",
                description: "Could not share the template.",
                variant: "destructive",
            });
        }
    }
  };

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

            <div className="my-8 text-left bg-slate-900/70 p-4 rounded-lg border border-slate-700">
                <h3 className="text-lg font-bold text-white mb-3">WhatsApp Post Template</h3>
                <div className="bg-white rounded-lg p-3 border shadow-sm">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                        {whatsAppMessage}
                    </pre>
                </div>
                <p className="text-xs text-green-600 mt-2 text-center">
                  This message will be auto-generated once admin approves your event!
                </p>
                <div className="flex gap-2 mt-4">
                  <motion.button
                      onClick={copyToClipboard}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                      <Clipboard className="w-4 h-4" /> Copy Template
                  </motion.button>
                   <motion.button
                      onClick={handleShare}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                      <Share2 className="w-4 h-4" /> Share Template
                  </motion.button>
                </div>
            </div>

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
