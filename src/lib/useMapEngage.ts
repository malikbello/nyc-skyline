"use client";

import { useState } from "react";

// Site-wide smooth scrolling (Lenis) and a map's own wheel-zoom both listen
// for the same wheel events. Left alone they fight: the map zooms while the
// page scrolls out from under it. Letting the map always own the wheel would
// trap visitors on full-screen maps with no way to scroll past. So the map
// only takes the wheel after a click, and gives it back when the cursor
// leaves -- the same "engage to zoom" pattern embedded maps commonly use.
export function useMapEngage() {
  const [engaged, setEngaged] = useState(false);
  const [hovering, setHovering] = useState(false);

  const wrapperProps = {
    "data-lenis-prevent": engaged ? "" : undefined,
    onPointerDown: () => setEngaged(true),
    onMouseEnter: () => setHovering(true),
    onMouseLeave: () => {
      setHovering(false);
      setEngaged(false);
    },
  };

  return { engaged, showHint: hovering && !engaged, wrapperProps };
}
