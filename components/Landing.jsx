"use client";

import React, { useState, useEffect } from "react";

// =============================================================
// Waitlist modal
// =============================================================
function WaitlistModal({ open, onClose, onSigned }) {
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [challenge, setChallenge] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const valid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    /^\d{2}$/.test(age) &&
    challenge;

  const submit = async () => {
    if (!valid) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, age, challenge }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not save your signup. Try again.");
      }
      setDone(true);
      onSigned();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"
      >
        {!done ? (
          <>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">
              Join the waitlist
            </div>
            <h2 className="mt-2 font-serif text-3xl leading-tight text-stone-900">
              Be among the first
              <br />
              <span className="italic text-stone-500">to train as a gentleman.</span>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              Early access, founding member pricing, and direct input on what we build next.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                  Your email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1 w-full border-b-2 border-stone-200 bg-transparent py-2 font-serif text-lg text-stone-900 outline-none focus:border-stone-900"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                  Age
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="27"
                  className="mt-1 w-full border-b-2 border-stone-200 bg-transparent py-2 font-serif text-lg text-stone-900 outline-none focus:border-stone-900"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                  What's your biggest challenge?
                </label>
                <div className="mt-2 grid grid-cols-1 gap-2">
                  {[
                    "I never approach in person",
                    "I approach but freeze or fumble",
                    "Good in person, bad at text",
                    "Dating apps aren't working",
                  ].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setChallenge(opt)}
                      className={`rounded-xl border p-3 text-left text-sm transition ${
                        challenge === opt
                          ? "border-stone-900 bg-stone-900 text-white"
                          : "border-stone-200 bg-white text-stone-700 hover:border-stone-400"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-900">
                {error}
              </div>
            )}

            <button
              onClick={submit}
              disabled={!valid || submitting}
              className="mt-8 w-full rounded-full bg-stone-900 py-4 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-stone-700 disabled:bg-stone-300"
            >
              {submitting ? "Joining..." : "Join the waitlist"}
            </button>
            <button onClick={onClose} className="mt-3 w-full py-2 text-xs text-stone-500">
              Close
            </button>
          </>
        ) : (
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <svg
                className="h-8 w-8 text-emerald-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-stone-900">
              You're on the list.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              We'll reach out soon with early access. In the meantime, the work starts now.
              Every conversation you have this week is a rep. Pay attention.
            </p>
            <button
              onClick={onClose}
              className="mt-6 rounded-full bg-stone-900 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white"
            >
              Got it
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================
// Animated testimonial rotator
// =============================================================
const TESTIMONIALS = [
  {
    quote:
      "I hadn't approached a woman in two years. After a week of reps, I did it on a Thursday. She said yes.",
    author: "Marcus, 28",
  },
  {
    quote:
      "The coach calling out every line I said changed how I talk to everyone, not just dates.",
    author: "Daniel, 31",
  },
  {
    quote:
      "It felt terrifying at first. That was the point. Now real life feels easier than the app.",
    author: "Jordan, 24",
  },
];

function TestimonialRotator() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % TESTIMONIALS.length), 6000);
    return () => clearInterval(t);
  }, []);
  const t = TESTIMONIALS[i];
  return (
    <div className="min-h-[140px]" key={i}>
      <p className="animate-fadeIn font-serif text-2xl italic leading-snug text-stone-900">
        "{t.quote}"
      </p>
      <p className="mt-4 text-sm uppercase tracking-wider text-stone-500">{t.author}</p>
    </div>
  );
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="py-5">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-start justify-between gap-4 text-left"
      >
        <span className="font-serif text-xl leading-snug text-stone-900">{q}</span>
        <span
          className={`shrink-0 text-2xl text-stone-400 transition-transform ${
            open ? "rotate-45" : ""
          }`}
        >
          +
        </span>
      </button>
      {open && <p className="mt-3 text-base leading-relaxed text-stone-600">{a}</p>}
    </div>
  );
}

// =============================================================
// Main Landing
// =============================================================
export default function Landing() {
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [count, setCount] = useState(127);
  const [justSigned, setJustSigned] = useState(false);

  useEffect(() => {
    fetch("/api/waitlist")
      .then((r) => r.ok ? r.json() : { count: 0 })
      .then((data) => setCount(127 + (data.count || 0)))
      .catch(() => {});
  }, [justSigned]);

  const openWaitlist = () => setShowWaitlist(true);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 antialiased">
      {/* NAV */}
      <nav className="sticky top-0 z-40 border-b border-stone-200/60 bg-stone-50/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="font-serif text-lg tracking-tight text-stone-900">
            <span className="italic">Modern</span> Suitor
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#how" className="text-xs font-medium uppercase tracking-wider text-stone-600 hover:text-stone-900">
              How it works
            </a>
            <a href="#philosophy" className="text-xs font-medium uppercase tracking-wider text-stone-600 hover:text-stone-900">
              Philosophy
            </a>
            <a href="#faq" className="text-xs font-medium uppercase tracking-wider text-stone-600 hover:text-stone-900">
              FAQ
            </a>
          </div>
          <button
            onClick={openWaitlist}
            className="rounded-full bg-stone-900 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-stone-700"
          >
            Join waitlist
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden px-6 pb-24 pt-20 md:pb-40 md:pt-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-br from-amber-100/40 via-rose-100/30 to-transparent blur-3xl" />
        </div>

        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white/70 px-3 py-1 text-[11px] font-medium tracking-wider text-stone-600 backdrop-blur">
            <span className="inline-block h-1.5 w-1.5 animate-slowPulse rounded-full bg-emerald-500" />
            <span>Private beta opening soon</span>
          </div>

          <h1 className="font-serif text-5xl leading-[0.95] tracking-tight text-stone-900 md:text-7xl lg:text-8xl">
            Court her
            <br />
            <span className="italic text-stone-500">like she matters.</span>
          </h1>

          <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-stone-600 md:text-lg">
            Real reps with a real voice. Practice the conversation you're afraid to have,
            until your body knows the answer before she asks the question.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={openWaitlist}
              className="group relative w-full overflow-hidden rounded-full bg-stone-900 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-stone-700 sm:w-auto"
            >
              Join the waitlist
            </button>
            <a
              href="#how"
              className="text-xs font-medium uppercase tracking-wider text-stone-600 underline-offset-4 hover:underline"
            >
              See how it works ↓
            </a>
          </div>

          <div className="mt-8 text-xs font-medium text-stone-500">
            <span className="font-semibold text-stone-900">{count}</span> men already waiting
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="border-t border-stone-200 bg-stone-900 px-6 py-24 text-white">
        <div className="mx-auto max-w-4xl">
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
            The problem
          </div>
          <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
            You can read every book about approaching women
            <span className="text-stone-400"> and still freeze when it's time.</span>
          </h2>
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-stone-300 md:text-lg">
            Because courage isn't a belief. It's a muscle. And no one's ever taught you how to
            train it. Dating apps numbed your voice. Pickup artists gave you scripts that get
            you shut down. Real practice costs real rejection, and you've been avoiding it for
            years.
          </p>
          <p className="mt-6 max-w-2xl font-serif text-2xl italic leading-snug text-white">
            We built the gym for that muscle.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="border-t border-stone-200 px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">
            How it works
          </div>
          <h2 className="mt-4 font-serif text-4xl leading-tight text-stone-900 md:text-5xl">
            Four steps.
            <br />
            <span className="italic text-stone-500">Infinite reps.</span>
          </h2>

          <div className="mt-16 grid gap-10 md:grid-cols-2">
            {[
              {
                n: "01",
                title: "Pick the scene.",
                body:
                  "Coffee shop. Bookstore. Wine bar. Rooftop. Thirteen scenarios across four tracks, ranging from beginner to advanced. Each one is a real situation you've walked past a hundred times without saying a word.",
              },
              {
                n: "02",
                title: "Walk up. Speak.",
                body:
                  "Hold the mic. She's there, with a name, an age, a life. You speak. She answers, out loud. If you use a line, she'll shut you down. If you're present and real, she warms up. If she's not feeling it, she'll tell you.",
              },
              {
                n: "03",
                title: "Earn the handoff.",
                body:
                  "Get her number in person. Then keep it alive through text. This is where most men lose. One needy message, one compliment about her body, and the whole thing evaporates. We train the bridge.",
              },
              {
                n: "04",
                title: "Watch the tape.",
                body:
                  "Your coach reviews everything you said. Scores you on presence, curiosity, courage, humor, restraint. Points to the line where you lost her, and gives you the line you should have said. Then you run it back.",
              },
            ].map((step) => (
              <div key={step.n} className="relative">
                <div className="font-serif text-6xl text-stone-200">{step.n}</div>
                <h3 className="mt-2 font-serif text-2xl text-stone-900">{step.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-stone-600">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section id="philosophy" className="border-t border-stone-200 bg-amber-50/40 px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-900">
            Why this exists
          </div>
          <h2 className="mt-4 font-serif text-4xl leading-tight text-stone-900 md:text-5xl">
            A gentleman with real presence
            <span className="italic text-stone-500"> is a rare thing.</span>
          </h2>

          <div className="mt-10 space-y-6 text-base leading-relaxed text-stone-700 md:text-lg">
            <p>
              We built this as fathers and older brothers. We watched a generation of young men
              lose the thread, drowning in apps that reward the worst instincts and gurus that
              teach them to manipulate.
            </p>
            <p>
              We wanted something different. A place where a young man could learn the old
              skill of courtship, respectfully, and with enough practice that when he meets a
              woman he admires, he's already the man she hoped would walk up.
            </p>
            <p className="font-serif text-xl italic text-stone-900">
              Nothing great comes easy. Courting a queen least of all.
            </p>
          </div>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="border-t border-stone-200 px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">
            Inside Modern Suitor
          </div>
          <h2 className="mt-4 font-serif text-4xl leading-tight text-stone-900 md:text-5xl">
            What you'll actually do.
          </h2>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              {
                tag: "Voice reps",
                title: "She's real enough to reject you.",
                body:
                  "Every woman has her own standards, context, mood, and tolerance. No one here is a pushover.",
              },
              {
                tag: "Text bridge",
                title: "The handoff no one teaches.",
                body:
                  "Get her number in person, then keep her interested through text. Practice the transition that kills 80% of potential dates.",
              },
              {
                tag: "Coach review",
                title: "Line by line feedback.",
                body:
                  "Your coach watches every word you said and tells you what worked, what didn't, and what to try next time.",
              },
              {
                tag: "Progression",
                title: "From coffee shop to rooftop.",
                body:
                  "Unlock harder scenarios as you earn them. Nightlife opens after you've proven yourself in daytime.",
              },
              {
                tag: "Your profile",
                title: "You show up as you.",
                body:
                  "She'll ask what you do. She'll want to know your interests. You answer as yourself, because that's the actual skill.",
              },
              {
                tag: "Streaks",
                title: "One rep a day.",
                body: "Courage is built by repetition. We'll hold you to it gently.",
              },
            ].map((f) => (
              <div key={f.tag} className="rounded-2xl border border-stone-200 bg-white p-6">
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">
                  {f.tag}
                </div>
                <h3 className="mt-3 font-serif text-xl leading-tight text-stone-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="border-t border-stone-200 bg-stone-100 px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">
            Early testers
          </div>
          <div className="mt-8">
            <TestimonialRotator />
          </div>
          <div className="mt-8 flex justify-center gap-2">
            {TESTIMONIALS.map((_, i) => (
              <span key={i} className="h-1 w-8 rounded-full bg-stone-300" />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-stone-200 px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">
            Questions you probably have
          </div>
          <h2 className="mt-4 font-serif text-4xl leading-tight text-stone-900">FAQ.</h2>

          <div className="mt-10 divide-y divide-stone-200">
            {[
              {
                q: "Is this a dating app?",
                a: "No. Modern Suitor is a coaching and practice app. You're not matching with real women. You're training the skill of meeting them.",
              },
              {
                q: "Is this pickup artist stuff?",
                a: "No. We don't teach lines, tactics, or manipulation. We teach presence, curiosity, and courage. The women in the app reject pickup lines, same as real life.",
              },
              {
                q: "Why voice?",
                a: "Because real approaches happen in person, with your actual voice, in real time. Typing out what you'd say doesn't train the nervous system. Speaking does.",
              },
              {
                q: "How much does it cost?",
                a: "Waitlist members get founding member pricing. Pricing will be announced before launch. Think gym membership, not weekend bootcamp.",
              },
              {
                q: "Who's it for?",
                a: "Men 18 to 35 who want to build the courage and skill to meet women with respect and presence. If you're looking for a shortcut, this isn't it.",
              },
              {
                q: "Is this for women too?",
                a: "Eventually, yes. The name and the skill are gender-neutral. We're starting with the men's version because that's where the problem is loudest right now.",
              },
            ].map((item) => (
              <FAQItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-stone-200 bg-stone-900 px-6 py-32 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-5xl leading-[0.95] md:text-7xl">
            The work starts
            <br />
            <span className="italic text-stone-400">before she walks in.</span>
          </h2>
          <p className="mx-auto mt-8 max-w-lg text-base leading-relaxed text-stone-400">
            She's out there. You don't know when you'll see her. What matters is whether you
            trained for the moment.
          </p>
          <button
            onClick={openWaitlist}
            className="mt-12 rounded-full bg-white px-10 py-5 text-sm font-semibold uppercase tracking-wider text-stone-900 transition hover:bg-stone-100"
          >
            Join the waitlist
          </button>
          <div className="mt-6 text-xs text-stone-500">
            {count} men already waiting · No spam · Unsubscribe anytime
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-stone-800 bg-stone-950 px-6 py-12 text-stone-500">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="font-serif text-sm tracking-tight text-stone-300">
            <span className="italic">Modern</span> Suitor
          </div>
          <div className="text-xs">© 2026 Modern Suitor. Built for the men who still ask.</div>
        </div>
      </footer>

      <WaitlistModal
        open={showWaitlist}
        onClose={() => setShowWaitlist(false)}
        onSigned={() => setJustSigned((x) => !x)}
      />
    </div>
  );
}
