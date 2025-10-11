import Footer from '../components/layout/Footer';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

const ease = [0.22, 1, 0.36, 1];

// Reusable variants
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

export default function LandingPage() {
  // Parallax offsets for subtle background accents in the hero
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    // Respect reduced motion
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const reduce = media?.matches;
    if (reduce) return;

    const onScroll = () => setOffset(window.scrollY || 0);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Clamp transforms for tiny motion only
  const t1 = Math.max(-12, Math.min(12, offset * 0.06));
  const t2 = Math.max(-18, Math.min(18, offset * 0.09));

  return (
    <div>
      {/* Hero with parallax gradient accents */}
      <motion.section initial="hidden" animate="visible" className="relative">
        {/* Background gradient */}
        <div className="bg-gradient-to-br from-primary-200 via-card-500 to-accent-200">
          <div className="relative mx-auto max-w-6xl px-4 py-16 grid md:grid-cols-2 gap-10 items-center">
            {/* Parallax layers (decorative) */}
            <div className="pointer-events-none absolute inset-0 -z-0">
              <div
                aria-hidden="true"
                style={{ transform: `translateY(${t1}px)` }}
                className="absolute -top-12 -left-12 w-72 h-72 rounded-full bg-primary-300/40 blur-3xl"
              />
              <div
                aria-hidden="true"
                style={{ transform: `translateY(${t2}px)` }}
                className="absolute -bottom-10 right-0 w-80 h-80 rounded-full bg-accent-200/50 blur-3xl"
              />
            </div>

            {/* Content */}
            <motion.div variants={stagger} className="relative z-10">
              <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-bold text-neutral-900">
                Welcome to RecoRead
              </motion.h1>

              <motion.p variants={fadeUp} className="mt-4 text-neutral-800 text-lg">
                Your intelligent reading companion — organize your library, create concise AI summaries, and uncover
                books you’ll love.
              </motion.p>

              <motion.ul variants={stagger} className="mt-6 space-y-2 text-neutral-800">
                {[
                  'Build and curate your personal library in one place',
                  'Find titles quickly with a powerful, global catalog search',
                  'Turn notes and excerpts into clear, helpful AI summaries',
                  'Get thoughtful recommendations tailored to your interests',
                ].map((text, i) => (
                  <motion.li key={i} variants={fadeUp} className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-primary-600" />
                    <span>{text}</span>
                  </motion.li>
                ))}
              </motion.ul>

              <motion.div variants={stagger} className="mt-8 flex gap-3">
                <motion.a
                  variants={fadeUp}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                  href="/register"
                  className="btn-primary"
                >
                  Get Started
                </motion.a>
                <motion.a
                  variants={fadeUp}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                  href="/login"
                  className="px-6 py-3 rounded border border-primary-600 text-primary-700 hover:bg-primary-600 hover:text-white"
                >
                  Sign In
                </motion.a>
              </motion.div>
            </motion.div>

            {/* Value card */}
            <motion.div
              variants={fadeUp}
              whileHover={{ y: -4 }}
              className="relative z-10 rounded-xl border border-neutral-300 bg-card-500 p-6 shadow-xl"
            >
              <h3 className="text-xl font-semibold text-neutral-900">Why RecoRead?</h3>
              <p className="mt-2 text-neutral-800">
                RecoRead pairs a clean reading workflow with reliable, thoughtfully designed features for your everyday reading.
              </p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { eyebrow: 'Private', title: 'Account-first', desc: 'Your library is yours — sign in and pick up where you left off.' },
                  { eyebrow: 'Accurate', title: 'Smart search', desc: 'Quickly locate books across a rich, global catalog.' },
                  { eyebrow: 'Helpful', title: 'AI summaries', desc: 'Create concise, readable summaries from your notes and highlights.' },
                  { eyebrow: 'Personal', title: 'Recommendations', desc: 'Suggestions shaped by your topics, tags, and reading taste.' },
                ].map((card, i) => (
                  <motion.div key={i} variants={fadeUp} className="rounded-lg border border-neutral-300 p-4" whileHover={{ y: -2 }}>
                    <div className="text-sm text-neutral-700">{card.eyebrow}</div>
                    <div className="text-neutral-900 font-semibold">{card.title}</div>
                    <p className="text-neutral-700 text-sm mt-1">{card.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* How it works */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="mx-auto max-w-6xl px-4 py-12"
      >
        <h2 className="text-2xl font-semibold text-neutral-900">How RecoRead works</h2>
        <motion.div variants={stagger} className="mt-6 grid md:grid-cols-3 gap-6">
          {[
            {
              title: '1. Build your library',
              desc: 'Add books from the catalog or manually. Manage details, tags, and keep your shelf organized.',
            },
            {
              title: '2. Summarize in seconds',
              desc: 'Paste notes or excerpts and turn them into clear, actionable summaries.',
            },
            {
              title: '3. Discover more',
              desc: 'Explore recommendations aligned with the topics and authors you enjoy most.',
            },
          ].map((item, i) => (
            <motion.div key={i} variants={fadeUp} whileHover={{ y: -2 }} className="rounded-lg border border-neutral-300 bg-card-500 p-5">
              <div className="text-neutral-900 font-semibold">{item.title}</div>
              <p className="text-neutral-800 mt-2">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* About */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeIn}
        className="mx-auto max-w-6xl px-4 pb-14"
      >
        <h2 className="text-2xl font-semibold text-neutral-900">About RecoRead</h2>
        <p className="mt-3 text-neutral-800 leading-relaxed">
          RecoRead helps readers capture ideas, keep books organized, and discover what to read next. It combines fast
          search, effortless organization, AI‑assisted summaries, and meaningful suggestions — all in a simple, dependable
          experience built for readers.
        </p>
      </motion.section>

      <Footer />
    </div>
  );
}