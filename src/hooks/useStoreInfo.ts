import { useState, useEffect } from "react";

// Default store phone number — can be updated in Admin Settings
export const DEFAULT_WHATSAPP_NUMBER = "919061133189";

export function useStoreInfo() {
  const [whatsappNumber, setWhatsappNumber] = useState<string>(DEFAULT_WHATSAPP_NUMBER);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/store-info")
      .then((res) => res.json())
      .then((data) => {
        if (data.whatsappNumber) {
          setWhatsappNumber(data.whatsappNumber);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { whatsappNumber, loading };
}

