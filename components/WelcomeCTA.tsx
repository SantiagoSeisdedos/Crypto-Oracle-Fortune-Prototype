"use client";

import { motion } from "framer-motion";
import { Sparkles, Wallet, MessageSquare, TrendingUp, Zap } from "lucide-react";

export function WelcomeCTA() {
  const features = [
    {
      icon: Wallet,
      title: "Connect Your Wallet",
      description: "Link your Web3 wallet to discover your crypto holdings",
    },
    {
      icon: Sparkles,
      title: "AI-Powered Insights",
      description: "Get mystical fortunes and insights based on your portfolio",
    },
    {
      icon: MessageSquare,
      title: "Chat with Oracle",
      description: "Ask questions about your crypto destiny and get guidance",
    },
    {
      icon: TrendingUp,
      title: "Multi-Chain Support",
      description: "View tokens across Ethereum, Polygon, Arbitrum, and more",
    },
  ];

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] sm:min-h-[calc(100vh-250px)] w-full p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl w-full"
      >
        {/* Main Card */}
        <div className="relative overflow-hidden bg-linear-to-br from-slate-900/90 via-purple-900/40 to-slate-900/90 border border-purple-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-2xl">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-linear-to-r from-purple-600/10 via-blue-600/10 to-purple-600/10 animate-pulse" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            {/* Header Section */}
            <div className="text-center mb-6 sm:mb-8 md:mb-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-linear-to-br from-purple-600 to-blue-600 mb-4 sm:mb-6 shadow-lg"
              >
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl sm:text-xl md:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 px-2 sm:px-0 bg-linear-to-r from-purple-300 via-blue-300 to-purple-300 bg-clip-text text-transparent"
              >
                Welcome to Crypto Oracle
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed px-2 sm:px-0"
              >
                Discover your blockchain destiny with AI-powered insights. Connect
                your wallet to receive mystical fortunes and personalized crypto
                guidance based on your portfolio.
              </motion.p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-5 mb-6 sm:mb-8 md:mb-10">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="bg-slate-800/50 border border-purple-500/20 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 hover:border-purple-500/40 transition-all group"
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-linear-to-br from-purple-600/30 to-blue-600/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-semibold text-purple-200 mb-1.5 sm:mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="text-center"
            >
              <div className="inline-flex flex-col items-center gap-1 sm:gap-2">
                <p className="text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2 px-2 sm:px-0">
                  Ready to discover your crypto destiny?
                </p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative w-full sm:w-auto"
                >
                  <div className="absolute inset-0 bg-linear-to-r from-purple-600 to-blue-600 rounded-lg sm:rounded-xl blur-lg opacity-50" />
                  <button
                    onClick={() => {
                      // Scroll to header where wallet connect button is
                      const header = document.querySelector("header") || 
                                    document.querySelector('[data-header]') ||
                                    document.body.firstElementChild;
                      if (header) {
                        header.scrollIntoView({ behavior: "smooth", block: "start" });
                        // After scrolling, try to click the connect button
                        setTimeout(() => {
                          // Try to find and click RainbowKit's connect button
                          const connectButton = document.querySelector(
                            'button[data-testid="rk-connect-button"], button[class*="rk-connect-button"], [aria-label*="connect" i]'
                          ) as HTMLElement;
                          if (connectButton) {
                            connectButton.click();
                          }
                        }, 500);
                      }
                    }}
                    className="relative w-full sm:w-auto cursor-pointer bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold px-4 py-3 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg transition-all shadow-lg flex items-center justify-center gap-2 sm:gap-3"
                  >
                    <Wallet className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                    <span className="hidden sm:inline">
                      Connect Your Wallet to Begin
                    </span>
                    <span className="sm:hidden">
                      Connect Wallet
                    </span>
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 hidden sm:inline" />
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-4 sm:mt-6 md:mt-8 text-center px-2 sm:px-0"
        >
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
            Your wallet connection is secure and private. We never store your
            private keys or personal data.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
