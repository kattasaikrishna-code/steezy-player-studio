import { useState, useEffect, useCallback, useRef } from "react";

export interface NetworkInfo {
  speed: number; // in Mbps
  quality: "excellent" | "good" | "fair" | "poor" | "offline";
  effectiveType: string;
  downlink: number;
  rtt: number;
  isOnline: boolean;
}

const getQualityFromSpeed = (speedMbps: number): NetworkInfo["quality"] => {
  if (speedMbps <= 0) return "offline";
  if (speedMbps >= 10) return "excellent";
  if (speedMbps >= 5) return "good";
  if (speedMbps >= 2) return "fair";
  return "poor";
};

const getQualityColor = (quality: NetworkInfo["quality"]): string => {
  switch (quality) {
    case "excellent":
      return "text-green-500";
    case "good":
      return "text-emerald-400";
    case "fair":
      return "text-yellow-500";
    case "poor":
      return "text-orange-500";
    case "offline":
      return "text-red-500";
    default:
      return "text-muted-foreground";
  }
};

const getQualityBgColor = (quality: NetworkInfo["quality"]): string => {
  switch (quality) {
    case "excellent":
      return "bg-green-500/20";
    case "good":
      return "bg-emerald-400/20";
    case "fair":
      return "bg-yellow-500/20";
    case "poor":
      return "bg-orange-500/20";
    case "offline":
      return "bg-red-500/20";
    default:
      return "bg-muted/20";
  }
};

export const useNetworkSpeed = () => {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    speed: 0,
    quality: "good",
    effectiveType: "4g",
    downlink: 10,
    rtt: 50,
    isOnline: navigator.onLine,
  });

  const downloadSpeedRef = useRef<number[]>([]);
  const measurementIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Measure actual download speed using a small test
  const measureSpeed = useCallback(async () => {
    try {
      const testUrl = `https://www.google.com/favicon.ico?t=${Date.now()}`;
      const startTime = performance.now();
      
      const response = await fetch(testUrl, { 
        cache: "no-store",
        mode: "no-cors" 
      });
      
      const endTime = performance.now();
      const duration = (endTime - startTime) / 1000; // seconds
      
      // Estimate based on typical favicon size (~1KB) and response time
      // This is a rough estimate - actual speed may vary
      const estimatedSizeKB = 1;
      const speedMbps = (estimatedSizeKB * 8) / (duration * 1000);
      
      // Keep last 5 measurements for averaging
      downloadSpeedRef.current.push(speedMbps);
      if (downloadSpeedRef.current.length > 5) {
        downloadSpeedRef.current.shift();
      }
      
      return speedMbps;
    } catch {
      return 0;
    }
  }, []);

  // Update network info from Network Information API and measurements
  const updateNetworkInfo = useCallback(async () => {
    const connection = (navigator as any).connection || 
                       (navigator as any).mozConnection || 
                       (navigator as any).webkitConnection;

    let speed = 10; // default
    let effectiveType = "4g";
    let downlink = 10;
    let rtt = 50;

    if (connection) {
      effectiveType = connection.effectiveType || "4g";
      downlink = connection.downlink || 10;
      rtt = connection.rtt || 50;
      speed = downlink;
    }

    // Combine with actual measurement if available
    if (downloadSpeedRef.current.length > 0) {
      const avgMeasured = downloadSpeedRef.current.reduce((a, b) => a + b, 0) / 
                          downloadSpeedRef.current.length;
      // Weight: 70% API, 30% measured (API is more reliable)
      speed = speed * 0.7 + avgMeasured * 0.3;
    }

    // Adjust based on effective type if speed seems too high
    if (effectiveType === "slow-2g") speed = Math.min(speed, 0.25);
    else if (effectiveType === "2g") speed = Math.min(speed, 0.5);
    else if (effectiveType === "3g") speed = Math.min(speed, 2);

    const isOnline = navigator.onLine;
    const quality = isOnline ? getQualityFromSpeed(speed) : "offline";

    setNetworkInfo({
      speed: Math.round(speed * 10) / 10,
      quality,
      effectiveType,
      downlink,
      rtt,
      isOnline,
    });
  }, []);

  useEffect(() => {
    // Initial update
    updateNetworkInfo();

    // Set up Network Information API listener
    const connection = (navigator as any).connection || 
                       (navigator as any).mozConnection || 
                       (navigator as any).webkitConnection;

    if (connection) {
      connection.addEventListener("change", updateNetworkInfo);
    }

    // Online/offline listeners
    const handleOnline = () => updateNetworkInfo();
    const handleOffline = () => {
      setNetworkInfo(prev => ({ ...prev, isOnline: false, quality: "offline", speed: 0 }));
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Periodic speed measurement (every 10 seconds)
    measurementIntervalRef.current = setInterval(async () => {
      await measureSpeed();
      updateNetworkInfo();
    }, 10000);

    // Initial measurement
    measureSpeed().then(updateNetworkInfo);

    return () => {
      if (connection) {
        connection.removeEventListener("change", updateNetworkInfo);
      }
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (measurementIntervalRef.current) {
        clearInterval(measurementIntervalRef.current);
      }
    };
  }, [updateNetworkInfo, measureSpeed]);

  return {
    ...networkInfo,
    qualityColor: getQualityColor(networkInfo.quality),
    qualityBgColor: getQualityBgColor(networkInfo.quality),
  };
};
