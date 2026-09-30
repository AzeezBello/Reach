"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Volume2, VolumeX } from "lucide-react";

type Props = {
  src: string;
  poster: string;
  title: string;
  /**
   * `story`: tap to play with sound and native controls (nothing downloads
   * until the resident taps).
   * `ambient`: muted, looping background clip that only auto-plays on
   * larger screens when the resident has not asked for reduced motion or
   * reduced data.
   */
  mode?: "story" | "ambient";
  className?: string;
};

export function VideoPlayer({
  src,
  poster,
  title,
  mode = "story",
  className = "",
}: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    if (mode !== "ambient") return;

    const video = ref.current;
    if (!video) return;

    const wide = window.matchMedia("(min-width: 768px)").matches;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const saveData = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection?.saveData;

    if (!wide || reduceMotion || saveData) return;

    video.muted = true;
    video
      .play()
      .then(() => setStarted(true))
      .catch(() => {});
  }, [mode]);

  function start() {
    const video = ref.current;
    if (!video) return;

    if (mode === "story") {
      video.muted = false;
      setMuted(false);
    }

    video
      .play()
      .then(() => setStarted(true))
      .catch(() => {});
  }

  function toggleMute() {
    const video = ref.current;
    if (!video) return;

    video.muted = !video.muted;
    setMuted(video.muted);
  }

  return (
    <div className={`group relative isolate overflow-hidden bg-ink ${className}`}>
      <video
        ref={ref}
        src={src}
        poster={poster}
        preload={mode === "ambient" ? "metadata" : "none"}
        playsInline
        muted
        loop={mode === "ambient"}
        controls={mode === "story" && started}
        aria-label={title}
        className="h-full w-full object-cover"
      />

      {!started && (
        <button
          type="button"
          onClick={start}
          aria-label={`Play ${title}`}
          className="absolute inset-0 flex items-center justify-center bg-linear-to-t from-ink/80 via-ink/10 to-transparent"
        >
          <span className="flex size-16 items-center justify-center rounded-full bg-white/95 text-brand-800 shadow-xl transition group-hover:scale-105">
            <Play size={26} fill="currentColor" className="ml-1" />
          </span>
        </button>
      )}

      {mode === "ambient" && started && (
        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? "Turn sound on" : "Turn sound off"}
          className="absolute bottom-4 right-4 flex size-10 items-center justify-center rounded-full bg-ink/70 text-white backdrop-blur transition hover:bg-ink"
        >
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      )}
    </div>
  );
}
