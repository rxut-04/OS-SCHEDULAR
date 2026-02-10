"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AboutPage() {
  return (
    <div
      className="min-h-screen flex justify-center items-center py-8 px-5"
      style={{
        fontFamily: "'Source Sans Pro', sans-serif",
        background: "var(--alg-primary)",
        color: "white",
      }}
    >
      <div
        className="bg-white max-w-[800px] w-full mx-5 py-12 px-10 md:px-14 rounded-[30px] text-center shadow-2xl"
        style={{ color: "var(--alg-text)", boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
      >
        <h1 className="text-4xl md:text-[45px] font-black mb-5 uppercase" style={{ color: "var(--alg-primary)" }}>
          About <span className="text-[var(--alg-secondary)] font-bold">AlgoLogic</span>
        </h1>
        <p className="text-lg md:text-[19px] leading-relaxed text-gray-700 mb-6 text-justify">
          AlgoLogic was born out of a mission to demystify the most challenging pillars of Computer Science: <strong>Operating Systems</strong> and <strong>Artificial Intelligence</strong>. We recognized that while textbooks provide exhaustive technical data, they often lack the intuitive clarity required for true mastery.
        </p>
        <p className="text-lg md:text-[19px] leading-relaxed text-gray-700 mb-8 text-justify">
          Our platform serves as a specialized pedagogical tool that transforms abstract concepts—such as process synchronization and neural network architectures—into digestible, visual, and interactive learning modules. By combining rigorous academic standards with modern UI/UX principles, AlgoLogic empowers students to move beyond rote memorization toward a deeper, functional understanding of core computing logic.
        </p>
        <div className="grid grid-cols-3 gap-5 mt-10 pt-8 border-t border-gray-200">
          <div>
            <h3 className="font-bold mb-1" style={{ color: "var(--alg-primary)" }}>OSY</h3>
            <p className="text-sm text-gray-600 m-0 text-center">Conceptual Depth</p>
          </div>
          <div>
            <h3 className="font-bold mb-1" style={{ color: "var(--alg-primary)" }}>AIML</h3>
            <p className="text-sm text-gray-600 m-0 text-center">Data Logic</p>
          </div>
          <div>
            <h3 className="font-bold mb-1" style={{ color: "var(--alg-primary)" }}>Visuals</h3>
            <p className="text-sm text-gray-600 m-0 text-center">Interactive Learning</p>
          </div>
        </div>
        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 py-3 px-9 rounded-full font-bold text-white no-underline transition-all hover:-translate-y-0.5 hover:shadow-lg"
            style={{ background: "var(--alg-secondary)", boxShadow: "0 5px 15px rgba(16, 185, 129, 0.4)" }}
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
