
// src/components/submit-event/submit-form.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Link as LinkIcon, Loader2, CheckCircle, AlertCircle, PartyPopper, Clipboard, Share2 } from "lucide-react";
import { platformIcons, detectPlatform } from "./platform-icons";
import Confetti from 'react-confetti';
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";


type FormData = {
  eventUrl: string;
};

type SuccessState = {
    eventUrl: string;
    whatsappMessage: string;
};

const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return url.includes('http');
  } catch (e) {
    return false;
  }
};


export function SubmitForm() {
  const { register, handleSubmit, watch, formState: { errors, isValid } } = useForm<FormData>({mode: 'onChange'});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successState, setSuccessState] = useState<SuccessState | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const { toast } = useToast();

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


  const onSubmit = async (data: FormData) => {
    setStatus("loading");
    setErrorMessage(null);
    try {
        const response = await fetch('/api/submit-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: data.eventUrl }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
            setSuccessState({
                eventUrl: result.eventUrl,
                whatsappMessage: result.whatsappMessage
            });
            setStatus("success");
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 8000);
        } else {
            throw new Error(result.error || 'Submission failed');
        }
    } catch (error) {
        console.error("Submission error:", error);
        setErrorMessage((error as Error).message || "Could not submit the URL. Please try again.");
        setStatus("error");
        toast({ title: "Submission Failed", description: (error as Error).message, variant: 'destructive' });
    }
  };
  
  const resetForm = () => {
    setStatus("idle");
    setSuccessState(null);
    setErrorMessage(null);
  }

  const copyToClipboard = () => {
    if (successState?.whatsappMessage) {
        navigator.clipboard.writeText(successState.whatsappMessage);
        toast({
            title: "Copied to clipboard!",
            description: "WhatsApp message template is ready to be pasted.",
        });
    }
  }

  const handleShare = async () => {
     if (successState?.whatsappMessage) {
        try {
        if (navigator.share) {
            await navigator.share({
            title: "New Event on मुंबई Event Techies",
            text: successState.whatsappMessage,
            });
        } else {
            copyToClipboard();
        }
        } catch (error) {
            console.error("Error sharing:", error);
            copyToClipboard(); // Fallback to copy
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

  if (status === 'success' && successState) {
    return (
        <motion.div 
            className="text-center bg-slate-800/50 border border-purple-500/30 rounded-xl p-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} />}
            <PartyPopper className="w-16 h-16 mx-auto text-purple-400 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Event Published! 🎉</h2>
            <p className="text-slate-300 mb-6">The event is now live. Share the good news with the community!</p>
            <Button asChild>
                <Link href={successState.eventUrl} target="_blank">View Your Event</Link>
            </Button>

            <div className="my-8 text-left bg-slate-900/70 p-4 rounded-lg border border-slate-700">
                <h3 className="text-lg font-bold text-white mb-3">Share on WhatsApp:</h3>
                <div className="bg-white rounded-lg p-3 border shadow-sm">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                        {successState.whatsappMessage}
                    </pre>
                </div>
                 <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  <motion.button
                      onClick={copyToClipboard}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                      <Clipboard className="w-4 h-4" /> Copy
                  </motion.button>
                   <motion.button
                      onClick={handleShare}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                      <Share2 className="w-4 h-4" /> Share
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
        className="flex flex-col sm:flex-row gap-4 items-center"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="relative w-full">
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
              placeholder="🔗 Paste your event URL here..."
              className="w-full h-16 pl-12 pr-4 py-2 text-lg text-white bg-slate-800/50 border-2 border-slate-700/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-300 ease-in-out backdrop-blur-sm"
              aria-invalid={errors.eventUrl ? "true" : "false"}
            />
        </div>
        <motion.button
          type="submit"
          disabled={status === "loading" || !isValid}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full sm:w-auto px-6 py-2.5 h-16 font-semibold text-white bg-gradient-to-r from-purple-600 to-orange-500 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ease-in-out hover:from-purple-700 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        >
          {renderStatus()}
        </motion.button>
      </motion.div>
      <AnimatePresence>
        {errors.eventUrl && (
          <motion.p 
            className="mt-2 text-sm text-orange-400 text-center sm:text-left" 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            role="alert"
          >
            Please enter a valid event URL.
          </motion.p>
        )}
        {status === 'error' && errorMessage && (
            <motion.p
                className="mt-2 text-sm text-red-400 text-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                role="alert"
            >
                {errorMessage}
            </motion.p>
        )}
      </AnimatePresence>
      <p className="text-center mt-8 text-slate-400 text-sm">
        1,247 events submitted this month | 50+ active organizers | 10k+ attendees reached
      </p>
    </form>
  );
}
