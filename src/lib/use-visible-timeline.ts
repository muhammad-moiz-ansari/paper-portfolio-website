"use client";

import { useEffect, useMemo, type RefObject } from "react";

/** A local clock: pausing cancels browser callbacks and preserves remaining delays. */
class VisibleTimeline {
  private pausedAt: number | null = null;
  private pausedDuration = 0;
  private nextId = 0;
  private frames = new Map<number, { callback: FrameRequestCallback; native: number | null }>();
  private timers = new Map<number, { callback: () => void; due: number; native: ReturnType<typeof setTimeout> | null }>();

  now = () => (this.pausedAt ?? performance.now()) - this.pausedDuration;

  frame = (callback: FrameRequestCallback): number => {
    const id = ++this.nextId;
    this.frames.set(id, { callback, native: null });
    this.armFrame(id);
    return id;
  };

  cancelFrame = (id: number) => {
    const task = this.frames.get(id);
    if (task?.native != null) cancelAnimationFrame(task.native);
    this.frames.delete(id);
  };

  timeout = (callback: () => void, delay: number): number => {
    const id = ++this.nextId;
    this.timers.set(id, { callback, due: this.now() + delay, native: null });
    this.armTimer(id);
    return id;
  };

  clearTimeout = (id: number | undefined) => {
    if (id === undefined) return;
    const task = this.timers.get(id);
    if (task?.native != null) clearTimeout(task.native);
    this.timers.delete(id);
  };

  private armFrame(id: number) {
    const task = this.frames.get(id);
    if (!task || this.pausedAt !== null) return;
    task.native = requestAnimationFrame(() => {
      this.frames.delete(id);
      task.callback(this.now());
    });
  }

  private armTimer(id: number) {
    const task = this.timers.get(id);
    if (!task || this.pausedAt !== null) return;
    task.native = setTimeout(() => {
      this.timers.delete(id);
      task.callback();
    }, Math.max(0, task.due - this.now()));
  }

  setRunning(running: boolean) {
    if (!running && this.pausedAt === null) {
      this.pausedAt = performance.now();
      for (const task of this.frames.values()) {
        if (task.native !== null) cancelAnimationFrame(task.native);
        task.native = null;
      }
      for (const task of this.timers.values()) {
        if (task.native !== null) clearTimeout(task.native);
        task.native = null;
      }
    } else if (running && this.pausedAt !== null) {
      this.pausedDuration += performance.now() - this.pausedAt;
      this.pausedAt = null;
      for (const id of this.frames.keys()) this.armFrame(id);
      for (const id of this.timers.keys()) this.armTimer(id);
    }
  }

  dispose() {
    for (const id of this.frames.keys()) this.cancelFrame(id);
    for (const id of this.timers.keys()) this.clearTimeout(id);
    this.pausedAt = null;
    this.pausedDuration = 0;
  }
}

export function useVisibleTimeline(ref: RefObject<HTMLElement | null>, lifecycleKey = false) {
  const clock = useMemo(() => new VisibleTimeline(), []);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let visible = true;
    const sync = () => {
      const running = visible && !document.hidden;
      clock.setRunning(running);
      element.toggleAttribute("data-animation-paused", !running);
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(element);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      element.removeAttribute("data-animation-paused");
      clock.dispose();
    };
  }, [clock, ref, lifecycleKey]);
  return clock;
}
