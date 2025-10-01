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

  useEffect(() => {
    if (status === "unauthenticated") {
      const timeout = setTimeout(() => {
        router.push("/api/auth/signin"); // redirect to Google login
      }, 2000); // wait 2s to show spinner before redirect

      return () => clearTimeout(timeout);
    }
  }, [status, router]);

  switch (status) {
    case "loading":
      return (
        <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="p-8 rounded-3xl shadow-2xl bg-white transform scale-105 transition-all animate-pulse">
            <p className="text-base text-gray-700 flex items-center justify-center gap-2">
              Checking access... <Loader2 className="animate-spin transition-all ease-in-out" />
            </p>
          </div>
        </div>
      );

    case "unauthenticated":
      return (
        <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 gap-8 px-4 text-center">
          <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-10 rounded-3xl transform hover:scale-105 transition-transform duration-300">
            <p className="text-base text-gray-700 flex items-center justify-center gap-2">
              Redirecting to login... <Loader2 className="animate-spin transition-all ease-in-out" />
            </p>
          </div>
        </div>
      );

    case "authenticated":
      return <>{children}</>;

    default:
      return <>{children}</>;
  }
};

export default WithAuth;
