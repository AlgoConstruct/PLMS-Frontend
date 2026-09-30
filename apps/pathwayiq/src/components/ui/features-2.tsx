"use client";

import Image from "next/image";
import { ArrowRight, Check, GraduationCap, Network, Sparkles, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@pathwayiq/ui/components/avatar";
import { Badge } from "@pathwayiq/ui/components/badge";
import { Button } from "@pathwayiq/ui/components/button";
import { Separator } from "@pathwayiq/ui/components/separator";
import styles from "./features-2.module.css";

const rows = [
  {
    id: "feature-collaboration",
    eyebrow: "Collaboration",
    Icon: Users,
    title: "Great ideas grow when we learn together.",
    body: "Bring students, educators, and mentors into a shared learning space. Keep the people, resources, and conversations around your work connected.",
    bullets: [
      "Shared workspaces for your learning community",
      "Classrooms with coursework and announcements",
      "Membership roles for different contributions",
      "One place to connect learning and project work",
    ],
    cta: "Explore the community",
    href: "#community",
    image: "/images/features/collaboration.jpg",
    imageAlt: "A group collaborating around a table with laptops",
    imagePosition: "50% 58%",
    caption: "Different perspectives. Shared possibilities.",
    people: ["ST", "ED", "MT"],
    value: "Better, together.",
    label: "Students, educators & mentors",
    planned: false,
  },
  {
    id: "feature-ai",
    eyebrow: "AI-assisted learning",
    Icon: Sparkles,
    title: "A little guidance. A whole new perspective.",
    body: "We’re shaping an AI learning experience that encourages curiosity. A thinking partner to help you explore a question, understand an idea, and decide what to try next.",
    bullets: [
      "Guidance that supports your own thinking",
      "New ways to approach challenging concepts",
      "Ideas to connect learning with real problems",
      "Space to reflect, experiment, and grow",
    ],
    cta: "Discover our AI vision",
    href: "#innovation",
    image: "/images/features/learning.jpg",
    imageAlt: "A learner writing goals and reflections in an open notebook",
    imagePosition: "50% 60%",
    caption: "Curiosity leads. Thoughtful guidance follows.",
    people: ["?", "+", "→"],
    value: "Your next discovery.",
    label: "An experience we’re building toward",
    planned: true,
  },
  {
    id: "feature-institutions",
    eyebrow: "Institutional flexibility",
    Icon: Network,
    title: "Your institution is unique. Your platform should fit.",
    body: "Connect your academic community around the way it works. Pathway IQ brings organizational structure, roles, and access into the same learning ecosystem.",
    bullets: [
      "Configurable organizational hierarchies",
      "Roles and permissions at the relevant level",
      "Scoped assignments across academic teams",
      "Resource memberships for local collaboration",
    ],
    cta: "Explore institutional features",
    href: "#community",
    image: "/images/features/institution.jpg",
    imageAlt: "Library shelves holding a varied collection of academic books",
    imagePosition: "50% 50%",
    caption: "Different structures. One connected community.",
    people: ["SC", "FC", "DP"],
    value: "Your structure.",
    label: "Schools, faculties & departments",
    planned: false,
  },
];

/** Alternating feature rows adapted from the supplied features-2 component. */
export default function FeaturesBlock({ onExploreInstitutions }: { onExploreInstitutions?: () => void }) {
  return (
    <section id="features" className={styles.features} aria-labelledby="features-title">
      <div className={styles.inner}>
        <header className={styles.heading}>
          <Badge variant="outline" className={styles.badge}>
            <GraduationCap aria-hidden="true" /> The Pathway IQ platform
          </Badge>
          <h2 id="features-title">Built for every part of<br />your learning journey.</h2>
          <p>From shared ideas to individual discoveries, bring your learning community together in a space designed to grow with you.</p>
        </header>

        <div>
          {rows.map((row, index) => (
            <div key={row.id}>
              <article id={row.id} className={`${styles.row} ${index % 2 ? styles.reverse : ""}`} aria-labelledby={`${row.id}-title`}>
                <div className={styles.copy}>
                  <div className={styles.eyebrow}>
                    <span className={styles.eyebrowIcon}><row.Icon size={15} aria-hidden="true" /></span>
                    <span>{row.eyebrow}</span>
                    {row.planned && <Badge variant="outline" className={styles.planned}>Our vision</Badge>}
                  </div>
                  <h3 id={`${row.id}-title`}>{row.title}</h3>
                  <p className={styles.body}>{row.body}</p>
                  <ul className={styles.bullets}>
                    {row.bullets.map((bullet) => (
                      <li key={bullet}><span className={styles.check}><Check size={12} aria-hidden="true" /></span><span>{bullet}</span></li>
                    ))}
                  </ul>
                  <div className={styles.peopleLine}>
                    <div className={styles.avatars} aria-hidden="true">
                      {row.people.map((initials) => (
                        <Avatar key={initials} className={styles.avatar}>
                          <AvatarFallback className={styles.avatarFallback}>{initials}</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <div className={styles.peopleCopy}><strong>{row.value}</strong><span>{row.label}</span></div>
                  </div>
                  <div>
                    <Button variant="outline" asChild className={styles.cta}>
                      <a href={row.href} onClick={row.id === "feature-institutions" ? onExploreInstitutions : undefined}>
                        {row.cta}<ArrowRight size={16} data-icon="inline-end" aria-hidden="true" />
                      </a>
                    </Button>
                  </div>
                </div>

                <div className={styles.visual}>
                  <figure className={styles.imageFrame}>
                    <Image
                      src={row.image}
                      alt={row.imageAlt}
                      fill
                      sizes="(max-width: 700px) calc(100vw - 56px), (max-width: 1200px) 43vw, 500px"
                      className={styles.image}
                      style={{ objectPosition: row.imagePosition }}
                    />
                    <figcaption className={styles.caption}>
                      <span><row.Icon size={14} aria-hidden="true" /></span>{row.caption}
                    </figcaption>
                  </figure>
                  <span className={styles.imageNumber} aria-hidden="true">0{index + 1} / PATHWAY IQ</span>
                </div>
              </article>
              {index < rows.length - 1 && <Separator className={styles.separator} />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
