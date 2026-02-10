"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code2,
  ChevronDown,
  Cpu,
  Bot,
  X,
  BookOpen,
  FileText,
  Dumbbell,
  Microchip,
  MemoryStick,
  Network,
  LayoutList,
} from "lucide-react";

const ALGOLOGIC_STYLE = {
  fontFamily: "'Source Sans Pro', sans-serif",
  primary: "var(--alg-primary)",
  secondary: "var(--alg-secondary)",
  bg: "var(--alg-bg)",
  text: "var(--alg-text)",
  white: "var(--alg-white)",
  mint: "var(--alg-mint)",
  yellow: "var(--alg-yellow)",
  pink: "var(--alg-pink)",
  aiAccent: "var(--alg-ai-accent)",
  bottomNav: "var(--alg-bottom-nav)",
  headerBar: "var(--alg-header-bar)",
};

function TopNav() {
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [referenceOpen, setReferenceOpen] = useState(false);
  const [exercisesOpen, setExercisesOpen] = useState(false);

  const closeAll = () => {
    setTutorialOpen(false);
    setReferenceOpen(false);
    setExercisesOpen(false);
    if (typeof document !== "undefined") document.body.style.overflow = "auto";
  };

  const toggle = (setter: (v: boolean) => void, current: boolean) => {
    setTutorialOpen(false);
    setReferenceOpen(false);
    setExercisesOpen(false);
    setter(!current);
    if (typeof document !== "undefined")
      document.body.style.overflow = !current ? "hidden" : "auto";
  };

  return (
    <>
      <nav
        className="sticky top-0 z-[1000] flex items-center justify-between px-5 py-2.5"
        style={{ background: ALGOLOGIC_STYLE.white }}
      >
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-black"
            style={{ color: ALGOLOGIC_STYLE.primary }}
          >
            <Code2 className="h-6 w-6" />
            AlgoLogic
          </Link>
          <ul className="hidden sm:flex gap-5 list-none">
            <li>
              <button
                onClick={() => toggle(setTutorialOpen, tutorialOpen)}
                className="flex items-center gap-1 text-[17px] font-semibold cursor-pointer border-0 bg-transparent"
                style={{ color: ALGOLOGIC_STYLE.text }}
              >
                Tutorials <ChevronDown className="h-4 w-4" />
              </button>
            </li>
            <li>
              <button
                onClick={() => toggle(setReferenceOpen, referenceOpen)}
                className="flex items-center gap-1 text-[17px] font-semibold cursor-pointer border-0 bg-transparent"
                style={{ color: ALGOLOGIC_STYLE.text }}
              >
                References <ChevronDown className="h-4 w-4" />
              </button>
            </li>
            <li>
              <button
                onClick={() => toggle(setExercisesOpen, exercisesOpen)}
                className="flex items-center gap-1 text-[17px] font-semibold cursor-pointer border-0 bg-transparent"
                style={{ color: ALGOLOGIC_STYLE.text }}
              >
                Exercises <ChevronDown className="h-4 w-4" />
              </button>
            </li>
          </ul>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="py-2 px-6 rounded-full font-bold text-white no-underline"
            style={{ background: ALGOLOGIC_STYLE.secondary }}
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Tutorials overlay */}
      <AnimatePresence>
        {tutorialOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed left-0 top-[60px] w-full z-[999] overflow-y-auto"
            style={{
              height: "calc(100% - 60px)",
              background: ALGOLOGIC_STYLE.bottomNav,
              color: ALGOLOGIC_STYLE.white,
              padding: "40px 60px",
            }}
          >
            <button
              onClick={closeAll}
              className="absolute top-2 right-5 text-3xl cursor-pointer hover:opacity-80"
            >
              &times;
            </button>
            <div
              className="text-center py-3 rounded-lg mb-8 uppercase font-black tracking-widest text-lg"
              style={{ background: ALGOLOGIC_STYLE.headerBar }}
            >
              Learning Tracks
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-[1300px] mx-auto">
              <div>
                <h3
                  className="text-[22px] mb-5 pb-1 border-b border-white/10"
                  style={{ color: ALGOLOGIC_STYLE.yellow }}
                >
                  Operating Systems
                </h3>
                <ul className="list-none">
                  <li className="mb-3 text-[15px]">
                    <span className="font-bold text-white">1.</span>{" "}
                    <Link href="/theory/os" className="text-[#bbb] no-underline ml-1 hover:text-[var(--alg-secondary)] hover:underline">
                      Full OS Course
                    </Link>
                  </li>
                  <li className="mb-3 text-[15px]">
                    <span className="font-bold text-white">2.</span>{" "}
                    <Link href="/modules" className="text-[#bbb] no-underline ml-1 hover:text-[var(--alg-secondary)] hover:underline">
                      Kernel &amp; Algorithms
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3
                  className="text-[22px] mb-5 pb-1 border-b border-white/10"
                  style={{ color: ALGOLOGIC_STYLE.yellow }}
                >
                  AI &amp; Machine Learning
                </h3>
                <ul className="list-none">
                  <li className="mb-3 text-[15px]">
                    <span className="font-bold text-white">1.</span>{" "}
                    <Link href="/modules" className="text-[#bbb] no-underline ml-1 hover:text-[var(--alg-secondary)] hover:underline">
                      AI / ML Modules
                    </Link>
                  </li>
                  <li className="mb-3 text-[15px]">
                    <span className="font-bold text-white">2.</span>{" "}
                    <Link href="/aiml/neural-network" className="text-[#bbb] no-underline ml-1 hover:text-[var(--alg-secondary)] hover:underline">
                      Neural Networks
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* References overlay */}
      <AnimatePresence>
        {referenceOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed left-0 top-[60px] w-full z-[999] overflow-y-auto"
            style={{
              height: "calc(100% - 60px)",
              background: ALGOLOGIC_STYLE.bottomNav,
              color: ALGOLOGIC_STYLE.white,
              padding: "40px 60px",
            }}
          >
            <button
              onClick={closeAll}
              className="absolute top-2 right-5 text-3xl cursor-pointer hover:opacity-80"
            >
              &times;
            </button>
            <div
              className="text-center py-3 rounded-lg mb-8 uppercase font-black tracking-widest text-lg"
              style={{ background: ALGOLOGIC_STYLE.headerBar }}
            >
              Quick References
            </div>
            <p className="text-center w-full text-white/80">Reference guides coming soon...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exercises overlay */}
      <AnimatePresence>
        {exercisesOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] overflow-y-auto py-20 px-10"
            style={{
              background: "linear-gradient(135deg, #064E3B 0%, #022c22 100%)",
              color: ALGOLOGIC_STYLE.white,
            }}
          >
            <button
              onClick={closeAll}
              className="absolute top-8 right-10 text-4xl cursor-pointer hover:opacity-80 leading-none"
            >
              &times;
            </button>
            <div className="text-center mb-12">
              <h2
                className="text-5xl font-black mb-2"
                style={{ color: ALGOLOGIC_STYLE.yellow, textShadow: "2px 2px 10px rgba(0,0,0,0.3)" }}
              >
                Exercises
              </h2>
              <p className="text-xl font-semibold opacity-90">
                Master complex logic through hands-on practice
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-[1200px] mx-auto">
              <div
                className="p-10 rounded-[35px] transition-all duration-300 hover:-translate-y-4 hover:shadow-2xl"
                style={{
                  background: ALGOLOGIC_STYLE.mint,
                  color: ALGOLOGIC_STYLE.primary,
                  boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
                }}
              >
                <h3 className="text-3xl font-black mb-8 pb-2 border-b-2 border-[#064E3B]/10">
                  OSY Exercises
                </h3>
                <ul className="list-none">
                  <li className="flex justify-between items-center mb-6 text-[19px] font-bold py-2 px-2 rounded-xl hover:bg-white/30 transition-colors">
                    <span className="flex items-center gap-4">
                      <Microchip className="h-7 w-7" /> CPU Scheduling
                    </span>
                    <Link
                      href="/cpu-scheduling"
                      className="bg-[var(--alg-primary)] text-white no-underline font-extrabold py-2 px-5 rounded-full text-sm hover:bg-[var(--alg-secondary)] hover:scale-105 transition-all"
                    >
                      Practice Now
                    </Link>
                  </li>
                  <li className="flex justify-between items-center mb-6 text-[19px] font-bold py-2 px-2 rounded-xl hover:bg-white/30 transition-colors">
                    <span className="flex items-center gap-4">
                      <MemoryStick className="h-7 w-7" /> Page Replacement
                    </span>
                    <Link
                      href="/page-replacement"
                      className="bg-[var(--alg-primary)] text-white no-underline font-extrabold py-2 px-5 rounded-full text-sm hover:bg-[var(--alg-secondary)] hover:scale-105 transition-all"
                    >
                      Practice Now
                    </Link>
                  </li>
                  <li className="flex justify-between items-center mb-6 text-[19px] font-bold py-2 px-2 rounded-xl hover:bg-white/30 transition-colors">
                    <span className="flex items-center gap-4">
                      <LayoutList className="h-7 w-7" /> Memory Management
                    </span>
                    <Link
                      href="/memory-management"
                      className="bg-[var(--alg-primary)] text-white no-underline font-extrabold py-2 px-5 rounded-full text-sm hover:bg-[var(--alg-secondary)] hover:scale-105 transition-all"
                    >
                      Practice Now
                    </Link>
                  </li>
                </ul>
              </div>
              <div
                className="p-10 rounded-[35px] transition-all duration-300 hover:-translate-y-4 hover:shadow-2xl"
                style={{
                  background: ALGOLOGIC_STYLE.yellow,
                  color: ALGOLOGIC_STYLE.primary,
                  boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
                }}
              >
                <h3 className="text-3xl font-black mb-8 pb-2 border-b-2 border-[#064E3B]/10">
                  AIML Exercises
                </h3>
                <ul className="list-none">
                  <li className="flex justify-between items-center mb-6 text-[19px] font-bold py-2 px-2 rounded-xl hover:bg-white/30 transition-colors">
                    <span className="flex items-center gap-4">
                      <Network className="h-7 w-7" /> Neural Networks
                    </span>
                    <Link
                      href="/aiml/neural-network"
                      className="bg-[var(--alg-primary)] text-white no-underline font-extrabold py-2 px-5 rounded-full text-sm hover:bg-[var(--alg-secondary)] hover:scale-105 transition-all"
                    >
                      Practice Now
                    </Link>
                  </li>
                  <li className="flex justify-between items-center mb-6 text-[19px] font-bold py-2 px-2 rounded-xl hover:bg-white/30 transition-colors">
                    <span className="flex items-center gap-4">
                      <Bot className="h-7 w-7" /> K-Means Clustering
                    </span>
                    <Link
                      href="/aiml/kmeans"
                      className="bg-[var(--alg-primary)] text-white no-underline font-extrabold py-2 px-5 rounded-full text-sm hover:bg-[var(--alg-secondary)] hover:scale-105 transition-all"
                    >
                      Practice Now
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function BottomNav() {
  return (
    <nav
      className="flex gap-8 justify-center py-3 px-5"
      style={{ background: ALGOLOGIC_STYLE.bottomNav }}
    >
      <Link
        href="/"
        className="text-white no-underline uppercase text-sm font-bold tracking-wider hover:text-[var(--alg-secondary)]"
      >
        Home
      </Link>
      <Link
        href="/about"
        className="text-white no-underline uppercase text-sm font-bold tracking-wider hover:text-[var(--alg-secondary)]"
      >
        About Us
      </Link>
      <Link
        href="/contact"
        className="text-white no-underline uppercase text-sm font-bold tracking-wider hover:text-[var(--alg-secondary)]"
      >
        Contact Us
      </Link>
      <Link
        href="/contact"
        className="text-white no-underline uppercase text-sm font-bold tracking-wider hover:text-[var(--alg-secondary)]"
      >
        Feedback
      </Link>
    </nav>
  );
}

function HeroSection() {
  return (
    <section
      className="relative text-center pt-24 pb-36 px-5"
      style={{ background: ALGOLOGIC_STYLE.primary, color: ALGOLOGIC_STYLE.white }}
    >
      <h1 className="text-5xl md:text-[65px] font-black mb-2">MASTERING OS &amp; AI</h1>
      <p className="text-xl md:text-[22px] font-bold mb-6">Learning hard concepts made easier</p>
      <div className="flex justify-center mb-10">
        <Image
          src="/assets/logos/logo1.png"
          alt="AlgoLogic"
          width={80}
          height={80}
          className="rounded-xl object-contain"
        />
      </div>
      <div className="flex flex-wrap justify-center gap-5 mb-12">
        <Link
          href="/theory/os"
          className="py-2.5 px-9 rounded-full no-underline font-bold text-lg transition-all hover:scale-105"
          style={{ background: ALGOLOGIC_STYLE.white, color: ALGOLOGIC_STYLE.text }}
        >
          Learning
        </Link>
        <Link
          href="/modules"
          className="py-2.5 px-9 rounded-full no-underline font-bold text-lg transition-all hover:scale-105"
          style={{ background: ALGOLOGIC_STYLE.white, color: ALGOLOGIC_STYLE.text }}
        >
          Animations
        </Link>
        <Link
          href="/dashboard/quiz"
          className="py-2.5 px-9 rounded-full no-underline font-bold text-lg transition-all hover:scale-105"
          style={{ background: ALGOLOGIC_STYLE.white, color: ALGOLOGIC_STYLE.text }}
        >
          Quiz
        </Link>
      </div>
      <div className="absolute bottom-0 left-0 w-full leading-none overflow-hidden">
        <svg
          className="relative block w-[calc(100%+1.3px)] h-[100px]"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C58.47,105.1,123,103,184.7,85.12,242,68.52,274.19,65.17,321.39,56.44Z"
            fill={ALGOLOGIC_STYLE.mint}
          />
        </svg>
      </div>
    </section>
  );
}

function OSCardSection() {
  const [hover, setHover] = useState(false);
  return (
    <section
      className="py-24 px-[10%] flex flex-wrap justify-between items-center gap-12"
      style={{ background: ALGOLOGIC_STYLE.mint }}
    >
      <div className="flex-1 min-w-[300px] text-left">
        <h2 className="text-4xl md:text-[55px] font-black mb-2 leading-tight" style={{ color: ALGOLOGIC_STYLE.text }}>
          Operating System
        </h2>
        <p className="text-xl font-bold mb-10" style={{ color: ALGOLOGIC_STYLE.text }}>
          Explore Process, Memory, and File Management
        </p>
        <div className="flex flex-col gap-4">
          <Link
            href="/theory/os"
            className="w-[280px] py-3.5 rounded-full no-underline font-bold text-xl text-center transition-all hover:-translate-y-1 hover:shadow-lg"
            style={{ background: ALGOLOGIC_STYLE.secondary, color: ALGOLOGIC_STYLE.white }}
          >
            Learn OSY
          </Link>
          <Link
            href="/modules"
            className="w-[280px] py-3.5 rounded-full no-underline font-bold text-xl text-center transition-all hover:-translate-y-1 hover:shadow-lg"
            style={{ background: ALGOLOGIC_STYLE.text, color: ALGOLOGIC_STYLE.white }}
          >
            Animations
          </Link>
          <Link
            href="/dashboard/quiz"
            className="w-[280px] py-3.5 rounded-full no-underline font-bold text-xl text-center transition-all hover:-translate-y-1 hover:shadow-lg"
            style={{ background: ALGOLOGIC_STYLE.pink, color: ALGOLOGIC_STYLE.text }}
          >
            Quiz
          </Link>
        </div>
      </div>
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className={`relative w-[250px] h-[250px] flex items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden rounded-full ${
          hover ? "w-[480px] h-[280px] rounded-[30px] -translate-y-2" : ""
        }`}
        style={{
          background: ALGOLOGIC_STYLE.primary,
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        }}
      >
        <div
          className={`transition-transform duration-500 ${hover ? "-translate-x-[140px] scale-90" : ""}`}
          style={{ color: ALGOLOGIC_STYLE.secondary }}
        >
          <Cpu className="h-20 w-20" />
        </div>
        <div
          className={`absolute w-[240px] text-white transition-all duration-500 ${
            hover ? "right-10 opacity-100" : "right-[-250px] opacity-0"
          }`}
        >
          <h3 className="text-2xl font-bold mb-1" style={{ color: ALGOLOGIC_STYLE.secondary }}>
            Kernel Active
          </h3>
          <div className="flex flex-col gap-2 mt-2">
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-[var(--alg-secondary)] rounded-full animate-pulse" style={{ width: "60%" }} />
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-[var(--alg-secondary)] rounded-full animate-pulse" style={{ width: "40%", animationDelay: "0.2s" }} />
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-[var(--alg-secondary)] rounded-full animate-pulse" style={{ width: "80%", animationDelay: "0.4s" }} />
            </div>
          </div>
          <p className="text-sm mt-2">Simulating Priority Scheduling...</p>
        </div>
      </div>
    </section>
  );
}

function AICardSection() {
  const [hover, setHover] = useState(false);
  return (
    <section
      className="py-24 px-[10%] flex flex-wrap justify-between items-center gap-12"
      style={{ background: ALGOLOGIC_STYLE.yellow }}
    >
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className={`relative w-[250px] h-[250px] flex items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden rounded-full order-2 md:order-1 ${
          hover ? "w-[480px] h-[280px] rounded-[30px] -translate-y-2" : ""
        }`}
        style={{
          background: ALGOLOGIC_STYLE.aiAccent,
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        }}
      >
        <div
          className={`transition-transform duration-500 ${hover ? "translate-x-[140px] scale-90" : ""}`}
          style={{ color: ALGOLOGIC_STYLE.yellow }}
        >
          <Bot className="h-20 w-20" />
        </div>
        <div
          className={`absolute w-[240px] text-white transition-all duration-500 ${
            hover ? "left-10 opacity-100" : "left-[-250px] opacity-0"
          }`}
        >
          <h3 className="text-2xl font-bold mb-1" style={{ color: ALGOLOGIC_STYLE.yellow }}>
            AI Processing
          </h3>
          <div className="flex flex-col gap-2 mt-2">
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-[var(--alg-yellow)] rounded-full animate-pulse" style={{ width: "70%" }} />
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-[var(--alg-yellow)] rounded-full animate-pulse" style={{ width: "50%", animationDelay: "0.2s" }} />
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-[var(--alg-yellow)] rounded-full animate-pulse" style={{ width: "90%", animationDelay: "0.4s" }} />
            </div>
          </div>
          <p className="text-sm mt-2">Computing Neural Weights...</p>
        </div>
      </div>
      <div className="flex-1 min-w-[300px] text-right order-1 md:order-2">
        <h2 className="text-4xl md:text-[55px] font-black mb-2 leading-tight" style={{ color: ALGOLOGIC_STYLE.text }}>
          Artificial Intelligence
        </h2>
        <p className="text-xl font-bold mb-10" style={{ color: ALGOLOGIC_STYLE.text }}>
          Where data meets intelligence
        </p>
        <div className="flex flex-col gap-4 items-end">
          <Link
            href="/modules"
            className="w-[280px] py-3.5 rounded-full no-underline font-bold text-xl text-center transition-all hover:-translate-y-1 hover:shadow-lg"
            style={{ background: ALGOLOGIC_STYLE.secondary, color: ALGOLOGIC_STYLE.white }}
          >
            Learn AI/ML
          </Link>
          <Link
            href="/aiml/kmeans"
            className="w-[280px] py-3.5 rounded-full no-underline font-bold text-xl text-center transition-all hover:-translate-y-1 hover:shadow-lg"
            style={{ background: ALGOLOGIC_STYLE.text, color: ALGOLOGIC_STYLE.white }}
          >
            Animations
          </Link>
          <Link
            href="/dashboard/quiz"
            className="w-[280px] py-3.5 rounded-full no-underline font-bold text-xl text-center transition-all hover:-translate-y-1 hover:shadow-lg"
            style={{ background: ALGOLOGIC_STYLE.pink, color: ALGOLOGIC_STYLE.text }}
          >
            Quiz
          </Link>
        </div>
      </div>
    </section>
  );
}

export function AlgoLogicHome() {
  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{
        fontFamily: ALGOLOGIC_STYLE.fontFamily,
        background: ALGOLOGIC_STYLE.bg,
        color: ALGOLOGIC_STYLE.text,
      }}
    >
      <TopNav />
      <BottomNav />
      <HeroSection />
      <OSCardSection />
      <AICardSection />
    </div>
  );
}
