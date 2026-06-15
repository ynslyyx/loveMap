import { useState, useEffect } from "react";
import { memoryStoreUpdatedEvent, type LocalMemoryStore } from "@/data/progress";
import { readMemories } from "@/lib/client/storage";

export const useMemories = () => {
  const [memories, setMemories] = useState<LocalMemoryStore>({});

  useEffect(() => {
    let cancelled = false;
    const handleMemoryUpdate = (event: Event) => {
      const detail = (event as CustomEvent<LocalMemoryStore>).detail;
      if (detail) {
        setMemories(detail);
      }
    };

    async function loadLocalMemories() {
      try {
        const data = await readMemories();
        if (!cancelled) {
          setMemories(data);
        }
      } catch {
        if (!cancelled) {
          setMemories({});
        }
      }
    }

    window.addEventListener(memoryStoreUpdatedEvent, handleMemoryUpdate);
    loadLocalMemories();

    return () => {
      cancelled = true;
      window.removeEventListener(memoryStoreUpdatedEvent, handleMemoryUpdate);
    };
  }, []);

  return memories;
};
