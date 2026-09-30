"use client";

import type { ComponentProps, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@pathwayiq/ui/components/button";
import { cn } from "@pathwayiq/ui/lib/utils";
import styles from "./hero-section-9.module.css";

type HeroAction = {
  text: string;
  icon?: ReactNode;
  variant?: ComponentProps<typeof Button>["variant"];
  className?: string;
} & ({ href: string; onClick?: never } | { href?: never; onClick: () => void });

type HeroStat = { value: string; label: string; icon: ReactNode };
type HeroImage = { src: string; alt: string; objectPosition?: string };

export interface HeroSectionProps {
  title: ReactNode;
  subtitle: string;
  eyebrow?: string;
  actions: HeroAction[];
  stats: HeroStat[];
  images: [HeroImage, HeroImage, HeroImage];
  collageNote?: ReactNode;
  className?: string;
  id?: string;
}

/** Photo-collage hero adapted from the supplied hero-section-9 component. */
export default function HeroSection({
  title, subtitle, eyebrow, actions, stats, images, collageNote, className, id = "hero",
}: HeroSectionProps) {
  const reduceMotion = useReducedMotion();
  const entrance = (delay: number) => ({
    initial: false as const,
    animate: reduceMotion ? { y: 0 } : { y: [16, 0] },
    transition: { duration: 0.6, delay, ease: "easeOut" as const },
  });

  return (
    <section id={id} className={cn(styles.hero, className)} aria-labelledby={`${id}-title`}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          {eyebrow && <motion.p className={styles.eyebrow} {...entrance(0)}>
            <span aria-hidden="true" />{eyebrow}
          </motion.p>}
          <motion.h1 id={`${id}-title`} className={styles.title} {...entrance(0.05)}>
            {title}
          </motion.h1>
          <motion.p className={styles.subtitle} {...entrance(0.1)}>{subtitle}</motion.p>
          <motion.div className={styles.actions} {...entrance(0.15)}>
            {actions.map((action) => {
              const content = <>{action.text}{action.icon}</>;
              const buttonClass = cn(styles.action, action.className);
              return action.href !== undefined ? (
                <Button key={action.text} asChild variant={action.variant} size="lg" className={buttonClass}>
                  <Link href={action.href}>{content}</Link>
                </Button>
              ) : (
                <Button key={action.text} type="button" onClick={action.onClick} variant={action.variant} size="lg" className={buttonClass}>
                  {content}
                </Button>
              );
            })}
          </motion.div>
          <motion.ul className={styles.stats} {...entrance(0.2)}>
            {stats.map((stat) => <li key={stat.value}>
              <span className={styles.statIcon} aria-hidden="true">{stat.icon}</span>
              <div><p>{stat.value}</p><span>{stat.label}</span></div>
            </li>)}
          </motion.ul>
        </div>

        <div className={styles.collage}>
          <div className={styles.orbit} aria-hidden="true" />
          {[styles.circle, styles.square, styles.dot].map((shape, index) => (
            <motion.div
              key={shape}
              className={cn(styles.shape, shape)}
              aria-hidden="true"
              initial={false}
              animate={reduceMotion ? { y: 0 } : { y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: 1, delay: index * 0.15, ease: "easeInOut" }}
            />
          ))}
          {images.map((image, index) => (
            // The positioning wrapper keeps CSS rotation separate from Motion's transforms.
            <div key={image.src} className={cn(styles.photoPosition, styles[`photo${index + 1}`])}>
              <motion.div
                className={styles.photoFrame}
                initial={false}
                animate={reduceMotion ? { scale: 1, y: 0 } : { scale: [0.96, 1], y: [18, 0] }}
                transition={{ duration: 0.65, delay: index * 0.12, ease: "easeOut" }}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes={index === 0 ? "(max-width: 600px) 58vw, 340px" : "(max-width: 600px) 45vw, 260px"}
                  preload={index === 0}
                  className={styles.photo}
                  style={{ objectPosition: image.objectPosition }}
                />
              </motion.div>
            </div>
          ))}
          {collageNote && <motion.div className={styles.collageNote} {...entrance(0.3)}>
            {collageNote}
          </motion.div>}
        </div>
      </div>
    </section>
  );
}
