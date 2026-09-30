"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useAnimationFrame, useInView, useMotionValue } from "framer-motion";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { cn } from "@pathwayiq/ui/lib/utils";
import styles from "./infinite-moving-cards.module.css";

export type InfiniteMovingCardItem = {
  id?: string | number;
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  avatar?: string;
  name?: string;
  role?: string;
  rating?: number;
  tags?: string[];
};

export type InfiniteMovingCardsProps<T extends InfiniteMovingCardItem = InfiniteMovingCardItem> = {
  items: T[];
  direction?: "left" | "right";
  speed?: "slow" | "normal" | "fast";
  pauseOnHover?: boolean;
  className?: string;
  cardClassName?: string;
  gap?: number;
  loop?: boolean;
  showGradientMask?: boolean;
  renderItem?: (item: T, index: number) => React.ReactNode;
  ariaLabel?: string;
};

const SPEED = { slow: 26, normal: 44, fast: 74 };
const wrap = (value: number, period: number) => -(((-value % period) + period) % period);
const motionQuery = "(prefers-reduced-motion: reduce)";
const getReducedMotion = () => window.matchMedia(motionQuery).matches;
const getServerReducedMotion = () => false;
function subscribeToReducedMotion(onChange: () => void) {
  const media = window.matchMedia(motionQuery);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/** Adapted from the supplied marquee, with measured seams and accessible controls. */
export function InfiniteMovingCards<T extends InfiniteMovingCardItem = InfiniteMovingCardItem>({
  items, direction = "left", speed = "normal", pauseOnHover = true,
  className, cardClassName, gap = 16, loop = true, showGradientMask = true,
  renderItem, ariaLabel = "Ideas gallery",
}: InfiniteMovingCardsProps<T>) {
  // A stable server snapshot prevents hydration mismatches and follows live preference changes.
  const reduceMotion = React.useSyncExternalStore(subscribeToReducedMotion, getReducedMotion, getServerReducedMotion);
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const groupRef = React.useRef<HTMLDivElement>(null);
  const inView = useInView(viewportRef);
  const viewportId = React.useId();
  const x = useMotionValue(0);
  const [size, setSize] = React.useState({ content: 0, viewport: 0 });
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [paused, setPaused] = React.useState(false);
  const safeGap = Math.max(0, gap);
  const period = size.content + safeGap;
  const canMove = items.length > 1;
  const isLooping = loop && canMove && !reduceMotion;
  const copies = isLooping && size.content > 0 ? Math.max(2, Math.ceil(size.viewport / period) + 1) : 1;
  const limit = Math.max(0, size.content - size.viewport);

  React.useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const group = groupRef.current;
    if (!viewport || !group) return;
    const measure = () => {
      const content = group.getBoundingClientRect().width;
      const width = viewport.clientWidth;
      setSize((current) => current.content === content && current.viewport === width
        ? current : { content, viewport: width });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(group);
    return () => observer.disconnect();
  }, [items.length, safeGap]);

  React.useEffect(() => {
    x.set(reduceMotion || direction === "left" ? 0 : -(isLooping ? period : limit));
  }, [direction, period, limit, isLooping, reduceMotion, x]);

  useAnimationFrame((_, delta) => {
    if (!canMove || reduceMotion || paused || focused || !inView || (pauseOnHover && hovered) || !size.content) return;
    const next = x.get() + (direction === "left" ? -1 : 1) * SPEED[speed] * Math.min(delta, 64) / 1000;
    x.set(isLooping ? wrap(next, period) : Math.max(-limit, Math.min(0, next)));
  });

  function step(direction: -1 | 1) {
    setPaused(true);
    const distance = (groupRef.current?.firstElementChild?.getBoundingClientRect().width ?? 350) + safeGap;
    if (reduceMotion) {
      viewportRef.current?.scrollBy({ left: direction * distance, behavior: "instant" });
    } else {
      const next = x.get() - direction * distance;
      x.set(isLooping ? wrap(next, period) : Math.max(-limit, Math.min(0, next)));
    }
  }

  if (!items.length) return null;

  return (
    <div className={cn(styles.gallery, className)} role="region" aria-label={ariaLabel}>
      <div className={cn(styles.frame, showGradientMask && styles.mask)}>
        <div
          ref={viewportRef}
          id={viewportId}
          className={cn(styles.viewport, reduceMotion && styles.static)}
          tabIndex={0}
          aria-label={`${ariaLabel}. Use left and right arrow keys to browse.`}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocusCapture={() => setFocused(true)}
          onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
            event.preventDefault();
            step(event.key === "ArrowRight" ? 1 : -1);
          }}
        >
          <motion.div className={styles.track} style={{ x: reduceMotion ? 0 : x, gap: safeGap }}>
            {Array.from({ length: copies }, (_, copy) => (
              <div
                key={copy}
                ref={copy === 0 ? groupRef : undefined}
                className={cn(styles.group, copy > 0 && styles.duplicate)}
                style={{ gap: safeGap }}
                role="list"
                aria-hidden={copy > 0 ? true : undefined}
                inert={copy > 0 ? true : undefined}
              >
                {items.map((item, index) => (
                  <div className={cn(styles.card, cardClassName)} role="listitem" key={item.id ?? index}>
                    {renderItem ? renderItem(item, index) : <DefaultCard item={item} />}
                  </div>
                ))}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
      {canMove && <div className={styles.controls}>
        <span className={styles.hint}>{reduceMotion ? "Explore at your own pace" : "A little inspiration, in motion"}</span>
        <div className={styles.buttons}>
          {!reduceMotion && <button type="button" onClick={() => setPaused(!paused)} aria-controls={viewportId} className={styles.pause}>
            {paused ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}
            {paused ? "Resume gallery" : "Pause gallery"}
          </button>}
          <button type="button" onClick={() => step(-1)} aria-label="Previous idea" aria-controls={viewportId}><ArrowLeft size={16} aria-hidden="true" /></button>
          <button type="button" onClick={() => step(1)} aria-label="Next idea" aria-controls={viewportId}><ArrowRight size={16} aria-hidden="true" /></button>
        </div>
      </div>}
    </div>
  );
}

function DefaultCard({ item }: { item: InfiniteMovingCardItem }) {
  const rating = typeof item.rating === "number" ? Math.max(0, Math.min(5, Math.round(item.rating))) : null;
  return <article className={styles.defaultCard}>
    {item.image && <div className={styles.image}><Image src={item.image} alt={item.imageAlt ?? item.title ?? ""} fill sizes="350px" /></div>}
    <div className={styles.body}>
      {item.title && <h3>{item.title}</h3>}
      {item.description && <p>{item.description}</p>}
      {rating !== null && <span className={styles.rating} aria-label={`${rating} out of 5 stars`}>{"★".repeat(rating)}</span>}
      {!!item.tags?.length && <div className={styles.tags}>{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>}
      {(item.avatar || item.name || item.role) && <div className={styles.person}>
        {item.avatar && <Image src={item.avatar} alt="" width={32} height={32} />}
        <div>{item.name && <strong>{item.name}</strong>}{item.role && <p>{item.role}</p>}</div>
      </div>}
    </div>
  </article>;
}

export default InfiniteMovingCards;
