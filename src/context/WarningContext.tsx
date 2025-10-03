'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface WarningContextType {
  showWarning: boolean;
  setShowWarning: (show: boolean) => void;
  extraTimeReason: string;
  setExtraTimeReason: (reason: string) => void;
  triggerWarning: () => void;
}

const WarningContext = createContext<WarningContextType | undefined>(undefined);

export function WarningProvider({ children }: { children: ReactNode }) {
  const [showWarning, setShowWarning] = useState(false);
  const [extraTimeReason, setExtraTimeReason] = useState('');

  const triggerWarning = () => {
    setShowWarning(true);
  };

  return (
    <WarningContext.Provider value={{
      showWarning,
      setShowWarning,
      extraTimeReason,
      setExtraTimeReason,
      triggerWarning
    }}>
      {children}
    </WarningContext.Provider>
  );
}

export function useWarning() {
  const context = useContext(WarningContext);
  if (context === undefined) {
    throw new Error('useWarning must be used within a WarningProvider');
  }
  return context;
}
