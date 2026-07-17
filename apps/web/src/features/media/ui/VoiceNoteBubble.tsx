"use client";

import { useState, useRef, useEffect } from "react";
import type { MessageAttachmentDto } from "@repo/shared";

interface VoiceNoteBubbleProps {
  attachment: MessageAttachmentDto;
  isOwn: boolean;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VoiceNoteBubble({ attachment, isOwn }: VoiceNoteBubbleProps) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      audioRef.current?.pause();
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) {
      const audio = new Audio(attachment.mediaUrl);
      audioRef.current = audio;

      audio.addEventListener("loadedmetadata", () => {
        setDuration(audio.duration);
      });

      audio.addEventListener("ended", () => {
        setPlaying(false);
        setProgress(0);
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
      });

      audio.play();
      setPlaying(true);

      const updateProgress = () => {
        if (audioRef.current) {
          setProgress(audioRef.current.currentTime / (audioRef.current.duration || 1));
        }
        animationRef.current = requestAnimationFrame(updateProgress);
      };
      animationRef.current = requestAnimationFrame(updateProgress);
    } else if (audioRef.current.paused) {
      audioRef.current.play();
      setPlaying(true);

      const updateProgress = () => {
        if (audioRef.current) {
          setProgress(audioRef.current.currentTime / (audioRef.current.duration || 1));
        }
        animationRef.current = requestAnimationFrame(updateProgress);
      };
      animationRef.current = requestAnimationFrame(updateProgress);
    } else {
      audioRef.current.pause();
      setPlaying(false);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }
  };

  const currentTime = duration * progress;

  const barCount = 32;
  const bars = Array.from({ length: barCount }, (_, i) => {
    const height = 0.15 + Math.abs(Math.sin(i * 1.5)) * 0.45 + Math.random() * 0.4;
    return height;
  });

  return (
    <div
      className={`flex items-center gap-2 min-w-[200px] max-w-[280px] ${
        isOwn ? "flex-row" : "flex-row"
      }`}
    >
      <button
        type="button"
        onClick={togglePlay}
        className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
          isOwn
            ? "bg-white/20 text-white hover:bg-white/30"
            : "bg-primary-500 text-text-inverse hover:bg-primary-600"
        }`}
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        )}
      </button>

      <div className="flex-1 flex items-center gap-1 h-9">
        {bars.map((height, i) => (
          <div
            key={i}
            className={`flex-1 rounded-full transition-all duration-75 ${
              isOwn ? "bg-white/60" : "bg-primary-500/60"
            }`}
            style={{
              height: `${height * 100}%`,
              opacity: i / barCount <= progress ? 1 : 0.35,
            }}
          />
        ))}
      </div>

      <span
        className={`shrink-0 font-mono text-[11px] ${
          isOwn ? "text-white/70" : "text-text-muted"
        }`}
      >
        {duration > 0 ? formatDuration(currentTime) : "--:--"}
      </span>
    </div>
  );
}
