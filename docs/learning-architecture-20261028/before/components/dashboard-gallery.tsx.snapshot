"use client";

/* eslint-disable @next/next/no-img-element -- pre-optimised WebP with manual
   srcset; the Next image optimiser needs a server and this is a static export. */

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import type { GalleryShot } from "@/lib/case-studies";
import { cn } from "@/lib/utils";

export function DashboardGallery({
  shots,
  label = "Dashboard screenshots",
}: {
  shots: GalleryShot[];
  label?: string;
}) {
  const [active, setActive] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const open = (index: number) => {
    setActive(index);
    dialogRef.current?.showModal();
  };

  const close = () => {
    dialogRef.current?.close();
    setActive(null);
  };

  const step = useCallback(
    (direction: number) => {
      setActive((current) => {
        if (current === null) return current;
        return (current + direction + shots.length) % shots.length;
      });
    },
    [shots.length],
  );

  useEffect(() => {
    if (active === null) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    }
    document.addEventListener("keydown", onKeyDown);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [active, step]);

  const current = active === null ? null : shots[active];

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2" aria-label={label}>
        {shots.map((shot, index) => (
          <figure
            key={shot.src}
            className={cn(
              "group overflow-hidden rounded-2xl border border-border bg-card/40",
              index === 0 && "md:col-span-2",
            )}
          >
            <button
              type="button"
              onClick={() => open(index)}
              className="relative block w-full overflow-hidden text-left"
              aria-label={`Open screenshot ${index + 1}: ${shot.caption}`}
            >
              <img
                src={shot.src}
                srcSet={shot.srcSet}
                sizes={index === 0 ? "(min-width: 768px) 1100px, 100vw" : "(min-width: 768px) 540px, 100vw"}
                alt={shot.alt}
                width={shot.width}
                height={shot.height}
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
                className="h-auto w-full border-b border-border transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-[1.01]"
              />
              <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/85 text-foreground opacity-0 shadow-sm backdrop-blur transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                <Expand className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </button>
            <figcaption className="flex items-start gap-2 px-4 py-3 text-xs leading-5 text-muted-foreground">
              <span className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              {shot.caption}
            </figcaption>
          </figure>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        onClose={() => setActive(null)}
        onClick={(event) => {
          // A click that lands on the dialog element itself is a backdrop click.
          if (event.target === dialogRef.current) close();
        }}
        aria-label="Dashboard screenshot viewer"
        className="m-auto max-h-[92vh] w-[min(96vw,1200px)] overflow-hidden rounded-3xl border border-border bg-background p-0 text-foreground shadow-2xl backdrop:bg-black/75 backdrop:backdrop-blur-sm"
      >
        {current ? (
          <div className="flex max-h-[92vh] flex-col">
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
              <p className="min-w-0 truncate text-xs text-muted-foreground">
                <span className="font-mono text-foreground">
                  {String((active ?? 0) + 1).padStart(2, "0")} / {String(shots.length).padStart(2, "0")}
                </span>
                <span className="ml-3">{current.caption}</span>
              </p>
              <button
                type="button"
                onClick={close}
                aria-label="Close viewer"
                className="press flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <div className="relative bg-card/40">
              <img
                src={current.src.replace("-1200.webp", "-2000.webp")}
                alt={current.alt}
                width={current.width}
                height={current.height}
                className="max-h-[76vh] w-full object-contain"
              />
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
              <button
                type="button"
                onClick={() => step(-1)}
                className="press inline-flex h-9 items-center gap-1.5 rounded-full border border-border-strong px-4 text-xs hover:bg-card"
              >
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Previous
              </button>
              <p className="hidden text-[11px] text-muted-foreground sm:block">
                Use ← → to move between views
              </p>
              <button
                type="button"
                onClick={() => step(1)}
                className="press inline-flex h-9 items-center gap-1.5 rounded-full border border-border-strong px-4 text-xs hover:bg-card"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
