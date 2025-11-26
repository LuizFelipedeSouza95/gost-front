import React from 'react';
import { Toaster as Sonner } from 'sonner';

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      toastOptions={{
        style: {
          background: 'rgb(31, 41, 55)',
          color: 'rgb(243, 244, 246)',
          border: '1px solid rgb(75, 85, 99)',
        },
      }}
    />
  );
}
