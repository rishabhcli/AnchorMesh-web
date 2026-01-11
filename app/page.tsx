"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  Radio,
  Shield,
  Users,
  AlertTriangle,
  ChevronDown,
  Smartphone,
  Wifi,
  WifiOff,
  Heart,
  CheckCircle,
  Battery,
  Zap,
  MapPin,
} from "lucide-react";

const floatAnimation = {
  initial: { y: 0 },
  animate: {
    y: [-8, 8, -8],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
  },
};

const floatAnimationSlow = {
  initial: { y: 0 },
  animate: {
    y: [-12, 12, -12],
    transition: { duration: 6, repeat: Infinity, ease: "easeInOut" },
  },
};

function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b border-card-border"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src="/icon.png" alt="AnchorMesh" className="w-10 h-10 rounded-xl" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-critical rounded-full animate-pulse" />
          </div>
          <span className="font-bold text-xl tracking-tight">AnchorMesh</span>
        </div>
        <motion.a
          href="/admin/login"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-card-border text-sm font-medium hover:bg-card-border/50 transition-colors"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <Shield className="w-4 h-4" />
          <span className="hidden sm:inline">Rescue Dashboard</span>
        </motion.a>
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

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <motion.div className="absolute inset-0 pointer-events-none" style={{ y: backgroundY }}>
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-critical/10 rounded-full blur-3xl"
          variants={floatAnimationSlow}
          initial="initial"
          animate="animate"
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-safe/10 rounded-full blur-3xl"
          variants={floatAnimationSlow}
          initial="initial"
          animate="animate"
        />
      </motion.div>

      {/* Signal waves */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute w-32 h-32 border-2 border-critical/30 rounded-full signal-wave"
            style={{ animationDelay: `${i * 1}s` }}
          />
        ))}
      </div>

      <motion.div className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-20" style={{ opacity }}>
        {/* SOS Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <motion.div
            className="relative inline-flex items-center justify-center"
            variants={floatAnimation}
            initial="initial"
            animate="animate"
          >
            <div className="absolute w-40 h-40 bg-critical/20 rounded-full pulse-ring" />
            <div className="absolute w-32 h-32 bg-critical/30 rounded-full pulse-ring" style={{ animationDelay: "0.5s" }} />
            <div className="relative w-24 h-24 bg-gradient-to-br from-critical to-red-700 rounded-full flex items-center justify-center glow-effect shadow-2xl shadow-critical/50">
              <span className="text-2xl font-black text-white tracking-wider">SOS</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm uppercase tracking-widest text-muted mb-4"
        >
          When Towers Fall, People Connect
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-5xl md:text-7xl font-black tracking-tight mb-6"
        >
          <span className="text-foreground">Your Phone.</span>
          <br />
          <span className="gradient-text">Their Lifeline.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-xl md:text-2xl text-muted max-w-2xl mx-auto mb-12"
        >
          No signal? No problem. AnchorMesh turns every smartphone into a rescue beacon that works without internet.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.a
            href="/admin"
            className="px-8 py-4 rounded-xl bg-critical text-white font-semibold"
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            View Live Dashboard
          </motion.a>
          <motion.a
            href="#problem"
            className="px-8 py-4 rounded-xl border border-card-border font-semibold"
            whileHover={{ y: -4, backgroundColor: "rgba(255,255,255,0.05)" }}
            whileTap={{ scale: 0.98 }}
          >
            See How It Works
          </motion.a>
        </motion.div>

        <motion.a
          href="#problem"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 8, 0] }}
          transition={{ delay: 1.2, y: { duration: 2, repeat: Infinity } }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted hover:text-foreground"
        >
          <ChevronDown className="w-6 h-6" />
        </motion.a>
      </motion.div>
    </section>
  );
}

function ProblemSection() {
  return (
    <section id="problem" className="py-24 relative">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            What Happens When <span className="text-critical">Towers Fall?</span>
          </h2>
          <p className="text-xl text-muted max-w-3xl mx-auto">
            Earthquakes. Hurricanes. Wildfires. When disaster strikes, cell towers go down first.
            Most apps become useless icons on your screen.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="p-6 rounded-2xl bg-card border border-critical/30">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-xl bg-critical/20 flex items-center justify-center">
                  <WifiOff className="w-6 h-6 text-critical" />
                </div>
                <h3 className="text-xl font-bold">The Problem</h3>
              </div>
              <p className="text-muted">
                Remote canyons, backcountry trails, fire zones, cities after hurricanes —
                when you need help most, you can't call for it.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-safe/30">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-xl bg-safe/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-safe" />
                </div>
                <h3 className="text-xl font-bold">Our Solution</h3>
              </div>
              <p className="text-muted">
                What if your phone could still get a message out by leveraging the one thing
                disasters can't stop? <span className="text-foreground font-semibold">People moving through the area.</span>
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Mesh Network Visual */}
            <div className="relative h-80 flex items-center justify-center rounded-2xl bg-card/50 border border-card-border overflow-hidden p-6">
              <div className="relative w-full h-full">
                {/* Connection lines */}
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                  <line x1="25%" y1="25%" x2="50%" y2="20%" stroke="#444" strokeWidth="1" />
                  <line x1="75%" y1="25%" x2="50%" y2="20%" stroke="#444" strokeWidth="1" />
                  <line x1="25%" y1="25%" x2="50%" y2="50%" stroke="#444" strokeWidth="1" />
                  <line x1="75%" y1="25%" x2="50%" y2="50%" stroke="#444" strokeWidth="1" />
                  <line x1="25%" y1="75%" x2="50%" y2="50%" stroke="#444" strokeWidth="1" />
                  <line x1="75%" y1="75%" x2="50%" y2="50%" stroke="#444" strokeWidth="1" />
                  <line x1="25%" y1="25%" x2="25%" y2="75%" stroke="#444" strokeWidth="1" />
                  <line x1="75%" y1="25%" x2="75%" y2="75%" stroke="#444" strokeWidth="1" />
                  <line x1="50%" y1="80%" x2="25%" y2="75%" stroke="#444" strokeWidth="1" />
                  <line x1="50%" y1="80%" x2="75%" y2="75%" stroke="#444" strokeWidth="1" />
                  <line x1="50%" y1="80%" x2="50%" y2="50%" stroke="#444" strokeWidth="1" />
                </svg>

                {/* Nodes */}
                <motion.div
                  className="absolute top-[15%] left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-warning/20 border-2 border-warning flex items-center justify-center"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                >
                  <Smartphone className="w-5 h-5 text-warning" />
                </motion.div>

                <motion.div
                  className="absolute top-[20%] left-[20%] w-10 h-10 rounded-full bg-warning/20 border-2 border-warning flex items-center justify-center"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                >
                  <Smartphone className="w-5 h-5 text-warning" />
                </motion.div>

                <motion.div
                  className="absolute top-[20%] right-[20%] w-10 h-10 rounded-full bg-warning/20 border-2 border-warning flex items-center justify-center"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <Smartphone className="w-5 h-5 text-warning" />
                </motion.div>

                {/* Center SOS Node */}
                <motion.div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-critical/20 border-2 border-critical flex items-center justify-center"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="text-critical font-bold text-sm">SOS</span>
                </motion.div>

                <motion.div
                  className="absolute bottom-[20%] left-[20%] w-10 h-10 rounded-full bg-warning/20 border-2 border-warning flex items-center justify-center"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                >
                  <Smartphone className="w-5 h-5 text-warning" />
                </motion.div>

                <motion.div
                  className="absolute bottom-[20%] right-[20%] w-10 h-10 rounded-full bg-warning/20 border-2 border-warning flex items-center justify-center"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                >
                  <Smartphone className="w-5 h-5 text-warning" />
                </motion.div>

                {/* Internet Node */}
                <motion.div
                  className="absolute bottom-[5%] left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-safe/20 border-2 border-safe flex items-center justify-center"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                >
                  <Wifi className="w-6 h-6 text-safe" />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      icon: Zap,
      title: "Disaster Detected",
      description: "App monitors official alerts. Activates automatically when earthquakes, fires, or hurricanes are detected.",
    },
    {
      icon: Radio,
      title: "Mesh Activates",
      description: "Your phone starts broadcasting via Bluetooth. No internet needed. Works even when locked in your pocket.",
    },
    {
      icon: Users,
      title: "People Relay",
      description: "Nearby phones receive and rebroadcast your SOS. The signal hops from person to person.",
    },
    {
      icon: Wifi,
      title: "Help Arrives",
      description: "When any phone in the chain finds internet, all SOS alerts upload to rescue teams.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-card/30">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-xl text-muted">One tap. Zero setup. Automatic when it matters.</p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <motion.div
                className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-card border border-card-border flex items-center justify-center relative"
                whileHover={{ y: -8, scale: 1.05 }}
              >
                <step.icon className="w-8 h-8 text-foreground" />
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent text-black text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </span>
              </motion.div>
              <h3 className="text-lg font-bold mb-2">{step.title}</h3>
              <p className="text-muted text-sm">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PrioritySection() {
  const priorities = [
    {
      color: "critical",
      label: "Critical",
      description: "Life-threatening emergency",
      icon: AlertTriangle,
    },
    {
      color: "warning",
      label: "Injured",
      description: "Need medical attention",
      icon: Heart,
    },
    {
      color: "safe",
      label: "Safe",
      description: "Acting as relay node",
      icon: CheckCircle,
    },
  ];

  return (
    <section className="py-24">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            One Tap. <span className="gradient-text">Clear Priority.</span>
          </h2>
          <p className="text-xl text-muted">
            No complicated forms. Just tap your status so rescuers know who needs help first.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {priorities.map((priority, index) => (
            <motion.div
              key={priority.label}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`p-8 rounded-2xl bg-card border-2 border-${priority.color}/30 text-center`}
            >
              <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-${priority.color}/20 flex items-center justify-center`}>
                <priority.icon className={`w-10 h-10 text-${priority.color}`} />
              </div>
              <h3 className={`text-2xl font-bold mb-2 text-${priority.color}`}>{priority.label}</h3>
              <p className="text-muted">{priority.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: Battery,
      title: "24+ Hour Battery",
      description: "Smart power management. Only activates during emergencies.",
    },
    {
      icon: Smartphone,
      title: "Works in Pocket",
      description: "Relay messages even when your phone is locked.",
    },
    {
      icon: MapPin,
      title: "GPS Location",
      description: "Precise coordinates sent with every SOS signal.",
    },
  ];

  return (
    <section className="py-24 bg-card/30">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Built for <span className="gradient-text">Real Emergencies</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="p-8 rounded-2xl bg-card border border-card-border text-center"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-accent/10 flex items-center justify-center">
                <feature.icon className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <motion.div
        className="absolute top-1/2 left-1/4 w-64 h-64 bg-critical/5 rounded-full blur-3xl"
        variants={floatAnimationSlow}
        initial="initial"
        animate="animate"
      />

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Even if You're Safe, You Can Save Lives
          </h2>
          <p className="text-xl text-muted mb-10 max-w-2xl mx-auto">
            Just having the app installed means your phone can relay SOS messages for others.
            Be part of the network.
          </p>
          <motion.a
            href="/admin"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-critical text-white font-semibold"
            whileHover={{ y: -4, scale: 1.02, boxShadow: "0 20px 40px rgba(239, 68, 68, 0.3)" }}
            whileTap={{ scale: 0.98 }}
          >
            <Shield className="w-5 h-5" />
            View Rescue Dashboard
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-8 border-t border-card-border">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <img src="/icon.png" alt="AnchorMesh" className="w-8 h-8 rounded-lg" />
            <span className="font-bold">AnchorMesh</span>
          </div>
          <p className="text-sm text-muted">Alameda County Hackathon 2025</p>
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
      <ProblemSection />
      <HowItWorksSection />
      <PrioritySection />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </main>
  );
}
