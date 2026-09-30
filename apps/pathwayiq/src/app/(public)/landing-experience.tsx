"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowDown, ArrowRight, ArrowUpRight, BookOpen, Check, ChevronDown,
  Code2, Compass, FlaskConical, GraduationCap, Layers3,
  Lightbulb, Network, Plus, Rocket, ShieldCheck, Sparkles,
  Sprout, Users,
} from "lucide-react";
import { DropdownNavigation, type NavigationItem } from "@/components/ui/dropdown-navigation";
import FeaturesBlock from "@/components/ui/features-2";
import HeroSection from "@/components/ui/hero-section-9";
import StudentPossibilities from "@/components/ui/student-possibilities";
import styles from "./landing.module.css";

const AUDIENCES = [
  {
    label: "Students", icon: GraduationCap, title: "Your curiosity deserves a place to go.",
    body: "Find your coursework, connect with your learning community, and create space for ideas beyond the syllabus.",
    points: ["Keep your classes and assignments together", "Learn alongside peers and mentors", "Connect what you learn to what you create"],
    tag: "A SPACE TO FIND YOUR PATH", visualTitle: "What will you explore next?",
    items: ["Creative thinking", "Technology & AI", "Sustainable futures"],
  },
  {
    label: "Educators", icon: BookOpen, title: "More connection. More moments of discovery.",
    body: "Bring learning materials, classroom conversations, and assignments into a shared space built around your students.",
    points: ["Organize reusable course content", "Keep announcements and schedules in reach", "Support learning through meaningful feedback"],
    tag: "A SPACE TO INSPIRE", visualTitle: "Make learning a shared experience.",
    items: ["Course content", "Classroom activity", "Mentor feedback"],
  },
  {
    label: "Institutions", icon: Network, title: "One connected campus. Your way of working.",
    body: "An Academic Operating System that brings people and learning together across your institution’s organizational structure.",
    points: ["Organize schools, faculties, and departments", "Manage roles and scoped access", "Connect academic teams in one platform"],
    tag: "A SPACE TO CONNECT", visualTitle: "Different structures. Shared possibilities.",
    items: ["Schools & campuses", "Faculties & departments", "People & permissions"],
  },
];

const FAQS = [
  ["What is Pathway IQ?", "Pathway IQ is an Academic Operating System (AOS) that brings institutional structure, classrooms, course content, and learning communities into one platform. Its direction is to connect that foundation with AI-assisted learning and student innovation."],
  ["Who is the platform for?", "Students, educators, mentors, and academic teams. Students get a shared learning space, educators organize coursework, and institutions manage their people, organizational hierarchy, and access."],
  ["Are the AI and portfolio features available now?", "AI guidance, project journeys, and portfolios are part of the product vision and are planned experiences. Sign in to explore the features enabled for your account."],
  ["Can different institutions use their own structure?", "Yes. Institutions can have different organizational hierarchies, with roles and permissions assigned at the relevant levels. The exact setup and available features depend on your institution’s configuration."],
  ["How do I get access?", "Use the account provided by your institution or platform administrator, then sign in. If you do not have an account yet, contact your institution’s academic or platform team."],
];

function Brand() {
  return <a className={styles.brand} href="#top" aria-label="Pathway IQ home">
    <span className={styles.brandMark}><Network size={23} strokeWidth={2.2} aria-hidden="true" /></span>
    <span>pathway<span className={styles.brandIq}>iq</span><span className={styles.brandDot}>.</span></span>
  </a>;
}

