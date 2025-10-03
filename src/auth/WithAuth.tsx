"use client";

import { useSession } from "next-auth/react";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface WithAuthProps {
  children: React.ReactNode;
}

const WithAuth = ({ children }: WithAuthProps) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Remove automatic redirect - let individual pages handle their own auth logic
  // useEffect(() => {
  //   if (status === "unauthenticated") {
  //     const timeout = setTimeout(() => {
  //       router.push("/login"); // redirect to login page
  //     }, 2000); // wait 2s to show spinner before redirect

  //     return () => clearTimeout(timeout);
  //   }
  // }, [status, router]);

  // Just show loading state and let pages handle their own auth logic
  if (status === "loading") {
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

  // Always render children and let individual pages handle authentication
  return <>{children}</>;
};

export default WithAuth;
