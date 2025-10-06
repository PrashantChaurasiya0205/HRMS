"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Users, BarChart3, Calendar, Zap, Mail, Lock } from "lucide-react";

const LoginCard = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store user data in localStorage for client-side access
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/dashboard");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const message = isLoading ? "Signing in..." : "Sign in to your account";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center">
          {/* Left Side - Branding */}
          <div className="text-white space-y-8">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img src="/Gemini_Generated_Image_6dg6126dg6126dg6.png" alt="Workshant Logo" className="w-16 h-16 rounded-2xl shadow-2xl" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Zap className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  Workshant
                </h1>
                <p className="text-purple-200 text-lg">Next-Gen HRMS Platform</p>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
                Transform Your
                <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Workforce Management
                </span>
              </h2>
              
              <p className="text-lg sm:text-xl text-gray-300 leading-relaxed">
                One-stop solution for complete HRMS - Advanced analytics, 
                intelligent automation, and seamless employee experience.
              </p>

              {/* Feature Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-center space-x-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                  <Shield className="w-6 h-6 text-green-400" />
                  <span className="text-sm font-medium">Secure & Compliant</span>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                  <BarChart3 className="w-6 h-6 text-blue-400" />
                  <span className="text-sm font-medium">Smart Analytics</span>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                  <Users className="w-6 h-6 text-purple-400" />
                  <span className="text-sm font-medium">Team Management</span>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                  <Calendar className="w-6 h-6 text-pink-400" />
                  <span className="text-sm font-medium">Smart Scheduling</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Card */}
          <div className="relative">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/20 shadow-2xl">
              <div className="text-center mb-6 sm:mb-8">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Welcome</h3>
                <p className="text-sm sm:text-base text-gray-300">{message}</p>
              </div>
              
              {isLoading ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/20 border-t-purple-500"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-pink-500 animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
                  </div>
                  <p className="text-white/80">Authenticating...</p>
                </div>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm">
                      {error}
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full group relative overflow-hidden bg-white text-gray-900 font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <div className="relative flex items-center justify-center space-x-3">
                      <span className="text-base sm:text-lg">Sign In</span>
                    </div>
                  </button>
                </form>
              )}
              
              <div className="mt-6 sm:mt-8 text-center">
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 text-xs sm:text-sm text-white/60">
                  <div className="flex items-center space-x-1">
                    <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Enterprise-grade security</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Powered by AI & Machine Learning</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginCard;