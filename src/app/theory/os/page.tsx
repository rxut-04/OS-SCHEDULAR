"use client";

import { useState } from "react";
import Link from "next/link";
import { Code2, ArrowLeft } from "lucide-react";

const OS_THEORY_DATA = [
  {
    title: "OS Definition & History",
    unit: "Unit 1: Introduction",
    content: (
      <>
        <p>An Operating System (OS) is a software that acts as an interface between a computer user and computer hardware. It manages system resources like CPU, memory, and storage, and provides a platform for application programs to run.</p>
        <p><strong>The Primary Goals of an OS:</strong></p>
        <ul className="list-disc ml-6 my-4 space-y-2">
          <li><strong>Execute Programs:</strong> Execute user programs and make solving user problems easier.</li>
          <li><strong>Convenience:</strong> Make the computer system convenient to use.</li>
          <li><strong>Efficiency:</strong> Use the computer hardware in an efficient manner.</li>
        </ul>
      </>
    ),
  },
  {
    title: "Functions of OS",
    unit: "Unit 1: Introduction",
    content: (
      <>
        <p>The operating system manages all the resources of a computer system. It performs several key roles to ensure the hardware and software work together seamlessly.</p>
        <p><strong>1. Process Management:</strong></p>
        <p className="mb-4">The OS manages the execution of multiple programs. It allocates CPU time to different processes, handles their creation/termination, and ensures they can communicate without interfering with each other.</p>
        <p><strong>2. Memory Management:</strong></p>
        <p className="mb-4">The OS keeps track of every memory location and manages the primary memory (RAM). It decides which process gets memory when and how much, ensuring that one program&apos;s data doesn&apos;t overwrite another&apos;s.</p>
        <p><strong>3. File Management:</strong></p>
        <p className="mb-4">It manages how data is stored on secondary storage (HDDs/SSDs). It organizes data into files and directories, handles access permissions, and keeps track of where data is physically located.</p>
        <p><strong>4. I/O Device Management:</strong></p>
        <p>The OS acts as a communicator between hardware (keyboards, printers) and software using device drivers. It manages input/output flow to ensure hardware is used effectively.</p>
      </>
    ),
  },
  {
    title: "Process States & PCB",
    unit: "Unit 2: Process Management",
    content: (
      <>
        <p>A process is essentially a program in execution. As it runs, it transitions through various <strong>Process States</strong>.</p>
        <p><strong>Standard Process States:</strong></p>
        <ul className="list-disc ml-6 my-4 space-y-2">
          <li><strong>New:</strong> The process is being created.</li>
          <li><strong>Ready:</strong> The process is waiting to be assigned to a processor.</li>
          <li><strong>Running:</strong> Instructions are being executed.</li>
          <li><strong>Waiting:</strong> The process is waiting for some event (like I/O completion).</li>
          <li><strong>Terminated:</strong> The process has finished execution.</li>
        </ul>
        <p><strong>Process Control Block (PCB):</strong></p>
        <p>Each process is represented in the OS by a PCB. It is a data structure containing vital information such as the Process State, Program Counter, CPU registers, and memory management information.</p>
      </>
    ),
  },
  {
    title: "Threads",
    unit: "Unit 2: Process Management",
    content: (
      <>
        <p>A thread is the basic unit of CPU utilization. It is often referred to as a &quot;Lightweight Process.&quot;</p>
        <p><strong>How Threads Work:</strong></p>
        <p className="mb-4">While a traditional process has a single thread of control, modern applications use multiple threads to perform different tasks simultaneously. Each thread belongs to a process and shares its resources but has its own unique components:</p>
        <ul className="list-disc ml-6 my-4 space-y-2">
          <li><strong>Thread ID:</strong> A unique identifier.</li>
          <li><strong>Program Counter:</strong> Tracks the next instruction.</li>
          <li><strong>Register Set:</strong> Stores temporary values.</li>
          <li><strong>Stack:</strong> Stores execution history.</li>
        </ul>
        <p><strong>Benefits:</strong> Multithreading increases responsiveness and efficiency because threads share the process&apos;s code and data sections while working independently.</p>
      </>
    ),
  },
];

export default function OSTheoryPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const data = OS_THEORY_DATA[currentIndex];

  return (
    <div
      className="min-h-screen"
      style={{
        fontFamily: "'Source Sans Pro', sans-serif",
        background: "white",
        color: "var(--alg-text)",
      }}
    >
      <header
        className="fixed top-0 w-full h-14 flex items-center justify-between px-6 border-b border-gray-200 z-[1000] bg-white"
      >
        <Link
          href="/"
          className="font-black text-[22px] no-underline flex items-center gap-2"
          style={{ color: "var(--alg-primary)" }}
        >
          <Code2 className="h-6 w-6" /> AlgoLogic
        </Link>
        <Link
          href="/"
          className="text-gray-600 font-semibold text-[15px] no-underline flex items-center gap-2 hover:text-[var(--alg-secondary)]"
        >
          <ArrowLeft className="h-4 w-4" /> Exit Tutorial
        </Link>
      </header>

      <div className="flex pt-14 min-h-[calc(100vh-56px)]">
        <nav
          className="w-60 min-w-[250px] border-r border-gray-200 overflow-y-auto py-5 bg-[#E7E9EB]"
        >
          <h2 className="px-5 pb-4 text-xl font-bold text-black">OS Tutorial</h2>
          {OS_THEORY_DATA.map((item, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`block w-full text-left py-2.5 px-5 text-base transition-colors cursor-pointer border-0 bg-transparent ${
                index === currentIndex
                  ? "bg-[var(--alg-secondary)] text-white font-bold"
                  : "text-gray-700 hover:bg-gray-300"
              }`}
            >
              {item.title}
            </button>
          ))}
        </nav>

        <main className="flex-1 overflow-y-auto py-10 px-[10%]">
          <span
            className="uppercase font-bold tracking-wider text-sm"
            style={{ color: "var(--alg-secondary)" }}
          >
            {data.unit}
          </span>
          <h1 className="text-4xl mt-2 mb-4" style={{ color: "#282A35" }}>
            {data.title}
          </h1>
          <hr className="border-gray-200 my-4" />
          <div className="text-lg text-gray-700 mt-5 [&_p]:mb-4 [&_b]:text-[var(--alg-primary)]">
            {data.content}
          </div>

          <div className="flex justify-between mt-12 pt-8 border-t border-gray-200">
            <button
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="bg-[var(--alg-secondary)] text-white py-3 px-6 rounded-md font-bold cursor-pointer border-0 text-base disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <button
              onClick={() =>
                setCurrentIndex((i) => Math.min(OS_THEORY_DATA.length - 1, i + 1))
              }
              disabled={currentIndex === OS_THEORY_DATA.length - 1}
              className="bg-[var(--alg-secondary)] text-white py-3 px-6 rounded-md font-bold cursor-pointer border-0 text-base disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
