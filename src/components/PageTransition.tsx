import { ViewTransition, type ReactNode } from "react";

const SLIDE = { "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" };

/** Slides a page in from the side of the dock icon that was picked. Plain navigations just swap. */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter={SLIDE} exit={SLIDE} default="none">
      {children}
    </ViewTransition>
  );
}
