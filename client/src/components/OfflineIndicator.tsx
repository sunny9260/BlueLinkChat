import { WifiOff, Wifi } from "lucide-react";
import { useOffline } from "@/hooks/useOffline";
import { useEffect, useState } from "react";

export function OfflineIndicator() {
  const { isOffline, wasOffline } = useOffline();
  const [showOnlineMessage, setShowOnlineMessage] = useState(false);

  useEffect(() => {
    if (wasOffline) {
      setShowOnlineMessage(true);
      const timer = setTimeout(() => setShowOnlineMessage(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [wasOffline]);

  if (showOnlineMessage) {
    return (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2">
        <Wifi className="h-4 w-4" />
        <span>Back online</span>
      </div>
    );
  }

  if (!isOffline) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-orange-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2">
      <WifiOff className="h-4 w-4" />
      <span>You're offline</span>
    </div>
  );
}