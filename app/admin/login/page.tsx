"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Radio,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  Shield,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function AdminLogin() {
  const router = useRouter();
  const { signIn, resetPassword, isAuthenticated, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/admin");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (isForgotPassword) {
      const result = await resetPassword(email);
      if (result.success) {
        setResetEmailSent(true);
      } else {
        setError(result.error || "Failed to send reset email");
      }
      setIsLoading(false);
      return;
    }

    const result = await signIn(email, password);

    if (result.success) {
      router.push("/admin");
    } else {
      setError(result.error || "Invalid credentials");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-critical/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-critical/5 via-warning/5 to-safe/5 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Logo and header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
            className="inline-flex items-center justify-center mb-6"
          >
            <div className="relative">
              <div className="absolute inset-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-critical via-warning to-safe opacity-50 blur-xl animate-pulse" />
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-critical via-warning to-safe flex items-center justify-center shadow-2xl">
                <Radio className="w-10 h-10 text-white" />
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-card border-2 border-background rounded-xl flex items-center justify-center shadow-lg"
              >
                <Shield className="w-4 h-4 text-accent" />
              </motion.div>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold mb-2"
          >
            Rescue Dashboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-muted text-sm"
          >
            Sign in to access the AnchorMesh control center
          </motion.p>
        </div>

        {/* Login form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-card border border-card-border rounded-2xl p-8 shadow-xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-critical/10 border border-critical/30 text-critical"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </motion.div>
            )}

            {/* Reset email sent confirmation */}
            {resetEmailSent && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-safe/10 border border-safe/30 text-safe"
              >
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">Password reset email sent! Check your inbox.</p>
              </motion.div>
            )}

            {/* Email field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@anchormesh.com"
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-background border border-card-border focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all text-foreground placeholder:text-muted/50"
                />
              </div>
            </div>

            {/* Password field - hidden in forgot password mode */}
            {!isForgotPassword && (
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-12 pr-12 py-3 rounded-xl bg-background border border-card-border focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all text-foreground placeholder:text-muted/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Forgot password toggle */}
            {!isForgotPassword ? (
              <div className="flex items-center justify-end text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(true);
                    setError("");
                    setResetEmailSent(false);
                  }}
                  className="text-accent hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-end text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setError("");
                    setResetEmailSent(false);
                  }}
                  className="text-accent hover:underline"
                >
                  Back to sign in
                </button>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading || resetEmailSent}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-accent to-blue-600 text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isForgotPassword ? (
                <>
                  Send Reset Link
                  <Mail className="w-4 h-4" />
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Account info */}
          <div className="mt-6 pt-6 border-t border-card-border">
            <p className="text-xs text-muted text-center">
              Contact your administrator to create an account for the rescue dashboard.
            </p>
          </div>
        </motion.div>

        {/* Back to main site */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center mt-6"
        >
          <a href="/" className="text-sm text-muted hover:text-foreground transition-colors">
            &larr; Back to main site
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}