export function LandingExperience({ signedIn }: { signedIn: boolean }) {
  const [audience, setAudience] = useState(0);
  const person = AUDIENCES[audience];
  const entryHref = signedIn ? "/app" : "/login";
  const entryLabel = signedIn ? "Open your workspace" : "Explore your workspace";

  const navigation: NavigationItem[] = [
    {
      id: "platform", label: "The platform", subMenus: [
        { title: "Learning, connected", items: [
          { label: "Classrooms & courses", description: "Your everyday learning, in one place.", icon: BookOpen, href: "#platform" },
          { label: "Community & workspaces", description: "A shared space for curious minds.", icon: Users, href: "#community" },
        ] },
        { title: "A world of possibility", items: [
          { label: "AI-assisted learning", description: "Explore our vision for thoughtful guidance.", icon: Sparkles, href: "#ai-learning" },
          { label: "Student innovation", description: "From a first question to a meaningful idea.", icon: Lightbulb, href: "#innovation" },
        ] },
      ],
    },
    {
      id: "audiences", label: "Who it’s for", subMenus: [
        { title: "Find your place", items: AUDIENCES.map((item, index) => ({
          label: item.label,
          description: ["Learn, explore, and create your own path.", "Inspire discovery in every classroom.", "Connect your people and academic teams."][index],
          icon: item.icon, href: "#community", onSelect: () => setAudience(index),
        })) },
      ],
    },
    {
      id: "resources", label: "Resources", subMenus: [
        { title: "Get to know Pathway IQ", items: [
          { label: "About the platform", description: "Discover the Academic Operating System.", icon: Network, href: "#platform" },
          { label: "Platform features", description: "Collaboration, learning, and institutional flexibility.", icon: Layers3, href: "#features" },
          { label: "Questions & answers", description: "Features, institutions, and getting access.", icon: BookOpen, href: "#faq" },
          { label: signedIn ? "Your workspace" : "Access your workspace", description: "Continue with your institution account.", icon: GraduationCap, href: entryHref },
        ] },
      ],
    },
    { id: "vision", label: "Our vision", href: "#innovation" },
  ];

  return (
    <div className={styles.landing} id="top">
      <a href="#main-content" className={styles.skipLink}>Skip to content</a>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Brand />
          <DropdownNavigation navItems={navigation} />
          <div className={styles.headerActions}>
            <Link href={entryHref} className={styles.signIn}>{signedIn ? "Open app" : "Sign in"}<ArrowUpRight size={16} aria-hidden="true" /></Link>
          </div>
        </div>
      </header>

      <main id="main-content" tabIndex={-1}>
        <HeroSection
          eyebrow="A NEW CHAPTER IN LEARNING"
          title={<>Learn with<br />purpose.<br /><em>Build what’s next.</em></>}
          subtitle="Big ideas start with curious minds. A connected space for learning, creating, and growing—with AI-powered guidance at the heart of our vision."
          actions={[
            { text: entryLabel, href: entryHref, icon: <ArrowUpRight size={18} aria-hidden="true" /> },
            { text: "Meet Pathway IQ", href: "#platform", variant: "outline", icon: <ArrowDown size={16} aria-hidden="true" /> },
          ]}
          stats={[
            { value: "Learn", label: "At your pace", icon: <BookOpen /> },
            { value: "Create", label: "With purpose", icon: <Lightbulb /> },
            { value: "Connect", label: "As a community", icon: <Users /> },
          ]}
          images={[
            { src: "/images/hero/student-community.jpg", alt: "Students exploring an idea together around a laptop in a library", objectPosition: "50% 55%" },
            { src: "/images/hero/collaborative-learning.jpg", alt: "Three learners collaborating with laptops and notebooks", objectPosition: "55% 50%" },
            { src: "/images/hero/focused-study.jpg", alt: "A learner taking handwritten notes beside a laptop" },
          ]}
          collageNote={<><span aria-hidden="true"><Sparkles size={19} /></span><span><strong>Ideas grow here.</strong><small>Curious minds. Shared possibilities.</small></span></>}
        />

        <div className={styles.purposeStrip}><div className={styles.container}><p>ONE CONNECTED LEARNING ECOSYSTEM</p><div><span><BookOpen aria-hidden="true" />Learning</span><Plus aria-hidden="true" /><span><Lightbulb aria-hidden="true" />Innovation</span><Plus aria-hidden="true" /><span><Users aria-hidden="true" />Community</span><Plus aria-hidden="true" /><span><Sprout aria-hidden="true" />Growth</span></div></div></div>

        <section id="platform" className={`${styles.container} ${styles.section}`} aria-labelledby="platform-title">
          <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>THE BIGGER PICTURE</p><h2 id="platform-title">More than a classroom.<br />A place for possibility.</h2></div><p>Bring the everyday essentials together.<br />Make space for extraordinary ideas.</p></div>
          <div className={styles.featureGrid}>
            <article className={`${styles.featureCard} ${styles.learningCard}`}><span className={styles.featureIcon}><BookOpen size={24} aria-hidden="true" /></span><span className={styles.featureNumber}>01 / LEARN</span><h3>Everything you need.<br />Room to go further.</h3><p>Courses, classrooms, assignments, and schedules. A clearer view of your learning, all in one place.</p><div className={styles.stackedLessons} aria-hidden="true"><div><span className={styles.lessonIcon}><FlaskConical size={18} /></span><span>Explore. Question. Discover.<small>Your next chapter starts here</small></span><ArrowUpRight size={17} /></div><div><span className={styles.lessonIcon}><Code2 size={18} /></span><span>From understanding to doing<small>Put your knowledge into practice</small></span><ArrowUpRight size={17} /></div></div></article>
            <article id="ai-learning" className={`${styles.featureCard} ${styles.aiCard}`}><span className={styles.featureIcon}><Sparkles size={24} aria-hidden="true" /></span><span className={styles.featureNumber}>02 / EXPLORE <span>OUR VISION</span></span><h3>A thinking partner.<br />For your next “aha.”</h3><p>Our AI vision: guidance that helps you ask better questions, explore ideas, and build your own understanding.</p><div className={styles.ideaGraphic} aria-hidden="true"><span>What if…</span><span><Sparkles size={25} /></span><span>Let’s explore.</span></div></article>
            <article className={`${styles.featureCard} ${styles.communityCard}`}><span className={styles.featureIcon}><Users size={24} aria-hidden="true" /></span><span className={styles.featureNumber}>03 / CONNECT</span><h3>Great things happen<br />when minds meet.</h3><p>Shared workspaces and classroom communities connect students, educators, and the people who help them grow.</p><div className={styles.communityGraphic} aria-hidden="true"><span>YOU</span><span><GraduationCap size={22} /></span><span><Lightbulb size={22} /></span><span><BookOpen size={22} /></span><span>Better, together.</span></div></article>
          </div>
        </section>

        <FeaturesBlock onExploreInstitutions={() => setAudience(2)} />

        <section id="community" className={styles.audienceSection} aria-labelledby="community-title"><div className={styles.container}>
          <div className={styles.centerHeading}><p className={styles.eyebrow}>DIFFERENT ROLES. SHARED POSSIBILITIES.</p><h2 id="community-title">A place for every curious mind.</h2></div>
          <div className={styles.audienceSwitch} role="group" aria-label="Choose your perspective">{AUDIENCES.map((item, index) => <button type="button" key={item.label} aria-pressed={audience === index} aria-controls="audience-content" onClick={() => setAudience(index)}><item.icon size={18} aria-hidden="true" />{item.label}</button>)}</div>
          <div id="audience-content" className={styles.audienceContent} aria-live="polite" aria-atomic="true">
            <div className={styles.audienceCopy}><h3>{person.title}</h3><p>{person.body}</p><ul>{person.points.map((point) => <li key={point}><Check size={17} aria-hidden="true" />{point}</li>)}</ul><Link href={entryHref} className={styles.textLink}>{signedIn ? "Go to your workspace" : "Sign in to your workspace"}<ArrowRight size={17} aria-hidden="true" /></Link></div>
            <div className={styles.audienceVisual}><div className={styles.audienceVisualTop}><span>{person.tag}</span><Compass size={24} aria-hidden="true" /></div><h4>{person.visualTitle}</h4><div className={styles.exploreList}>{person.items.map((item, index) => <div key={item}><span>0{index + 1}</span><strong>{item}</strong><ArrowUpRight size={18} aria-hidden="true" /></div>)}</div><span className={styles.visualStamp}><Sparkles size={15} aria-hidden="true" /> Made for possibility</span></div>
          </div>
        </div></section>

        <section id="innovation" className={`${styles.container} ${styles.section} ${styles.innovation}`} aria-labelledby="innovation-title">
          <div><p className={styles.eyebrow}>THE PATH AHEAD</p><h2 id="innovation-title">Today, a question.<br />Tomorrow, an impact.</h2><p className={styles.innovationIntro}>We’re building toward a future where learning doesn’t end at the assignment. It becomes something you can make, share, and be proud of.</p><span className={styles.visionPill}><Rocket size={15} aria-hidden="true" /> Our student innovation vision</span></div>
          <ol className={styles.steps}><li><span>01</span><div><h3>Follow your curiosity</h3><p>Connect what you’re learning to a problem you care about.</p></div><Lightbulb aria-hidden="true" /></li><li><span>02</span><div><h3>Make something meaningful</h3><p>Bring an idea to life with peers, mentors, and room to experiment.</p></div><Layers3 aria-hidden="true" /></li><li><span>03</span><div><h3>Show the world what you can do</h3><p>Build a portfolio that tells the story behind your skills.</p></div><ArrowUpRight aria-hidden="true" /></li></ol>
        </section>

        <StudentPossibilities />

        <section id="faq" className={`${styles.container} ${styles.faqSection}`} aria-labelledby="faq-title"><div><p className={styles.eyebrow}>A LITTLE MORE CLARITY</p><h2 id="faq-title">Good questions.<br />A great place to start.</h2></div><div className={styles.faqList}>{FAQS.map(([question, answer]) => <details key={question}><summary>{question}<ChevronDown size={18} aria-hidden="true" /></summary><p>{answer}</p></details>)}</div></section>

        <section className={`${styles.container} ${styles.cta}`} aria-labelledby="cta-title"><span className={styles.ctaOrb} aria-hidden="true" /><div><p className={styles.eyebrow}>YOUR NEXT CHAPTER</p><h2 id="cta-title">Stay curious.<br /><span>Go make a difference.</span></h2><p>Your learning journey has a place to call home.</p></div><div className={styles.ctaActions}><Link href={entryHref} className={styles.limeButton}>{entryLabel}<ArrowUpRight size={19} aria-hidden="true" /></Link><span><ShieldCheck size={14} aria-hidden="true" /> Use your institution-provided account</span></div></section>
      </main>

      <footer className={`${styles.container} ${styles.footer}`}><div><Brand /><p>The Academic Operating System<br />for a world of possibility.</p></div><nav aria-label="Footer navigation"><a href="#platform">The platform</a><a href="#community">Our community</a><a href="#innovation">Our vision</a><Link href={entryHref}>{signedIn ? "Open app" : "Sign in"}<ArrowUpRight size={14} aria-hidden="true" /></Link></nav><div className={styles.footerBottom}><span>© {new Date().getFullYear()} Pathway IQ</span><span>Built for learning. Designed for what’s next.</span></div></footer>
    </div>
  );
}
