"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import {
  Radio,
  Wifi,
  WifiOff,
  Smartphone,
  Battery,
  Shield,
  Users,
  MapPin,
  AlertTriangle,
  Heart,
  Compass,
  Map,
  Flashlight,
  Volume2,
  Cloud,
  CloudOff,
  Bluetooth,
  Signal,
  Zap,
  RefreshCw,
  CheckCircle,
  Clock,
  Globe,
  ChevronDown,
  Github,
  Apple,
  Waves,
  Flame,
  Wind,
  Mountain,
  Droplets,
  Tornado,
} from "lucide-react";
import { useRef } from "react";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b border-card-border"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-critical via-warning to-safe flex items-center justify-center">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-critical rounded-full animate-pulse" />
          </div>
          <span className="font-bold text-xl tracking-tight">Aether SOS</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-muted">
          <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#platforms" className="hover:text-foreground transition-colors">Platforms</a>
          <a href="#technical" className="hover:text-foreground transition-colors">Technical</a>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs px-3 py-1.5 rounded-full bg-card border border-card-border text-muted">
            Alameda Hackathon 2025
          </span>
        </div>
      </div>
    </motion.nav>
  );
}

function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden mesh-gradient">
      {/* Animated background elements */}
      <motion.div style={{ y, opacity }} className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-critical/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-safe/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-warning/5 rounded-full blur-3xl" />
      </motion.div>

      {/* Signal waves animation */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute w-32 h-32 border-2 border-critical/30 rounded-full signal-wave"
            style={{ animationDelay: `${i * 1}s` }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          {/* SOS Button */}
          <div className="relative inline-flex items-center justify-center mb-8">
            <div className="absolute w-40 h-40 bg-critical/20 rounded-full pulse-ring" />
            <div className="absolute w-32 h-32 bg-critical/30 rounded-full pulse-ring" style={{ animationDelay: "0.5s" }} />
            <div className="relative w-24 h-24 bg-gradient-to-br from-critical to-red-700 rounded-full flex items-center justify-center glow-effect shadow-2xl shadow-critical/50">
              <span className="text-2xl font-black text-white tracking-wider">SOS</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
            <span className="gradient-text">When Internet Fails,</span>
            <br />
            <span className="text-foreground">Your Phone Saves Lives</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-xl md:text-2xl text-muted max-w-3xl mx-auto mb-8 leading-relaxed"
        >
          A peer-to-peer mesh network that turns every smartphone into a rescue beacon.
          <br />
          <span className="text-foreground font-semibold">Even if you don&apos;t need rescue, hold out your phone so SOS messages can pass through.</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-card-border">
            <Battery className="w-4 h-4 text-safe" />
            <span className="text-sm">24+ Hour Battery Life</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-card-border">
            <Shield className="w-4 h-4 text-accent" />
            <span className="text-sm">Secure & Encrypted</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-card-border">
            <Users className="w-4 h-4 text-warning" />
            <span className="text-sm">Everyone is a Hero</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="inline-flex flex-col items-center gap-4 px-8 py-6 rounded-2xl bg-card/50 border border-card-border backdrop-blur-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-mono">
              <span className="text-muted">Built with</span>
              <span className="px-2 py-1 rounded bg-accent/20 text-accent">Flutter + Dart</span>
            </div>
            <span className="text-card-border">|</span>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted">App Size</span>
              <span className="text-foreground font-semibold">&lt; 1GB</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <a href="#disasters" className="flex flex-col items-center gap-2 text-muted hover:text-foreground transition-colors">
            <span className="text-sm">Scroll to explore</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

function DisasterTypesSection() {
  const disasters = [
    { icon: Mountain, name: "Earthquakes", color: "text-amber-500" },
    { icon: Waves, name: "Tsunamis", color: "text-blue-500" },
    { icon: Flame, name: "Volcanic Eruptions", color: "text-orange-500" },
    { icon: Droplets, name: "Floods", color: "text-cyan-500" },
    { icon: Wind, name: "Hurricanes", color: "text-purple-500" },
    { icon: Tornado, name: "Tornadoes", color: "text-gray-400" },
    { icon: Flame, name: "Wildfires", color: "text-red-500" },
  ];

  return (
    <section id="disasters" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Built for <span className="gradient-text">Natural Disasters</span>
          </h2>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            When infrastructure fails, communication is critical. Aether SOS keeps you connected.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-4"
        >
          {disasters.map((disaster, index) => (
            <motion.div
              key={disaster.name}
              variants={fadeInUp}
              whileHover={{ scale: 1.05, y: -5 }}
              className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-card border border-card-border hover:border-card-border/50 transition-all cursor-default"
            >
              <disaster.icon className={`w-6 h-6 ${disaster.color}`} />
              <span className="font-medium">{disaster.name}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function AlertLevelsSection() {
  const levels = [
    {
      level: "Critical",
      code: "Red",
      color: "bg-critical",
      borderColor: "border-critical",
      textColor: "text-critical",
      icon: AlertTriangle,
      description: "Life-threatening emergency requiring immediate rescue",
      statusCode: "0x03",
    },
    {
      level: "Injured",
      code: "Yellow",
      color: "bg-warning",
      borderColor: "border-warning",
      textColor: "text-warning",
      icon: Heart,
      description: "Medical attention needed but not immediately life-threatening",
      statusCode: "0x02",
    },
    {
      level: "Safe",
      code: "Green",
      color: "bg-safe",
      borderColor: "border-safe",
      textColor: "text-safe",
      icon: CheckCircle,
      description: "No assistance needed - acting as a relay node",
      statusCode: "0x00",
    },
  ];

  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Three-Level <span className="gradient-text">Alert System</span>
          </h2>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            Simple, clear status codes that rescuers can prioritize instantly.
            <br />
            <span className="text-sm text-muted/70">User cannot edit messages - only status options</span>
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {levels.map((level, index) => (
            <motion.div
              key={level.code}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ y: -10 }}
              className={`relative p-8 rounded-3xl bg-card border-2 ${level.borderColor}/30 hover:${level.borderColor} transition-all`}
            >
              <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 ${level.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                <level.icon className="w-8 h-8 text-white" />
              </div>

              <div className="pt-8 text-center">
                <div className={`inline-block px-3 py-1 rounded-full ${level.color}/20 ${level.textColor} text-xs font-mono mb-4`}>
                  {level.statusCode}
                </div>
                <h3 className={`text-2xl font-bold mb-2 ${level.textColor}`}>{level.code}</h3>
                <p className="text-lg font-semibold mb-3">{level.level}</p>
                <p className="text-muted text-sm">{level.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      icon: WifiOff,
      title: "Internet Fails",
      description: "App detects when connection to the outside world is lost after multiple ping failures.",
      detail: "Smart Detection: Ping Google 3 times. If all fail, activate mesh mode.",
    },
    {
      icon: Radio,
      title: "Mesh Activates",
      description: "Your phone automatically switches to BLE mesh networking mode.",
      detail: "Bluetooth Low Energy: 100-400m range in open air",
    },
    {
      icon: Smartphone,
      title: "SOS Broadcast",
      description: "Trapped victims broadcast their status and GPS coordinates.",
      detail: "Packet: UUID | GPS | Status | Timestamp (17-20 bytes)",
    },
    {
      icon: Users,
      title: "Epidemic Routing",
      description: "Nearby phones silently relay messages through the mesh network.",
      detail: "Store-and-Forward: Every phone carries every message",
    },
    {
      icon: Cloud,
      title: "Cloud Sync",
      description: "When any phone regains internet, all stored SOS messages upload automatically.",
      detail: "Acknowledgment system prevents infinite propagation",
    },
  ];

  return (
    <section id="how-it-works" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            How <span className="gradient-text">Mesh Networking</span> Works
          </h2>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            Everyone becomes a node in a life-saving network. Your phone is a bridge.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-critical via-warning to-safe opacity-30" />

          <div className="grid lg:grid-cols-5 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-card border border-card-border flex items-center justify-center relative z-10">
                      <step.icon className="w-8 h-8 text-foreground" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-critical via-warning to-safe flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-muted text-sm mb-3">{step.description}</p>
                  <p className="text-xs font-mono text-muted/70 px-3 py-2 rounded-lg bg-card border border-card-border">
                    {step.detail}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Visual mesh demonstration */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 p-8 rounded-3xl bg-card border border-card-border"
        >
          <div className="grid md:grid-cols-3 gap-8 items-center">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-critical/20 text-critical text-sm font-mono mb-4">
                <AlertTriangle className="w-4 h-4" />
                Phone A (Trapped)
              </div>
              <p className="text-muted text-sm">Posts SOS with GPS coordinates. Broadcasts signal continuously.</p>
            </div>

            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-critical/20 border border-critical flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-critical" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="h-0.5 w-16 bg-gradient-to-r from-critical to-warning" />
                    <RefreshCw className="w-4 h-4 text-warning mx-auto" />
                    <div className="h-0.5 w-16 bg-gradient-to-r from-warning to-safe" />
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-warning/20 border border-warning flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-warning" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="h-0.5 w-16 bg-gradient-to-r from-warning to-safe" />
                    <Wifi className="w-4 h-4 text-safe mx-auto" />
                    <div className="h-0.5 w-16 bg-safe" />
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-safe/20 border border-safe flex items-center justify-center">
                    <Cloud className="w-6 h-6 text-safe" />
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center md:text-right">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-safe/20 text-safe text-sm font-mono mb-4">
                <CheckCircle className="w-4 h-4" />
                Rescue Server
              </div>
              <p className="text-muted text-sm">Receives aggregated SOS data. Dispatches rescue teams to locations.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function TechnicalFeaturesSection() {
  return (
    <section id="technical" className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            <span className="gradient-text">Technical</span> Deep Dive
          </h2>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            Built with precision engineering for reliability when it matters most.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* BLE Specifications */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl bg-card border border-card-border"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <Bluetooth className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold">BLE Specifications</h3>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-background/50 border border-card-border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted">Range (Indoor)</span>
                  <span className="font-mono text-sm">10-30m</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">Range (Open Air)</span>
                  <span className="font-mono text-sm">100-400m</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-background/50 border border-card-border">
                <div className="text-sm text-muted mb-2">Maximum Transmission Unit (MTU)</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Android</span>
                    <span className="font-mono text-safe">514 bytes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>iOS</span>
                    <span className="font-mono text-safe">524 bytes</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-background/50 border border-card-border">
                <div className="text-sm text-muted mb-2">Connection Limits</div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Simultaneous Connections</span>
                  <span className="font-mono text-sm">3-7 devices</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Data Packet Structure */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl bg-card border border-card-border"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
                <Signal className="w-6 h-6 text-warning" />
              </div>
              <h3 className="text-xl font-bold">Packet Structure</h3>
            </div>

            <div className="font-mono text-xs overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-muted border-b border-card-border">
                    <th className="text-left py-2">Bytes</th>
                    <th className="text-left py-2">Field</th>
                    <th className="text-left py-2">Size</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-card-border/50">
                    <td className="py-2">0-1</td>
                    <td>App Header</td>
                    <td className="text-critical">2B</td>
                  </tr>
                  <tr className="border-b border-card-border/50">
                    <td className="py-2">2-5</td>
                    <td>User ID</td>
                    <td className="text-warning">4B</td>
                  </tr>
                  <tr className="border-b border-card-border/50">
                    <td className="py-2">6-7</td>
                    <td>Sequence</td>
                    <td className="text-safe">2B</td>
                  </tr>
                  <tr className="border-b border-card-border/50">
                    <td className="py-2">8-15</td>
                    <td>GPS (Lat/Lon)</td>
                    <td className="text-accent">8B</td>
                  </tr>
                  <tr className="border-b border-card-border/50">
                    <td className="py-2">16</td>
                    <td>Status Code</td>
                    <td className="text-purple-400">1B</td>
                  </tr>
                  <tr>
                    <td className="py-2">17-20</td>
                    <td>Timestamp</td>
                    <td className="text-pink-400">4B</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-safe/10 border border-safe/30">
              <p className="text-xs text-safe">Total: ~21 bytes per SOS packet - fits in any BLE MTU</p>
            </div>
          </motion.div>

          {/* GPS Precision */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl bg-card border border-card-border"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-safe/20 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-safe" />
              </div>
              <h3 className="text-xl font-bold">GPS Optimization</h3>
            </div>

            <p className="text-sm text-muted mb-4">
              Coordinates stored as 32-bit integers (10^7 multiplier) for optimal precision-to-size ratio.
            </p>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-xl bg-background/50 border border-card-border">
                <span className="text-sm">Double (64-bit)</span>
                <div className="text-right">
                  <span className="font-mono text-xs text-muted">16 bytes</span>
                  <span className="text-xs text-muted ml-2">~1nm precision</span>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-safe/10 border border-safe/30">
                <span className="text-sm font-semibold">Integer (10^7)</span>
                <div className="text-right">
                  <span className="font-mono text-xs text-safe">8 bytes</span>
                  <span className="text-xs text-safe ml-2">~1.1cm precision</span>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-background/50 border border-card-border">
                <span className="text-sm">Single (32-bit)</span>
                <div className="text-right">
                  <span className="font-mono text-xs text-muted">8 bytes</span>
                  <span className="text-xs text-muted ml-2">~1.7m precision</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* DEFCON System */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl bg-card border border-card-border"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-critical/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-critical" />
              </div>
              <h3 className="text-xl font-bold">DEFCON Battery System</h3>
            </div>

            <p className="text-sm text-muted mb-4">
              Smart power management based on threat level detection.
            </p>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-safe/10 border border-safe/30">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold text-safe">Level 5: Peace</span>
                  <span className="text-xs font-mono">99.9% of time</span>
                </div>
                <p className="text-xs text-muted">API check every 30 min. BLE/GPS OFF.</p>
              </div>
              <div className="p-3 rounded-xl bg-warning/10 border border-warning/30">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold text-warning">Level 3: Warning</span>
                  <span className="text-xs font-mono">Verification</span>
                </div>
                <p className="text-xs text-muted">Earthquake/Hurricane detected. Ping Google to verify.</p>
              </div>
              <div className="p-3 rounded-xl bg-critical/10 border border-critical/30">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold text-critical">Level 1: Disaster</span>
                  <span className="text-xs font-mono">Full Mesh</span>
                </div>
                <p className="text-xs text-muted">All systems active. Continuous broadcast.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function PlatformSupportSection() {
  return (
    <section id="platforms" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            <span className="gradient-text">Platform</span> Support
          </h2>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            Cross-platform compatibility with platform-specific optimizations.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Android */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl bg-card border border-card-border relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-safe/10 rounded-full blur-3xl" />

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-safe/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-safe" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.29-.15-.65-.06-.83.22l-1.88 3.24c-1.4-.59-2.94-.92-4.47-.92s-3.07.33-4.47.92L5.65 5.67c-.19-.29-.58-.38-.87-.2-.28.18-.37.54-.22.83L6.4 9.48C3.3 11.25 1.28 14.44 1 18h22c-.28-3.56-2.3-6.75-5.4-8.52zM7 15.25c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25zm10 0c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold">Android</h3>
                <div className="flex items-center gap-2 mt-1">
                  <CheckCircle className="w-4 h-4 text-safe" />
                  <span className="text-safe text-sm font-medium">Full Support</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-background/50 border border-card-border">
                <h4 className="font-semibold mb-2">Background Features</h4>
                <ul className="space-y-2 text-sm text-muted">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-safe" />
                    Google Nearby Connections (100m range)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-safe" />
                    WorkManager for background tasks
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-safe" />
                    Programmatic MTU control
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-safe" />
                    Battery optimization bypass
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-safe/10 border border-safe/30">
                <div className="flex items-center gap-2 mb-2">
                  <Battery className="w-4 h-4 text-safe" />
                  <span className="font-semibold text-safe">Battery Modes</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>SOS Active: 6-8 hrs</div>
                  <div>Bridge Mode: 12+ hrs</div>
                  <div>Background: 24+ hrs</div>
                  <div>Custom: Adjustable</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* iOS */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="p-8 rounded-3xl bg-card border border-card-border relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-muted/10 rounded-full blur-3xl" />

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-foreground/10 flex items-center justify-center">
                <Apple className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">iOS</h3>
                <div className="flex items-center gap-2 mt-1">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <span className="text-warning text-sm font-medium">Limited Background</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-background/50 border border-card-border">
                <h4 className="font-semibold mb-2">Device Support (iPhone 6+)</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">iOS 17+</span>
                    <span className="font-mono text-safe">524 bytes MTU</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">iOS 15-16</span>
                    <span className="font-mono text-warning">244 bytes MTU</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">iOS 10-14</span>
                    <span className="font-mono text-critical">182 bytes MTU</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-warning/10 border border-warning/30">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <span className="font-semibold text-warning">Limitations</span>
                </div>
                <ul className="space-y-1 text-xs text-muted">
                  <li>- Low Power Mode detection only (cannot override)</li>
                  <li>- Background UUID overflow area</li>
                  <li>- System-managed MTU</li>
                  <li>- 30-second wake limit from silent push</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-accent/10 border border-accent/30">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  <span className="font-semibold text-accent">iOS Advantages</span>
                </div>
                <ul className="space-y-1 text-xs text-muted">
                  <li>- Scan + Broadcast simultaneously in background</li>
                  <li>- State Preservation & Restoration</li>
                  <li>- Silent push for disaster alerts</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function OfflineUtilitiesSection() {
  const utilities = [
    { icon: Map, name: "Offline Map", description: "Pre-cached maps for navigation" },
    { icon: Compass, name: "Compass", description: "Digital compass for direction" },
    { icon: MapPin, name: "GPS Tracker", description: "Real-time location tracking" },
    { icon: Flashlight, name: "SOS Strobe", description: "Visual signal for rescuers" },
    { icon: Volume2, name: "Ultrasonic SOS", description: "17-20kHz inaudible beacon" },
    { icon: Heart, name: "Medical Info", description: "Blood type, allergies, etc." },
    { icon: Globe, name: "Offline Wiki", description: "Emergency survival guides" },
    { icon: Users, name: "Community Chat", description: "Mesh-based local messaging" },
  ];

  return (
    <section id="features" className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            <span className="gradient-text">Offline</span> Utilities
          </h2>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            Essential tools that work without any network connection.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {utilities.map((utility) => (
            <motion.div
              key={utility.name}
              variants={fadeInUp}
              whileHover={{ scale: 1.05, y: -5 }}
              className="p-6 rounded-2xl bg-card border border-card-border hover:border-accent/50 transition-all text-center group"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-card-border/50 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <utility.icon className="w-7 h-7 text-muted group-hover:text-accent transition-colors" />
              </div>
              <h3 className="font-semibold mb-1">{utility.name}</h3>
              <p className="text-xs text-muted">{utility.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Ultrasonic SOS Detail */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 p-8 rounded-3xl bg-card border border-card-border"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Volume2 className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold">Ultrasonic SOS Technology</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-muted mb-4">
                Converts SOS data to inaudible sound waves (17-20kHz) that can be detected by nearby phones,
                even without Bluetooth connectivity.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-safe" />
                  <span>Range: 1-5 meters (indoor)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-safe" />
                  <span>No max volume required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-safe" />
                  <span>Humans cannot hear the transmission</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-background/50 border border-card-border font-mono text-xs">
              <div className="text-muted mb-2">// Transmission Flow</div>
              <div className="text-purple-400">Sender: &quot;User:123 Status:Red&quot;</div>
              <div className="text-muted">↓ Convert to WAV (17-20kHz)</div>
              <div className="text-warning">Speaker: Plays inaudible sound</div>
              <div className="text-muted">↓ Microphone captures</div>
              <div className="text-safe">Decoder: Extracts string data</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ProximitySection() {
  return (
    <section className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            <span className="gradient-text">Hot or Cold</span> Proximity
          </h2>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            Guide rescuers to victims using signal strength and sensor fusion.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl bg-card border border-card-border"
          >
            <h3 className="text-xl font-bold mb-6">RSSI Distance Calculation</h3>

            <div className="p-4 rounded-xl bg-background/50 border border-card-border mb-4 font-mono text-sm">
              <div className="text-muted mb-2">// Distance Formula</div>
              <div className="text-accent">d = 10^((P - RSSI) / (10 * N))</div>
              <div className="mt-2 text-xs text-muted">
                P = -69 dBm (power at 1m)
                <br />
                N = Environmental factor
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 rounded-xl bg-safe/10 border border-safe/30">
                <span className="text-sm">N = 2</span>
                <span className="text-xs text-safe">Open Space (Field)</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-warning/10 border border-warning/30">
                <span className="text-sm">N = 3</span>
                <span className="text-xs text-warning">Disaster Average</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-critical/10 border border-critical/30">
                <span className="text-sm">N = 4</span>
                <span className="text-xs text-critical">Rubble / Buildings</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl bg-card border border-card-border"
          >
            <h3 className="text-xl font-bold mb-6">Direction Finding (LocBLE)</h3>

            <p className="text-muted text-sm mb-4">
              Without Bluetooth 5.1+ hardware arrays, we use sensor fusion with the phone&apos;s compass and gyroscope.
            </p>

            <div className="relative h-48 flex items-center justify-center mb-4">
              <div className="absolute w-40 h-40 rounded-full border-2 border-card-border border-dashed" />
              <div className="absolute w-28 h-28 rounded-full border border-card-border" />
              <div className="w-16 h-16 rounded-full bg-accent/20 border border-accent flex items-center justify-center">
                <Compass className="w-8 h-8 text-accent" />
              </div>

              <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs text-safe font-mono">-60 dBm</div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-critical font-mono">-90 dBm</div>
              <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-warning font-mono">-75 dBm</div>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted font-mono">-85 dBm</div>
            </div>

            <p className="text-xs text-muted text-center">
              User spins 360° while app records RSSI at each heading.
              <br />
              Strongest signal indicates direction to target.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-16 border-t border-card-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-critical via-warning to-safe flex items-center justify-center">
                <Radio className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">Aether SOS</span>
            </div>
            <p className="text-muted text-sm">
              A peer-to-peer mesh network for disaster relief.
              <br />
              <span className="text-foreground font-semibold">Everyone is a hero.</span>
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Hackathon</h4>
            <div className="space-y-2 text-sm text-muted">
              <p>2025 Alameda Hackathon</p>
              <p>January 1 - 11, 2025</p>
              <div className="flex items-center gap-2 mt-4">
                <span className="px-2 py-1 rounded bg-accent/20 text-accent text-xs">Flutter</span>
                <span className="px-2 py-1 rounded bg-accent/20 text-accent text-xs">Dart</span>
                <span className="px-2 py-1 rounded bg-accent/20 text-accent text-xs">BLE</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2 text-sm">
              <a href="#how-it-works" className="block text-muted hover:text-foreground transition-colors">How It Works</a>
              <a href="#features" className="block text-muted hover:text-foreground transition-colors">Features</a>
              <a href="#platforms" className="block text-muted hover:text-foreground transition-colors">Platforms</a>
              <a href="#technical" className="block text-muted hover:text-foreground transition-colors">Technical</a>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-card-border">
          <p className="text-sm text-muted">
            Built with purpose. Designed for disasters.
          </p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <a href="#" className="text-muted hover:text-foreground transition-colors">
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <HeroSection />
      <DisasterTypesSection />
      <AlertLevelsSection />
      <HowItWorksSection />
      <TechnicalFeaturesSection />
      <PlatformSupportSection />
      <OfflineUtilitiesSection />
      <ProximitySection />
      <Footer />
    </main>
  );
}
