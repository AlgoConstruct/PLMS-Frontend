"use client";

import Image from "next/image";
import { ArrowUpRight, Lightbulb, Sparkles } from "lucide-react";
import { InfiniteMovingCards } from "./infinite-moving-cards";
import styles from "./student-possibilities.module.css";

const ideas = [
  {
    id: "learning", title: "Open more doors to learning.",
    description: "What if a simple learning tool could help a younger student explore ideas in their own language?",
    image: "/images/hero/student-community.jpg", imageAlt: "Students exploring an idea together around a laptop in a library",
    position: "50% 55%", caption: "Learning without limits", tags: ["Education", "Inclusive design"],
  },
  {
    id: "growing", title: "Grow ideas that give back.",
    description: "Explore how local knowledge, soil observations, and simple technology could support a farming community.",
    image: "/images/features/learning.jpg", imageAlt: "A learner writing goals and reflections in an open notebook",
    position: "50% 60%", caption: "Ideas with purpose", tags: ["Sustainability", "Technology"],
  },
  {
    id: "heritage", title: "Give local stories a digital home.",
    description: "Imagine an interactive map that brings the stories, places, and living traditions of your community together.",
    image: "/images/features/institution.jpg", imageAlt: "Library shelves holding a varied collection of books",
    position: "50% 48%", caption: "Stories worth sharing", tags: ["Local heritage", "Storytelling"],
  },
  {
    id: "environment", title: "Small observations. Lasting change.",
    description: "Start with a place you care about. Could a student-led observation project help people understand its environment?",
    image: "/images/features/collaboration.jpg", imageAlt: "A group collaborating around a table with laptops",
    position: "50% 60%", caption: "Better, together", tags: ["Environment", "Community"],
  },
];

export default function StudentPossibilities() {
  return <section id="possibilities" className={styles.section} aria-labelledby="possibilities-title">
    <div className={styles.inner}>
      <header className={styles.heading}>
        <div>
          <p className={styles.eyebrow}><Lightbulb size={15} aria-hidden="true" /> CURIOUS MINDS. BIG POSSIBILITIES.</p>
          <h2 id="possibilities-title">Inspired by possibility.<br /><span>Built by curious minds.</span></h2>
        </div>
        <p className={styles.intro}>Your next idea could start close to home. Turn the places, people, and questions around you into a new direction for learning.</p>
      </header>
      <InfiniteMovingCards items={ideas} speed="slow" gap={20} ariaLabel="Student project ideas" renderItem={(idea, index) => (
        <article className={styles.card}>
          <div className={styles.photo}>
            <Image src={idea.image} alt={idea.imageAlt} fill sizes="(max-width: 414px) calc(100vw - 64px), 350px" style={{ objectPosition: idea.position }} />
            <span className={styles.caption}><Sparkles size={11} aria-hidden="true" />{idea.caption}</span>
            <span className={styles.number} aria-hidden="true">0{index + 1}</span>
          </div>
          <div className={styles.copy}>
            <div className={styles.tags}>{idea.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            <h3>{idea.title}</h3>
            <p>{idea.description}</p>
            <div className={styles.prompt}><span>A QUESTION WORTH EXPLORING</span><ArrowUpRight size={15} aria-hidden="true" /></div>
          </div>
        </article>
      )} />
      <p className={styles.note}>A few ideas to spark your curiosity. These are project prompts, not completed student projects.</p>
    </div>
  </section>;
}
