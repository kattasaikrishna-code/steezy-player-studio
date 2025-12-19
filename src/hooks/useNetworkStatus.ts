import { useState, useEffect } from "react";

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connection, setConnection] = useState<any>(
    (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const handleConnectionChange = () => {
      setConnection(
        (navigator as any).connection ||
          (navigator as any).mozConnection ||
          (navigator as any).webkitConnection
      );
    };

    if (connection) {
      connection.addEventListener("change", handleConnectionChange);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (connection) {
        connection.removeEventListener("change", handleConnectionChange);
      }
    };
  }, [connection]);

  return {
    isOnline,
    effectiveType: connection?.effectiveType || "unknown",
    downlink: connection?.downlink || 0,
    rtt: connection?.rtt || 0,
  };
};
