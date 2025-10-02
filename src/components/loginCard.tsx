"use client";
import React, { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Shield, Users, BarChart3, Calendar, Zap } from "lucide-react";

const LoginCard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", {
        callbackUrl: "/dashboard",
      });
    } catch (error) {
      console.error("Sign-in error:", error);
      setIsLoading(false);
    }
  };

  const message =
    status === "loading" || isLoading
      ? "Redirecting to Google..."
      : "Sign in with your Google account";

  const showSpinner = status === "loading" || isLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
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

            <div className="space-y-6">
              <h2 className="text-3xl font-bold leading-tight">
                Transform Your
                <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Workforce Management
                </span>
              </h2>
              
              <p className="text-xl text-gray-300 leading-relaxed">
                One-stop solution for complete HRMS - Advanced analytics, 
                intelligent automation, and seamless employee experience.
              </p>

              {/* Feature Grid */}
              <div className="grid grid-cols-2 gap-4">
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
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Welcome</h3>
                <p className="text-gray-300">{message}</p>
              </div>
              
              {showSpinner ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/20 border-t-purple-500"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-pink-500 animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
                  </div>
                  <p className="text-white/80">Authenticating...</p>
                </div>
              ) : (
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full group relative overflow-hidden bg-white text-gray-900 font-semibold py-4 px-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center space-x-3">
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="text-lg">Continue with Google</span>
                  </div>
                </button>
              )}
              
              <div className="mt-8 text-center">
                <div className="flex items-center justify-center space-x-2 text-sm text-white/60">
                  <Shield className="w-4 h-4" />
                  <span>Enterprise-grade security</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-white/60 mt-2">
                  <Zap className="w-4 h-4" />
                  <span>Powered by AI & Machine Learning</span>
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