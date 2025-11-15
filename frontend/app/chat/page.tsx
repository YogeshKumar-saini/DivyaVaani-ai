import { Suspense } from "react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import ChatPageContent from "./page-content";

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <LoadingSpinner size="xl" variant="spiritual" text="Loading chat..." />
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  );
}
