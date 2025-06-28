"use client";

import { motion } from "motion/react";
import {
  Car,
  Wifi,
  Activity,
  MapPin,
  Clock,
  Shield,
  Eye,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function AuthPage() {
  function handleGoogleSignIn() {
    console.log("Google sign in clicked");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-slate-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Car className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-slate-700 to-blue-700 bg-clip-text text-transparent">
                  Neopark
                </span>
              </motion.div>
            </Link>

            <Link href="/">
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back</span>
              </motion.button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">
              Welcome to
              <span className="block bg-gradient-to-r from-slate-600 to-blue-600 bg-clip-text text-transparent">
                Neopark
              </span>
            </h1>
            <p className="text-slate-600">
              Sign in to access real-time parking intelligence
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100 mb-8"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleSignIn}
              className="w-full bg-white border-2 border-slate-200 text-slate-700 px-6 py-4 rounded-xl font-semibold hover:border-blue-300 hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-3 group"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continue with Google</span>
            </motion.button>

            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-slate-200"></div>
              <span className="px-4 text-sm text-slate-500">or</span>
              <div className="flex-1 border-t border-slate-200"></div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-slate-600 to-blue-600 text-white px-6 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-3 group"
            >
              <Eye className="w-5 h-5" />
              <span>Try Demo Mode</span>
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white/50 rounded-2xl p-6 border border-slate-100 mb-8"
          >
            <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center">
              What you&apos;ll get access to:
            </h3>
            <div className="space-y-3">
              {[
                {
                  icon: Activity,
                  text: "Real-time parking availability",
                  color: "text-green-600",
                },
                {
                  icon: MapPin,
                  text: "Live location tracking",
                  color: "text-blue-600",
                },
                {
                  icon: Clock,
                  text: "Time-based analytics",
                  color: "text-purple-600",
                },
                {
                  icon: Shield,
                  text: "Secure data access",
                  color: "text-emerald-600",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <div className={`w-6 h-6 ${feature.color}`}>
                    <feature.icon className="w-full h-full" />
                  </div>
                  <span className="text-slate-700">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-6 border border-slate-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-slate-700">
                  IoT System Active
                </span>
              </div>
              <Wifi className="w-4 h-4 text-blue-600" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Sensors", value: "24/7", status: "Online" },
                { label: "Spots", value: "156", status: "Monitored" },
                { label: "Updates", value: "Real-time", status: "Live" },
                { label: "Coverage", value: "100%", status: "Active" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                  className="bg-white rounded-lg p-3 text-center border border-slate-100"
                >
                  <div className="text-xs text-slate-500 mb-1">
                    {stat.label}
                  </div>
                  <div className="text-lg font-semibold text-slate-800">
                    {stat.value}
                  </div>
                  <div className="text-xs text-green-600 font-medium">
                    {stat.status}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 left-10 opacity-10"
        >
          <Car className="w-8 h-8 text-slate-400" />
        </motion.div>

        <motion.div
          animate={{
            y: [0, 15, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute top-40 right-8 opacity-10"
        >
          <Car className="w-6 h-6 text-blue-400" />
        </motion.div>

        <motion.div
          animate={{
            y: [0, -10, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-40 left-8 opacity-10"
        >
          <MapPin className="w-6 h-6 text-slate-400" />
        </motion.div>

        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-60 left-20"
        >
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        </motion.div>

        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-60 right-16"
        >
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        </motion.div>
      </div>

      <div className="fixed bottom-4 left-4 right-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="bg-white/80 backdrop-blur-md rounded-xl p-4 border border-slate-200 text-center"
        >
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Shield className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-slate-700">
              Secure Authentication
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Your data is protected with enterprise-grade security
          </p>
        </motion.div>
      </div>
    </div>
  );
}
