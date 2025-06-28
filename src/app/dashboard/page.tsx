"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "motion/react";
import {
  Car,
  Activity,
  MapPin,
  Clock,
  Shield,
  LogOut,
  User,
} from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-r from-slate-600 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Car className="w-5 h-5 text-white" />
          </div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
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

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-slate-600" />
                <span className="text-sm text-slate-700">
                  {session.user?.name}
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Sign Out</span>
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">
              Welcome back,
              <span className="block bg-gradient-to-r from-slate-600 to-blue-600 bg-clip-text text-transparent">
                {session.user?.name}
              </span>
            </h1>
            <p className="text-slate-600">
              Here&apos;s your real-time parking intelligence dashboard
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800">
                  IoT System
                </h3>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Sensors</span>
                  <span className="font-semibold text-slate-800">
                    24/7 Online
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Coverage</span>
                  <span className="font-semibold text-slate-800">
                    100% Active
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Last Update</span>
                  <span className="font-semibold text-slate-800">
                    2 min ago
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800">
                  Parking Overview
                </h3>
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Spots</span>
                  <span className="font-semibold text-slate-800">156</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Available</span>
                  <span className="font-semibold text-green-600">23</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Occupied</span>
                  <span className="font-semibold text-red-600">133</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800">
                  Quick Actions
                </h3>
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              <div className="space-y-3">
                <button className="w-full bg-gradient-to-r from-slate-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-300">
                  View All Spots
                </button>
                <button className="w-full border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:border-blue-300 hover:text-blue-600 transition-all duration-300">
                  Analytics
                </button>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-12 text-center"
          >
            <div className="bg-white/50 rounded-2xl p-8 border border-slate-100">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">
                🚀 Dashboard Coming Soon
              </h3>
              <p className="text-slate-600 mb-6">
                We&apos;re building your personalized parking intelligence
                dashboard. Soon you&apos;ll have access to real-time parking
                data, analytics, and more.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {[
                  { icon: Activity, text: "Real-time Updates" },
                  { icon: MapPin, text: "Location Tracking" },
                  { icon: Clock, text: "Time Analytics" },
                  { icon: Shield, text: "Secure Access" },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 text-slate-600"
                  >
                    <feature.icon className="w-4 h-4" />
                    <span className="text-sm">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
