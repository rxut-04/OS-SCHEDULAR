"use client"

import { PulsingBorder, MeshGradient } from "@paper-design/shaders-react"
import { motion, AnimatePresence } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import Image from "next/image"
import { X } from "lucide-react"
import { RollingTextList } from "./rolling-list"

import Link from "next/link"

export function ShaderBackground() {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={containerRef} className="fixed inset-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
      {/* SVG Filters */}
      <svg className="absolute inset-0 w-0 h-0">
        <defs>
          <filter id="glass-effect" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence baseFrequency="0.005" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.3" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0.02
                      0 1 0 0 0.02
                      0 0 1 0 0.05
                      0 0 0 0.9 0"
              result="tint"
            />
          </filter>
          <filter id="gooey-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Background Shaders */}
      <MeshGradient
        className="absolute inset-0 w-full h-full"
        colors={["#000000", "#8B4513", "#ffffff", "#3E2723", "#5D4037"]}
        speed={0.3}
      />
      <MeshGradient
        className="absolute inset-0 w-full h-full opacity-60"
        colors={["#000000", "#ffffff", "#8B4513", "#000000"]}
        speed={0.2}
      />
    </div>
  )
}

export function PulsingCircle() {
  return (
    <div className="absolute bottom-8 right-8 z-30">
      <div className="relative w-20 h-20 flex items-center justify-center">
        {/* Pulsing Border Circle */}
        <PulsingBorder
          colors={["#BEECFF", "#E77EDC", "#FF4C3E", "#00FF88", "#FFD700", "#FF6B35", "#8A2BE2"]}
          colorBack="#00000000"
          speed={1.5}
          roundness={1}
          thickness={0.1}
          softness={0.2}
          intensity={5}
          spotSize={0.1}
          pulse={0.1}
          smoke={0.5}
          smokeSize={4}
          scale={0.65}
          rotation={0}
          frame={9161408.251009725}
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
          }}
        />

        {/* Rotating Text Around the Pulsing Border */}
        <motion.svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          animate={{ rotate: 360 }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          style={{ transform: "scale(1.6)" }}
        >
          <defs>
            <path id="circle" d="M 50, 50 m -38, 0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
          </defs>
          <text className="text-sm fill-white/80 instrument">
            <textPath href="#circle" startOffset="0%">
              AlgoViz OS • Visualize • Learn • AlgoViz OS • Visualize • Learn •
            </textPath>
          </text>
        </motion.svg>
      </div>
    </div>
  )
}

export function HeroContent() {
  return (
    <main className="absolute bottom-8 left-8 z-20 max-w-lg">
      <div className="text-left">
        <div
          className="inline-flex items-center px-3 py-1 rounded-full bg-white/5 backdrop-blur-sm mb-4 relative"
          style={{
            filter: "url(#glass-effect)",
          }}
        >
          <div className="absolute top-0 left-1 right-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full" />
          <span className="text-white/90 text-xs font-light relative z-10">✨ Interactive OS Learning</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-6xl md:leading-16 tracking-tight font-light text-white mb-4">
          <span className="font-medium">Operating System</span>
          <br />
          <span className="font-medium italic instrument">Algorithm</span>
          <br />
          <span className="font-light tracking-tight text-white">Visualizer</span>
        </h1>

        {/* Description */}
        <p className="text-xs font-light text-white/70 mb-4 leading-relaxed">
          Learn Operating System concepts visually through interactive animations. Understand how CPU scheduling, disk management, and memory allocation work step-by-step.
        </p>

        {/* Buttons */}
        <div className="flex items-center gap-4 flex-wrap">
          <button className="px-8 py-3 rounded-full bg-transparent border border-white/30 text-white font-normal text-xs transition-all duration-200 hover:bg-white/10 hover:border-white/50 cursor-pointer">
            View Algorithms
          </button>
          <Link href="/cpu-scheduling" className="px-8 py-3 rounded-full bg-white text-black font-normal text-xs transition-all duration-200 hover:bg-white/90 cursor-pointer flex items-center justify-center">
            Start Learning
          </Link>
        </div>
      </div>
    </main>
  )
}

export function Header({ title, description }: { title?: string; description?: string }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false)
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [])

  return (
    <>
      <header
        className="relative z-20 flex items-center justify-between p-6 border-b"
        style={{ background: "var(--alg-white)", borderColor: "var(--border-color)" }}
      >
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/assets/logos/logo1.png"
            alt="AlgoLogic"
            width={32}
            height={32}
            className="w-8 h-8 rounded-lg"
          />
          <span className="font-semibold text-lg tracking-tight" style={{ color: "var(--alg-primary)" }}>
            AlgoLogic
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/modules"
            className="text-sm font-semibold px-3 py-2 rounded-full transition-colors hover:bg-[var(--alg-mint)]"
            style={{ color: "var(--alg-text)" }}
          >
            Modules
          </Link>
          <Link
            href="/theory/os"
            className="text-sm font-semibold px-3 py-2 rounded-full transition-colors hover:bg-[var(--alg-mint)]"
            style={{ color: "var(--alg-text)" }}
          >
            Theory
          </Link>
          <Link
            href="/login"
            className="px-5 py-2 rounded-full text-white text-sm font-bold transition-opacity hover:opacity-90"
            style={{ background: "var(--alg-secondary)" }}
          >
            Sign In
          </Link>
        </nav>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xl"
            style={{ background: "var(--alg-primary)" }}
          >
            <button
              onClick={() => setIsMenuOpen(false)}
              className="absolute top-8 right-8 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-50"
            >
              <X className="w-6 h-6" />
            </button>
            <RollingTextList />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
