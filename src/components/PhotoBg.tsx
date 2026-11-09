import Image from "next/image";
import type { ReactNode } from "react";
import { creditText } from "@/lib/calc";
import type { Photo } from "@/lib/data";

/**
 * A landmark photo behind content, with a dark fade so white text on top stays
 * readable. `credit="link"` shows the photographer and licence as a link;
 * inside buttons (no nested links) the credit goes in the tooltip and the
 * full list is on the Learn page.
 */
export function PhotoBg({ photo, children, className = "", credit = "title", priority = false }: { photo?: Photo; children?: ReactNode; className?: string; credit?: "link" | "title"; priority?: boolean }) {
  return (
    <div className={"photo " + className + (photo ? "" : " no-photo")}>
      {photo && <Image src={photo.src} alt={photo.alt} title={credit === "title" ? creditText(photo) : undefined} fill unoptimized priority={priority} loading={priority ? undefined : "lazy"} sizes="(max-width: 720px) 100vw, 480px" />}
      <div className="photo-ov">{children}</div>
      {photo && credit === "link" && (
        <a className="photo-credit" href={photo.page} target="_blank" rel="noopener noreferrer">
          {creditText(photo)}
        </a>
      )}
    </div>
  );
}
