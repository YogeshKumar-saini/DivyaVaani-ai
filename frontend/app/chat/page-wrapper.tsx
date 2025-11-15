'use client';

import { Suspense } from 'react';
import ChatPage from './page';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export default function ChatPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <LoadingSpinner size="xl" variant="spiritual" text="Loading chat..." />
      </div>
    }>
      <ChatPage />
    </Suspense>
  );
}
