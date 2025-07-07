"use client";

import { motion } from "motion/react";
import {
  Car,
  Wifi,
  Activity,
  MapPin,
  Clock,
  Smartphone,
  ArrowRight,
  Shield,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  if (status === "loading" || session) {
    return null; // or a spinner if you want
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

            <Link href="/auth">
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-gradient-to-r from-slate-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:shadow-lg transition-all duration-300"
              >
                Get Started
              </motion.button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-800 mb-6"
            >
              Smart Parking
              <span className="block bg-gradient-to-r from-slate-600 to-blue-600 bg-clip-text text-transparent">
                Intelligence
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg sm:text-xl text-slate-600 mb-8 max-w-2xl mx-auto"
            >
              Real-time parking information powered by IoT sensors. Know exactly
              when spots become available without any bookings or reservations.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              <Link href="/auth">
                <button className="bg-gradient-to-r from-slate-600 to-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 flex items-center space-x-2 group">
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <button className="border-2 border-slate-300 text-slate-700 px-8 py-4 rounded-full text-lg font-semibold hover:border-blue-600 hover:text-blue-600 transition-all duration-300">
                Learn More
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="relative max-w-md mx-auto"
            >
              <div className="bg-white rounded-3xl shadow-2xl p-6 border border-slate-100">
                <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-slate-700">
                        IoT Active
                      </span>
                    </div>
                    <Activity className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-3 shadow-sm border-l-4 border-green-500">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Car className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">Spot A1</p>
                          <p className="text-sm text-slate-500">
                            Available • 2 min ago
                          </p>
                        </div>
                        <div className="ml-auto">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm border-l-4 border-red-500">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <Car className="w-4 h-4 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">Spot A2</p>
                          <p className="text-sm text-slate-500">
                            Occupied • 15 min ago
                          </p>
                        </div>
                        <div className="ml-auto">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="w-16 h-1 bg-slate-200 rounded-full"></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Our IoT sensors detect vehicle presence in real-time, providing
              instant parking information without any user interaction required.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Wifi,
                title: "IoT Sensors",
                description:
                  "Motion sensors detect vehicle presence and absence in parking spots automatically.",
                color: "blue",
              },
              {
                icon: Activity,
                title: "Real-time Data",
                description:
                  "Instant updates when vehicles enter or leave parking spaces.",
                color: "green",
              },
              {
                icon: Eye,
                title: "Live Monitoring",
                description:
                  "See exactly which spots are available and which are occupied in real-time.",
                color: "purple",
              },
              {
                icon: MapPin,
                title: "Location Aware",
                description:
                  "Know the exact location of available spots relative to your destination.",
                color: "indigo",
              },
              {
                icon: Clock,
                title: "Time Tracking",
                description:
                  "See how long spots have been available or occupied.",
                color: "slate",
              },
              {
                icon: Shield,
                title: "Privacy First",
                description:
                  "No personal data collected - just parking space availability information.",
                color: "emerald",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-lg transition-all duration-300 group"
              >
                <div
                  className={`w-12 h-12 bg-gradient-to-r from-${feature.color}-500 to-${feature.color}-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">
              Simple & Smart
            </h2>
            <p className="text-lg text-slate-600">
              No accounts, no bookings, no hassle. Just pure parking
              intelligence.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Sensors Detect",
                description:
                  "IoT motion sensors automatically detect when vehicles enter or leave parking spots.",
              },
              {
                step: "02",
                title: "Data Updates",
                description:
                  "Real-time availability data is instantly updated in our system.",
              },
              {
                step: "03",
                title: "You See",
                description:
                  "Open the app and see exactly which spots are available right now.",
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-slate-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">
                    {step.step}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">
                  {step.title}
                </h3>
                <p className="text-slate-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-slate-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold text-white mb-6"
          >
            Ready to Experience Smart Parking?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl text-slate-200 mb-8"
          >
            Join the future of parking intelligence. No accounts needed, just
            pure information.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/auth">
              <button className="bg-white text-slate-700 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 flex items-center space-x-2 group">
                <Smartphone className="w-5 h-5" />
                <span>Get Started</span>
              </button>
            </Link>
            <button className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-slate-700 transition-all duration-300">
              View Demo
            </button>
          </motion.div>
        </div>
      </section>

      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 sm:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-slate-400 to-blue-400 rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Neopark</span>
            </div>
            <p className="text-slate-400 text-sm">
              © 2024 Neopark. Smart parking intelligence powered by IoT.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
