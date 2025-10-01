'use client';

import SessionProvider from '@/components/SessionProvider';
import LoginCard from '@/components/loginCard';

export default function LoginPage() {
  return (
    <SessionProvider>
      <LoginCard />
    </SessionProvider>
  );
}
