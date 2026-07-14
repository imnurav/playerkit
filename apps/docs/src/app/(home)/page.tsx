"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 min-h-screen bg-background font-sans relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

      <main className="flex flex-col flex-1 w-full max-w-6xl mx-auto px-6 pt-32 pb-16 z-10">

        {/* Hero Section */}
        <section className="flex flex-col items-center text-center gap-8 mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-sm font-medium border border-indigo-500/20 mb-4">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            v0.0.6 is now available
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl text-foreground">
            The video player for the <br />
            <span className="pk-hero-gradient">modern web</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
            A production-ready, framework-first video player supporting HLS, YouTube, and MP4. Zero configuration required, entirely customizable.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
            <Link
              href="/docs/getting-started/installation"
              className="flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-8 text-background font-medium transition-transform hover:scale-105"
            >
              Get Started
            </Link>

            <div className="flex h-12 items-center justify-between gap-4 rounded-full border border-border bg-muted/30 px-6 font-mono text-sm text-muted-foreground">
              <span>npm i @playerkit/react</span>
              <button
                className="cursor-pointer text-foreground hover:text-indigo-500 transition-colors"
                title="Copy command"
                onClick={(e) => {
                  navigator.clipboard.writeText("npm i @playerkit/react @playerkit/core @playerkit/ui");
                  const el = e.currentTarget;
                  const originalText = el.innerHTML;
                  el.innerHTML = "Copied!";
                  setTimeout(() => { el.innerHTML = originalText }, 2000);
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </button>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-32">
          {features.map((f, i) => (
            <div key={i} className="pk-card-hover flex flex-col gap-3 p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-2">
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </section>

        {/* Code Snippets Section */}
        <section className="flex flex-col gap-12 w-full max-w-4xl mx-auto border border-border rounded-3xl overflow-hidden bg-zinc-950 shadow-2xl">
          <div className="flex items-center gap-2 px-4 py-3 bg-zinc-900 border-b border-white/10">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="ml-2 text-xs font-mono text-zinc-400">app.tsx</span>
          </div>
          <div className="p-6 md:p-8 overflow-x-auto">
            <pre className="font-mono text-sm leading-relaxed text-zinc-100">
              <span className="text-pink-400">import</span> {"{"} Player {"}"} <span className="text-pink-400">from</span> <span className="text-green-300">&quot;@playerkit/react&quot;</span>;
              {"\n\n"}
              <span className="text-pink-400">export default function</span> <span className="text-blue-300">App</span>() {"{"}
              {"\n"}
              {"  "}<span className="text-pink-400">return</span> (
              {"\n"}
              {"    "}&lt;<span className="text-indigo-300">Player</span>
              {"\n"}
              {"      "}<span className="text-blue-200">src</span>=<span className="text-green-300">&quot;https://example.com/stream.m3u8&quot;</span>
              {"\n"}
              {"      "}<span className="text-blue-200">autoPlay</span>
              {"\n"}
              {"      "}<span className="text-blue-200">muted</span>
              {"\n"}
              {"    "}/&gt;
              {"\n"}
              {"  "});
              {"\n"}
              {"}"}
            </pre>
          </div>
        </section>

      </main>
    </div>
  );
}

const features = [
  {
    title: "Auto-Detection",
    desc: "Just pass a URL. PlayerKit automatically routes it to the HLS, YouTube, or MP4 engine natively.",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
  },
  {
    title: "Live Streams",
    desc: "First-class support for live broadcasts with DVR seek-back, latency tuning, and live-edge snapping.",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle></svg>
  },
  {
    title: "Token Auth",
    desc: "Built-in fetcher/refresher architecture for playing secure streams behind authenticated CDNs.",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
  },
  {
    title: "Tree Shakeable",
    desc: "Import only what you need. If you only use the HLS player, the YouTube API never enters your bundle.",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
  },
  {
    title: "Headless Hooks",
    desc: "Want total control over the DOM? Use useHlsPlayer() to build your own UI from scratch.",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
  },
  {
    title: "Mobile Gestures",
    desc: "Native-feeling touch zones. Double tap to seek, swipe up for volume, all included out of the box.",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
  },
];
