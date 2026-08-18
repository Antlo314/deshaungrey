"use client";

import { useEffect, useState } from "react";

const QUERY = "(min-width: 901px) and (prefers-reduced-motion: no-preference)";

export function useCinema() {
  const [cinema, setCinema] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const apply = () => setCinema(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return cinema;
}
