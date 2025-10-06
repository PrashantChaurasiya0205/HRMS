"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface WithAuthProps {
  children: React.ReactNode;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

const WithAuth = ({ children }: WithAuthProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for user session
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/session");
        const data = await response.json();
        
        if (data.user) {
          // Get full user data from localStorage if available
          const userData = localStorage.getItem("user");
          if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
          } else {
            setUser(data.user);
          }
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="p-8 rounded-3xl shadow-2xl bg-white transform scale-105 transition-all animate-pulse">
          <p className="text-base text-gray-700 flex items-center justify-center gap-2">
            Loading... <Loader2 className="animate-spin transition-all ease-in-out" />
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Don't render anything while redirecting
  }

  return <>{children}</>;
};

export default WithAuth;
