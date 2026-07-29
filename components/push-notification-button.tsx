"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Bell, BellRing, BellOff, Loader2 } from "lucide-react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationButton() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && ("serviceWorker" in navigator) && ("PushManager" in window)) {
      navigator.serviceWorker.register("/sw.js").then(
        (reg) => {
          reg.pushManager.getSubscription().then((sub) => {
            if (sub) {
              setIsSubscribed(true);
            }
          });
        },
        (err) => {
          console.warn("Service worker registration error:", err);
        }
      );
    } else {
      setSupported(false);
    }
  }, []);

  const subscribeToPush = async () => {
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert("Push notification permission denied.");
        setLoading(false);
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!vapidPublicKey) {
        alert("VAPID Public Key missing in environment configuration.");
        setLoading(false);
        return;
      }

      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription }),
      });

      if (res.ok) {
        setIsSubscribed(true);
      } else {
        const data = await res.json();
        alert(`Failed to subscribe: ${data.error || "Server error"}`);
      }
    } catch (err: any) {
      console.error("Push subscription error:", err);
      alert(`Push Notification setup error: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  if (!supported) return null;

  return (
    <Button
      size="sm"
      variant={isSubscribed ? "outline" : "secondary"}
      onClick={subscribeToPush}
      disabled={loading || isSubscribed}
      title={isSubscribed ? "Push Notifications Active" : "Enable Web Push Notifications"}
      className="gap-1.5"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
      ) : isSubscribed ? (
        <>
          <BellRing className="w-3.5 h-3.5 text-emerald-500" />
          <span className="hidden md:inline text-xs">Alerts Active</span>
        </>
      ) : (
        <>
          <Bell className="w-3.5 h-3.5 text-blue-500" />
          <span className="hidden md:inline text-xs">Enable Push</span>
        </>
      )}
    </Button>
  );
}
