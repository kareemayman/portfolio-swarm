"use client";

import { useEffect } from "react";
import { registerSection } from "@/swarm/sections";
import type { scripts } from "./swarm"; // the type only: the scripts ship with the engine

/**
 * Hands a section to the swarm while it is on screen. A route hidden on navigation runs
 * its effects' cleanup, which takes the section back.
 *
 * The section's roots are the elements marked `data-swarm={section}`, in document order,
 * and the last one is the scroll trigger. The build states in swarm.css hide what is
 * inside them until it is built.
 */
export function SwarmSection({ section }: { section: keyof typeof scripts }) {
  useEffect(() => registerSection(section), [section]);
  return null;
}
