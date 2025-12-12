"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
        },
      ) => string;
      reset: (id?: string) => void;
      remove: (id: string) => void;
    };
  }
}

type Props = {
  siteKey: string;
  onVerify: (token: string) => void;
  onError?: (message: string) => void;
  theme?: "light" | "dark" | "auto";
};

// Lightweight Turnstile wrapper so we don't add another dependency.
export default function TurnstileWidget({ siteKey, onVerify, onError, theme = "light" }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const verifyCbRef = useRef(onVerify);
  const errorCbRef = useRef(onError);

  // Keep latest callbacks without retriggering the render effect.
  useEffect(() => {
    verifyCbRef.current = onVerify;
  }, [onVerify]);

  useEffect(() => {
    errorCbRef.current = onError;
  }, [onError]);

  useEffect(() => {
    let cancelled = false;

    const ensureScript = () =>
      new Promise<void>((resolve, reject) => {
        if (window.turnstile) return resolve();

        const existing = document.querySelector<HTMLScriptElement>('script[src*="challenges.cloudflare.com/turnstile"]');
        if (existing) {
          existing.addEventListener("load", () => resolve(), { once: true });
          existing.addEventListener("error", () => reject(new Error("Failed to load Turnstile script")), { once: true });
          return;
        }

        const script = document.createElement("script");
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Turnstile script"));
        document.head.appendChild(script);
      });

    ensureScript()
      .then(() => {
        if (cancelled || !window.turnstile || !containerRef.current) return;
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme,
          callback: (token: string) => verifyCbRef.current?.(token),
          "error-callback": () => {
            verifyCbRef.current?.("");
            errorCbRef.current?.("Verification failed, please retry.");
          },
          "expired-callback": () => verifyCbRef.current?.(""),
        });
      })
      .catch((err) => {
        console.error(err);
        errorCbRef.current?.("Could not load Turnstile. Please refresh and try again.");
      });

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
  }, [siteKey, theme]);

  return <div ref={containerRef} className="mt-2" />;
}



