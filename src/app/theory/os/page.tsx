"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Code2, ArrowLeft, ChevronRight, BookOpen, Cpu, HardDrive,
  Network, Lock, Layers, FileText, Zap, RefreshCw, Database, Terminal,
} from "lucide-react";

const P = "var(--alg-primary)";
const S = "var(--alg-secondary)";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-2xl font-black mt-8 mb-3" style={{ color: P }}>{children}</h2>;
}
function Sub({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-bold mt-6 mb-2" style={{ color: S }}>{children}</h3>;
}
function P1({ children }: { children: React.ReactNode }) {
  return <p className="text-base text-neutral-700 leading-relaxed mb-3">{children}</p>;
}
function InfoBox({ title, children, color = S }: { title: string; children: React.ReactNode; color?: string }) {
  return (
    <div className="my-4 p-4 rounded-xl border-l-4 bg-blue-50" style={{ borderColor: color }}>
      <p className="font-bold text-sm mb-1" style={{ color: P }}>{title}</p>
      <div className="text-sm text-neutral-700 leading-relaxed">{children}</div>
    </div>
  );
}
function WarnBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="my-4 p-4 rounded-xl border-l-4 bg-yellow-50 border-yellow-400">
      <p className="font-bold text-sm mb-1 text-yellow-800">{title}</p>
      <div className="text-sm text-neutral-700 leading-relaxed">{children}</div>
    </div>
  );
}
function Code({ children }: { children: React.ReactNode }) {
  return (
    <pre className="bg-gray-900 text-green-400 font-mono text-xs p-4 rounded-xl overflow-x-auto my-3 leading-relaxed whitespace-pre">
      {children}
    </pre>
  );
}
function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto my-4">
      <table className="w-full text-sm border-collapse rounded-xl overflow-hidden shadow-sm">
        <thead>
          <tr style={{ background: P }}>
            {headers.map(h => <th key={h} className="text-white font-bold px-4 py-2.5 text-left">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-blue-50/40"}>
              {row.map((cell, j) => <td key={j} className="px-4 py-2.5 text-neutral-700 border-b border-gray-100" dangerouslySetInnerHTML={{ __html: cell }} />)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function UL({ items }: { items: string[] }) {
  return (
    <ul className="list-none space-y-1.5 my-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-base text-neutral-700">
          <ChevronRight className="h-4 w-4 mt-0.5 shrink-0" style={{ color: S }} />
          <span dangerouslySetInnerHTML={{ __html: item }} />
        </li>
      ))}
    </ul>
  );
}
function CardGrid({ items }: { items: { title: string; body: string; color?: string }[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-4">
      {items.map(({ title, body, color }) => (
        <div key={title} className="p-4 rounded-xl border" style={{ background: (color || S) + "10", borderColor: (color || S) + "40" }}>
          <p className="font-black text-sm mb-1" style={{ color: color || P }}>{title}</p>
          <p className="text-xs text-neutral-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: body }} />
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   UNIT DATA
═══════════════════════════════════════════════════════════════ */
const UNITS = [
  /* ─── UNIT 1: INTRODUCTION ─────────────────────────────────── */
  {
    unit: "Unit 1 · Introduction to OS",
    icon: <BookOpen className="h-4 w-4" />,
    topics: [
      {
        title: "What is an Operating System?",
        content: (<>
          <P1>An <strong>Operating System (OS)</strong> is the most fundamental piece of software on a computer. It acts as an intermediary between hardware and application software, providing a stable, abstract interface that applications can rely on regardless of underlying hardware differences.</P1>
          <InfoBox title="Classic Definition — Silberschatz">
            "An operating system is a program that manages the computer hardware, provides a basis for application programs, and acts as an intermediary between the computer user and the computer hardware."
          </InfoBox>
          <SectionTitle>Why Do We Need an OS?</SectionTitle>
          <UL items={[
            "Without an OS every program would need to directly manage hardware — keyboards, screens, disks — making programs impossibly complex.",
            "The OS provides <strong>abstraction</strong>: programs deal with files, not disk sectors; windows, not pixels; processes, not raw CPU registers.",
            "The OS provides <strong>resource sharing</strong>: hundreds of programs can run concurrently on a single CPU through scheduling.",
            "The OS provides <strong>isolation and protection</strong>: one buggy program cannot corrupt another program's memory.",
          ]} />
          <SectionTitle>Primary Goals</SectionTitle>
          <CardGrid items={[
            { title: "Convenience", body: "Make the system easy to use. Users don't need to know about hardware details.", color: "#3b82f6" },
            { title: "Efficiency", body: "Maximise CPU utilisation, memory use, and I/O throughput.", color: "#10b981" },
            { title: "Ability to Evolve", body: "New hardware and software should integrate without breaking existing programs.", color: "#f59e0b" },
            { title: "Protection", body: "Prevent processes from interfering with each other or the OS itself.", color: "#ef4444" },
          ]} />
          <SectionTitle>Types of Operating Systems</SectionTitle>
          <Table headers={["Type", "Description", "Real-World Examples"]} rows={[
            ["Batch OS", "Jobs collected offline, grouped by type, and executed without user interaction. Output printed later.", "IBM OS/360 (1960s)"],
            ["Multiprogramming OS", "Multiple jobs in memory; CPU switches when one job does I/O. First real utilisation improvement.", "OS/MFT, OS/MVT"],
            ["Time-Sharing (Multitasking)", "CPU switches so fast users believe they have dedicated machines. Interactive use enabled.", "Unix, Linux, macOS, Windows"],
            ["Real-Time OS (RTOS)", "Deterministic response within a hard deadline. Failure = system failure.", "VxWorks, FreeRTOS, QNX"],
            ["Distributed OS", "Multiple machines look like one system. Transparent resource access.", "Amoeba, Plan 9, Google Borg"],
            ["Embedded OS", "Minimised footprint; ROM-based; specific hardware.", "Android, iOS, Arduino RTOS"],
            ["Network OS", "File/printer sharing over a network. Each machine keeps its own OS.", "Novell NetWare, Windows Server"],
            ["Mobile OS", "Touch-first, battery-aware, app sandboxing.", "Android (Linux kernel), iOS (XNU)"],
          ]} />
        </>),
      },
      {
        title: "OS Functions & Architecture",
        content: (<>
          <P1>The OS performs six core management functions. Together they form a complete resource management framework for the entire computing system.</P1>
          <SectionTitle>Six Core Functions</SectionTitle>
          <CardGrid items={[
            { title: "1. Process Management", body: "Creates, schedules, suspends, resumes, and terminates processes. Handles IPC, synchronisation, and deadlocks.", color: "#3b82f6" },
            { title: "2. Memory Management", body: "Tracks all memory locations. Allocates/deallocates to processes. Implements virtual memory and paging.", color: "#10b981" },
            { title: "3. File System Management", body: "Abstracts storage into files and directories. Enforces access permissions and maintains metadata.", color: "#f59e0b" },
            { title: "4. I/O Device Management", body: "Provides uniform interface to diverse hardware via device drivers. Manages buffering, spooling, caching.", color: "#ef4444" },
            { title: "5. Network Management", body: "Handles network protocols (TCP/IP), socket interfaces, and distributed file access.", color: "#8b5cf6" },
            { title: "6. Security & Protection", body: "Authentication, authorization, access-control lists, memory protection, process isolation.", color: "#ec4899" },
          ]} />
          <SectionTitle>OS Architecture Designs</SectionTitle>
          <Table headers={["Architecture", "Concept", "Pros", "Cons", "Example"]} rows={[
            ["Simple / MS-DOS", "No clear structure; one-level, no protection", "Fast, simple", "Vulnerable, unmaintainable", "MS-DOS"],
            ["Monolithic Kernel", "Entire OS in kernel space; all services run with full hardware access", "Very fast (no IPC overhead)", "Hard to debug; one bug crashes OS", "Early Linux, BSD"],
            ["Layered", "OS divided into N layers; each layer uses services of the layer below", "Clean abstraction, debuggable", "Defining layers is hard; performance overhead", "THE OS, OS/2"],
            ["Microkernel", "Only IPC, basic scheduling, memory in kernel; everything else in user space", "Reliable, portable, extensible", "IPC overhead slows communication", "Mach, MINIX 3, QNX"],
            ["Modular (Loadable Modules)", "Core kernel + dynamically loaded modules (drivers, filesystems)", "Flexible; best of both worlds", "Modules can break if poorly written", "Modern Linux, macOS"],
            ["Hybrid", "Combines microkernel & monolithic elements pragmatically", "Practical trade-off", "Complexity", "Windows NT, macOS XNU"],
            ["Exokernel", "Kernel exposes raw hardware; libraries implement OS abstractions", "Maximum app control", "Complex app development", "MIT Exokernel, Nemesis"],
          ]} />
          <SectionTitle>Kernel Mode vs User Mode</SectionTitle>
          <P1>Modern CPUs have at least two privilege levels. The <strong>kernel (supervisor) mode</strong> has unrestricted access to hardware. <strong>User mode</strong> is restricted — programs can only access their own memory and must use <em>system calls</em> to request OS services.</P1>
          <InfoBox title="System Call Flow">
            App calls read() → CPU switches to kernel mode (trap/syscall instruction) → kernel validates request → kernel performs I/O → kernel copies data to user buffer → CPU returns to user mode → app continues.
          </InfoBox>
        </>),
      },
      {
        title: "System Calls & Interrupts",
        content: (<>
          <P1>System calls and interrupts are the two primary mechanisms through which programs interact with the OS kernel.</P1>
          <SectionTitle>System Calls</SectionTitle>
          <P1>A <strong>system call</strong> is a programmatic request from user-space code to perform a privileged operation. It is the only controlled entry point into the kernel.</P1>
          <Table headers={["Category", "Examples (Unix)"]} rows={[
            ["Process Control", "fork(), exec(), exit(), wait(), kill(), getpid()"],
            ["File Management", "open(), read(), write(), close(), lseek(), stat()"],
            ["Device Management", "ioctl(), read(), write() on device files"],
            ["Information", "gettime(), alarm(), sleep(), uname()"],
            ["Communication", "pipe(), socket(), send(), recv(), shmget()"],
            ["Protection", "chmod(), chown(), umask(), setuid()"],
          ]} />
          <SectionTitle>Types of Interrupts</SectionTitle>
          <CardGrid items={[
            { title: "Hardware Interrupt", body: "Triggered by a peripheral (keyboard press, disk I/O complete, NIC packet arrived). CPU pauses current task, runs interrupt handler.", color: "#ef4444" },
            { title: "Software Interrupt (Trap)", body: "Deliberately generated by a program — e.g., a system call or divide-by-zero. Transitions to kernel mode.", color: "#3b82f6" },
            { title: "Timer Interrupt", body: "Periodic interrupt from the programmable interval timer. Fundamental to preemptive scheduling — lets the OS regain control.", color: "#10b981" },
            { title: "Exception / Fault", body: "CPU detects an error: page fault, invalid opcode, stack overflow. OS decides whether to fix (page fault) or kill the process (segfault).", color: "#f59e0b" },
          ]} />
          <SectionTitle>Interrupt Processing Steps</SectionTitle>
          <UL items={[
            "CPU finishes current instruction and checks the interrupt line.",
            "CPU saves the current <strong>Program Counter</strong> and <strong>status flags</strong> on the kernel stack.",
            "CPU looks up the <strong>Interrupt Vector Table (IVT)</strong> — an array of handler addresses indexed by interrupt number.",
            "CPU jumps to the <strong>Interrupt Service Routine (ISR)</strong> in kernel mode.",
            "ISR identifies the source, acknowledges the interrupt, performs the necessary work.",
            "ISR issues an <code>IRET</code> (interrupt return) instruction; CPU restores saved state and resumes the original program.",
          ]} />
        </>),
      },
    ],
  },

  /* ─── UNIT 2: PROCESS MANAGEMENT ────────────────────────────── */
  {
    unit: "Unit 2 · Process Management",
    icon: <Cpu className="h-4 w-4" />,
    topics: [
      {
        title: "Processes — PCB & States",
        content: (<>
          <P1>A <strong>process</strong> is a program in execution — a dynamic entity with its own address space, CPU state, and OS resources. A program is a passive file on disk; a process is the active running instance.</P1>
          <SectionTitle>Process Memory Layout</SectionTitle>
          <div className="my-4 border rounded-xl overflow-hidden text-sm font-mono">
            {[
              { label: "Stack", sub: "Local vars, function frames, return addresses — grows ↓", bg: "#fee2e2" },
              { label: "⬇ ⬆ (gap)", sub: "Stack and heap grow toward each other", bg: "#f9fafb" },
              { label: "Heap", sub: "Dynamic allocations (malloc/new) — grows ↑", bg: "#d1fae5" },
              { label: "BSS Segment", sub: "Uninitialised global/static variables", bg: "#ede9fe" },
              { label: "Data Segment", sub: "Initialised global/static variables", bg: "#dbeafe" },
              { label: "Text Segment", sub: "Executable code (read-only)", bg: "#fef9c3" },
            ].map(({ label, sub, bg }) => (
              <div key={label} className="flex items-center gap-3 px-4 py-2.5 border-b" style={{ background: bg }}>
                <span className="font-bold w-32 shrink-0" style={{ color: P }}>{label}</span>
                <span className="text-neutral-600 text-xs">{sub}</span>
              </div>
            ))}
          </div>
          <SectionTitle>Process Control Block (PCB)</SectionTitle>
          <Table headers={["PCB Field", "Contents", "Why Needed"]} rows={[
            ["Process State", "New / Ready / Running / Waiting / Terminated", "Tells scheduler what to do with this process"],
            ["Process ID (PID)", "Unique integer", "Identifies process across the entire system"],
            ["Program Counter (PC)", "Address of next instruction", "Must be saved/restored on context switch"],
            ["CPU Registers", "All general-purpose, stack pointer, flags", "Must be saved/restored on context switch"],
            ["Memory Management Info", "Base/limit registers, page table pointer", "Defines the process's address space"],
            ["List of Open Files", "File descriptor table", "Tracks which files are open"],
            ["I/O Status", "Pending I/O requests, allocated devices", "OS tracks outstanding I/O"],
            ["Accounting Info", "CPU time used, priority, job ID", "Scheduling and billing"],
            ["Parent PID (PPID)", "PID of parent process", "Process tree navigation"],
          ]} />
          <SectionTitle>Five-State Process Model</SectionTitle>
          <div className="flex flex-wrap gap-2 my-4 items-center justify-center">
            {["New", "→", "Ready", "⇌ Running", "→", "Terminated"].map((s, i) => (
              s.includes("→") || s.includes("⇌")
                ? <span key={i} className="text-neutral-400 font-bold text-lg">{s}</span>
                : <div key={s} className="px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: P }}>{s}</div>
            ))}
          </div>
          <UL items={[
            "<strong>New → Ready:</strong> OS admits the process and loads it into memory.",
            "<strong>Ready → Running:</strong> Scheduler dispatches (assigns CPU to) the process.",
            "<strong>Running → Ready:</strong> Preemption by timer interrupt or higher-priority process.",
            "<strong>Running → Waiting:</strong> Process issues I/O request or waits for event.",
            "<strong>Waiting → Ready:</strong> I/O completes or event occurs; process re-enters ready queue.",
            "<strong>Running → Terminated:</strong> Process calls exit() or is killed.",
          ]} />
          <InfoBox title="Context Switch Cost">
            Every context switch saves and restores the full PCB. On a modern x86-64 CPU this involves ~hundreds of registers including SSE/AVX state. Typical cost: 1–10 μs. This is why minimising unnecessary context switches matters for performance.
          </InfoBox>
        </>),
      },
      {
        title: "CPU Scheduling Algorithms",
        content: (<>
          <P1>The CPU scheduler selects a process from the Ready Queue and allocates the CPU to it. It runs extremely frequently — after every I/O, every time-slice expiry, and every process creation.</P1>
          <SectionTitle>Scheduling Criteria</SectionTitle>
          <Table headers={["Metric", "Definition", "Goal"]} rows={[
            ["CPU Utilisation", "% of time CPU is busy executing processes", "Maximise (target: 40–90%)"],
            ["Throughput", "Processes completed per unit time", "Maximise"],
            ["Turnaround Time", "Total time from submission to completion", "Minimise"],
            ["Waiting Time", "Total time spent in Ready Queue", "Minimise"],
            ["Response Time", "Time from submission to first response (interactive systems)", "Minimise"],
          ]} />
          <SectionTitle>FCFS — First-Come, First-Served</SectionTitle>
          <P1>Processes get the CPU in the order they arrive. Non-preemptive — once started, runs to completion.</P1>
          <Code>{`Processes: P1(burst=24), P2(burst=3), P3(burst=3)  [all arrive t=0]
Gantt: | P1 (0–24) | P2 (24–27) | P3 (27–30) |
Waiting: P1=0, P2=24, P3=27  →  Avg Waiting = 17 ms  ← BAD
With optimal order P2,P3,P1:
Waiting: P2=0, P3=3,  P1=6   →  Avg Waiting = 3 ms   ← MUCH BETTER`}
          </Code>
          <WarnBox title="Convoy Effect">
            In FCFS, one long CPU-bound process blocks many short processes behind it — like a slow truck on a narrow road. This leads to poor CPU and I/O device utilisation simultaneously.
          </WarnBox>
          <SectionTitle>SJF — Shortest Job First</SectionTitle>
          <P1>Optimal algorithm for minimising average waiting time. Selects the process with the smallest <em>next</em> CPU burst. Problem: burst time must be predicted.</P1>
          <InfoBox title="Burst Time Prediction — Exponential Averaging">
            τₙ₊₁ = α·tₙ + (1−α)·τₙ  where tₙ = actual last burst, τₙ = predicted, α = weight (typically 0.5). This gives recent bursts more weight than ancient ones.
          </InfoBox>
          <SectionTitle>SRTF — Shortest Remaining Time First</SectionTitle>
          <P1>Preemptive version of SJF. If a new process arrives with a shorter remaining burst than the currently running process, the CPU is preempted. Optimal for minimising average waiting time but causes starvation of long jobs.</P1>
          <SectionTitle>Round Robin (RR)</SectionTitle>
          <P1>Each process gets a fixed <strong>time quantum</strong> q (typically 10–100 ms). After q expires, the process is preempted and placed at the back of the Ready Queue. Designed for time-sharing systems.</P1>
          <Table headers={["Quantum Size", "Behaviour"]} rows={[
            ["Very small (< 1 ms)", "Approaches processor sharing; excessive context-switch overhead"],
            ["Very large (> max burst)", "Degenerates to FCFS"],
            ["Optimal (rule of thumb)", "~80% of CPU bursts should be shorter than q"],
          ]} />
          <SectionTitle>Priority Scheduling</SectionTitle>
          <P1>Each process has a priority number. CPU is allocated to the highest-priority process. Can be preemptive or non-preemptive. Problem: <strong>starvation</strong> of low-priority processes.</P1>
          <InfoBox title="Solution: Aging">
            Gradually increase the priority of waiting processes over time. A process waiting for 15 minutes should have its priority increased enough to eventually run.
          </InfoBox>
          <SectionTitle>Multilevel Feedback Queue (MLFQ)</SectionTitle>
          <P1>The most sophisticated and practical scheduler. Multiple queues at different priority levels. Processes start in the highest queue. If they use their time quantum without finishing, they are demoted to a lower queue (assumed CPU-bound). Short interactive jobs stay at the top.</P1>
          <UL items={[
            "New processes enter Queue 1 (highest priority, small quantum).",
            "If a process uses its full quantum → demote to Queue 2 (larger quantum).",
            "If it uses Queue 2's quantum fully → demote to Queue 3 (FCFS).",
            "If a process voluntarily yields (does I/O) → stays in or moves up.",
            "<strong>Periodic boost:</strong> All processes moved to top queue to prevent starvation.",
          ]} />
        </>),
      },
      {
        title: "Inter-Process Communication (IPC)",
        content: (<>
          <P1>Processes in an OS may need to cooperate. Since each process has its own isolated address space, the OS provides explicit <strong>IPC mechanisms</strong> for sharing data and coordinating actions.</P1>
          <SectionTitle>IPC Models</SectionTitle>
          <CardGrid items={[
            { title: "Shared Memory", body: "Two processes map the same physical memory region into their address spaces. Fastest IPC — communication happens at memory speed. Requires explicit synchronisation to avoid races.", color: "#10b981" },
            { title: "Message Passing", body: "Processes exchange messages via send()/receive() calls mediated by the kernel. Safer but slower (kernel involvement on every message). Scales well to distributed systems.", color: "#3b82f6" },
          ]} />
          <SectionTitle>Pipes</SectionTitle>
          <P1>A pipe is a unidirectional byte stream between two related processes (parent/child). Created with <code>pipe(fd)</code>; parent writes to <code>fd[1]</code>, child reads from <code>fd[0]</code>.</P1>
          <UL items={[
            "<strong>Anonymous pipes</strong> — only between parent and child (or siblings). Temporary.",
            "<strong>Named pipes (FIFOs)</strong> — a special file in the filesystem; any two processes can use it.",
          ]} />
          <SectionTitle>Sockets</SectionTitle>
          <P1>A socket is an endpoint for two-way communication. Supports both same-machine (Unix domain sockets) and network (TCP/IP sockets) communication. Foundation of all networking.</P1>
          <SectionTitle>Signals</SectionTitle>
          <P1>Signals are asynchronous notifications sent to a process. Standard signals include: SIGKILL (force kill), SIGTERM (graceful terminate), SIGSEGV (segmentation fault), SIGCHLD (child died), SIGALRM (timer expired).</P1>
          <Table headers={["Signal", "Default Action", "Meaning"]} rows={[
            ["SIGKILL (9)", "Terminate immediately", "Cannot be caught or ignored — guaranteed kill"],
            ["SIGTERM (15)", "Terminate", "Polite termination request — process can clean up"],
            ["SIGSEGV (11)", "Core dump", "Invalid memory access"],
            ["SIGINT (2)", "Terminate", "Ctrl+C from terminal"],
            ["SIGCHLD (17)", "Ignore", "Child process changed state"],
            ["SIGALRM (14)", "Terminate", "alarm() timer expired"],
          ]} />
        </>),
      },
      {
        title: "Threads & Concurrency",
        content: (<>
          <P1>A <strong>thread</strong> is the basic unit of CPU utilisation. Multiple threads within the same process share code, data, and open files, but each has its own program counter, registers, and stack.</P1>
          <SectionTitle>Thread vs Process</SectionTitle>
          <Table headers={["Aspect", "Process", "Thread"]} rows={[
            ["Address space", "Separate — fully isolated", "Shared with sibling threads"],
            ["Creation cost", "Heavy: fork() duplicates entire process", "Light: just a new stack allocated"],
            ["Context switch", "Expensive: full MMU switch", "Cheap: only registers/stack change"],
            ["Communication", "IPC needed (pipes, sockets, shared mem)", "Direct: just read/write shared memory"],
            ["Failure isolation", "One process crash doesn't affect others", "One thread crash can kill the whole process"],
            ["Synchronisation", "Less needed (isolated memory)", "Critical — shared data races possible"],
          ]} />
          <SectionTitle>Threading Models</SectionTitle>
          <CardGrid items={[
            { title: "Many-to-One", body: "All user threads map to a single kernel thread. OS sees one thread. <strong>Blocking call blocks entire process.</strong> No true parallelism. (Green threads in old Java)", color: "#ef4444" },
            { title: "One-to-One", body: "Each user thread maps to a kernel thread. True parallelism on multicore. Creating many threads creates many kernel threads → overhead. (Linux pthreads, Windows threads)", color: "#10b981" },
            { title: "Many-to-Many", body: "M user threads multiplexed to N kernel threads (N ≤ M). Flexible; avoids both problems. (Solaris, Windows with fibers)", color: "#3b82f6" },
            { title: "Two-Level", body: "Variant of M:N that also allows a user thread to be bound to a specific kernel thread. (IRIX, HP-UX)", color: "#8b5cf6" },
          ]} />
          <SectionTitle>POSIX Threads (pthreads)</SectionTitle>
          <Code>{`#include <pthread.h>
void *worker(void *arg) {
    printf("Thread ID: %ld\\n", pthread_self());
    return NULL;
}
int main() {
    pthread_t tid;
    pthread_create(&tid, NULL, worker, NULL);  // create thread
    pthread_join(tid, NULL);                   // wait for it to finish
    return 0;
}`}</Code>
          <SectionTitle>Thread Safety & Race Conditions</SectionTitle>
          <P1>When multiple threads access shared data concurrently and at least one modifies it, a <strong>race condition</strong> can produce incorrect results. Making code <em>thread-safe</em> requires proper synchronisation.</P1>
          <WarnBox title="Classic Race — Bank Account">
            Two threads both read balance=1000, both add 500, both write 1500. Result = 1500 instead of 2000. Lost update! The read-modify-write sequence must be atomic.
          </WarnBox>
        </>),
      },
    ],
  },

  /* ─── UNIT 3: SYNCHRONISATION ────────────────────────────────── */
  {
    unit: "Unit 3 · Process Synchronisation",
    icon: <RefreshCw className="h-4 w-4" />,
    topics: [
      {
        title: "Critical Section & Mutual Exclusion",
        content: (<>
          <P1>The <strong>Critical Section (CS)</strong> is the segment of code that accesses shared resources. Only one process may execute in its CS at a time. Ensuring this is the <em>critical section problem</em>.</P1>
          <SectionTitle>Three Requirements</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-4">
            {[
              { title: "Mutual Exclusion", body: "At most one process in CS at any moment.", color: "#ef4444" },
              { title: "Progress", body: "If no process is in CS and processes want to enter, the selection cannot be postponed indefinitely.", color: "#10b981" },
              { title: "Bounded Waiting", body: "After a process requests entry, there is a bound on how many times others can enter before it does.", color: "#3b82f6" },
            ].map(({ title, body, color }) => (
              <div key={title} className="p-4 rounded-2xl border-2 text-center" style={{ borderColor: color, background: color + "10" }}>
                <p className="font-black text-sm mb-1" style={{ color }}>{title}</p>
                <p className="text-xs text-neutral-600">{body}</p>
              </div>
            ))}
          </div>
          <SectionTitle>Peterson's Solution (2 Processes)</SectionTitle>
          <Code>{`// Shared:
bool flag[2] = {false, false};
int  turn;

// Process Pᵢ (the other process is Pⱼ, j = 1 - i)
do {
    flag[i] = true;              // I want to enter
    turn    = j;                 // Politely yield
    while (flag[j] && turn == j) // Busy-wait if j wants in AND it's j's turn
        ;
    /* ════ CRITICAL SECTION ════ */
    flag[i] = false;             // Done — release
    /* ════ REMAINDER SECTION ════ */
} while (true);`}</Code>
          <InfoBox title="Does Peterson's Meet All Three Requirements?">
            ✅ Mutual Exclusion: both cannot satisfy the while condition simultaneously. ✅ Progress: if Pⱼ doesn't want in, Pᵢ enters immediately. ✅ Bounded Waiting: Pᵢ waits at most once through Pⱼ's CS.
          </InfoBox>
          <SectionTitle>Hardware Solutions</SectionTitle>
          <Table headers={["Instruction", "Operation", "Use"]} rows={[
            ["TestAndSet()", "Atomically read and set a boolean flag", "Simple mutex locks"],
            ["CompareAndSwap()", "Atomically compare memory value and conditionally update", "Lock-free data structures, modern mutexes"],
            ["XCHG (x86)", "Atomically exchange register and memory", "Spin locks"],
            ["LoadLinked / StoreConditional", "LL reads, SC writes only if no intervening write", "ARM / MIPS lock-free primitives"],
          ]} />
        </>),
      },
      {
        title: "Semaphores, Mutexes & Monitors",
        content: (<>
          <P1>High-level synchronisation primitives built on top of hardware atomic operations provide easier-to-use building blocks for concurrent programs.</P1>
          <SectionTitle>Semaphores</SectionTitle>
          <P1>A semaphore is a non-negative integer with two atomic operations: <strong>wait()</strong> (P / down) decrements and blocks if zero; <strong>signal()</strong> (V / up) increments and wakes a waiter.</P1>
          <Code>{`// Classic binary semaphore mutex usage:
Semaphore mutex = 1;       // 1 = unlocked

wait(mutex);               // P(mutex): if 0, block; else decrement
  /* ═══ Critical Section ═══ */
signal(mutex);             // V(mutex): increment and wake one waiter

// Counting semaphore — control access to N resources:
Semaphore pool = N;        // N slots available

wait(pool);                // Take one slot (block if 0)
  /* use resource */
signal(pool);              // Release slot`}</Code>
          <SectionTitle>Semaphore Implementation (Non-Busy-Wait)</SectionTitle>
          <Code>{`typedef struct {
    int value;
    struct process *list;   // waiting queue
} semaphore;

void wait(semaphore *S) {
    S->value--;
    if (S->value < 0) {
        add this process to S->list;
        block();            // sleep — no busy wait
    }
}
void signal(semaphore *S) {
    S->value++;
    if (S->value <= 0) {
        remove process P from S->list;
        wakeup(P);
    }
}`}</Code>
          <SectionTitle>Mutex (Mutual Exclusion Lock)</SectionTitle>
          <P1>A mutex is a binary semaphore with ownership semantics: only the thread that locked the mutex can unlock it. Prevents priority inversion through <em>priority inheritance</em>.</P1>
          <SectionTitle>Monitors</SectionTitle>
          <P1>A <strong>monitor</strong> is a high-level language construct (Java <code>synchronized</code>, C# <code>lock</code>) that encapsulates shared variables and procedures. The compiler ensures only one thread can be active inside the monitor at a time.</P1>
          <Code>{`// Java monitor example
class BoundedBuffer {
    private int[] buffer = new int[N];
    private int count = 0, in = 0, out = 0;

    synchronized void produce(int item) throws InterruptedException {
        while (count == N) wait();          // full — sleep
        buffer[in] = item;
        in = (in + 1) % N;
        count++;
        notifyAll();                        // wake consumers
    }
    synchronized int consume() throws InterruptedException {
        while (count == 0) wait();          // empty — sleep
        int item = buffer[out];
        out = (out + 1) % N;
        count--;
        notifyAll();                        // wake producers
        return item;
    }
}`}</Code>
          <SectionTitle>Classic Synchronisation Problems</SectionTitle>
          <Table headers={["Problem", "Resources", "Key Semaphores", "Core Challenge"]} rows={[
            ["Producer–Consumer", "Bounded buffer of size N", "mutex, full(0), empty(N)", "Prevent overflow/underflow; no lost signals"],
            ["Readers–Writers", "Shared database", "mutex, wrt, readcount", "Multiple concurrent readers OR exclusive writer"],
            ["Dining Philosophers", "5 philosophers, 5 forks", "fork[5] semaphores", "Avoid deadlock; 4 philosophers allowed at once"],
            ["Sleeping Barber", "Barber, waiting chairs", "customers, barbers, mutex", "Synchronise barber sleep with customer arrival"],
            ["Cigarette Smokers", "3 ingredients, infinite supply", "agentSem, smoker[3]", "Avoid busy-waiting for specific combination"],
          ]} />
        </>),
      },
      {
        title: "Deadlocks — Detection, Prevention & Recovery",
        content: (<>
          <P1>A <strong>deadlock</strong> is a permanent block where a set of processes are each waiting for a resource held by another process in the set — forming an unbreakable circular wait.</P1>
          <SectionTitle>Coffman's Four Necessary Conditions</SectionTitle>
          <Table headers={["Condition", "Definition", "How to Break It"]} rows={[
            ["Mutual Exclusion", "Resource can only be used by one process at a time", "Make resources sharable (not always possible)"],
            ["Hold and Wait", "Process holds resources while waiting for more", "Require all resources requested at once before start"],
            ["No Preemption", "Resources cannot be forcibly taken", "Allow OS to preempt resources (with rollback)"],
            ["Circular Wait", "P₁ waits for P₂, P₂ for P₃, …, Pₙ for P₁", "Impose total ordering on resource types"],
          ]} />
          <SectionTitle>Resource Allocation Graph (RAG)</SectionTitle>
          <UL items={[
            "Processes = circles (○). Resources = rectangles (□). Instances = dots inside rectangle.",
            "<strong>Request edge</strong> P → R: Process P is waiting for resource R.",
            "<strong>Assignment edge</strong> R → P: Instance of R is held by P.",
            "For single-instance resources: <strong>cycle ↔ deadlock</strong> (necessary and sufficient).",
            "For multi-instance resources: cycle is necessary but not sufficient — must use Banker's or detection algorithm.",
          ]} />
          <SectionTitle>Banker's Algorithm (Avoidance)</SectionTitle>
          <P1>The OS dynamically checks whether granting a request keeps the system in a <strong>safe state</strong> — one from which every process can eventually finish. If not safe, the request is deferred.</P1>
          <Code>{`Data structures (n processes, m resource types):
  Available[m]       — free instances of each resource type
  Allocation[n][m]   — currently allocated to each process
  Max[n][m]          — maximum demand of each process
  Need[n][m]         — Max - Allocation (remaining need)

Safety Algorithm:
  Work = Available
  Finish[i] = false for all i
  Repeat:
    Find i such that Finish[i]=false AND Need[i] ≤ Work
    If found: Work += Allocation[i]; Finish[i] = true
  Until no such i found
  If all Finish[i]=true → SAFE STATE ✓`}</Code>
          <SectionTitle>Deadlock Recovery</SectionTitle>
          <CardGrid items={[
            { title: "Process Termination", body: "Kill one or more deadlocked processes. Simple but loses work. Choose process with lowest cost (priority, runtime, resources held).", color: "#ef4444" },
            { title: "Resource Preemption", body: "Take resources from a process and give to another. Process may need to rollback to a checkpoint. Risk: starvation if same process always chosen.", color: "#f59e0b" },
            { title: "Rollback", body: "Checkpoint processes periodically. On deadlock, roll back to a checkpoint before the deadlock. Expensive but data-preserving.", color: "#10b981" },
            { title: "Ostrich Algorithm", body: "Ignore the problem! Justified when deadlocks are rare and the cost of prevention/detection exceeds the cost of occasional reboots. (Used by Unix/Windows for most deadlocks)", color: "#6b7280" },
          ]} />
        </>),
      },
    ],
  },

  /* ─── UNIT 4: MEMORY MANAGEMENT ─────────────────────────────── */
  {
    unit: "Unit 4 · Memory Management",
    icon: <Layers className="h-4 w-4" />,
    topics: [
      {
        title: "Memory Allocation Strategies",
        content: (<>
          <P1>Main memory (RAM) must be allocated efficiently to multiple processes. Early systems used simple contiguous allocation; modern systems use paging and segmentation.</P1>
          <SectionTitle>Contiguous Allocation</SectionTitle>
          <P1>Each process occupies a single contiguous block of physical memory defined by a <strong>base</strong> register and a <strong>limit</strong> register. The CPU checks: base ≤ address &lt; base+limit on every access.</P1>
          <Table headers={["Strategy", "Policy", "Result"]} rows={[
            ["First Fit", "Allocate the first hole big enough", "Fast; may leave many small holes at start of memory"],
            ["Best Fit", "Allocate smallest hole that fits", "Minimises wasted space; slow; creates tiny unusable holes"],
            ["Worst Fit", "Allocate largest hole", "Leaves large leftover holes; generally worst overall"],
            ["Next Fit", "First Fit from last allocation point", "More uniform distribution of small holes"],
          ]} />
          <SectionTitle>Fragmentation</SectionTitle>
          <Table headers={["Type", "Definition", "Cause", "Solution"]} rows={[
            ["External Fragmentation", "Enough total free memory, but not contiguous", "Repeated allocate/free of different sizes", "Compaction (shuffle memory), use paging"],
            ["Internal Fragmentation", "Allocated block is larger than request", "Fixed-size partitions or alignment requirements", "Smaller partition sizes, better fit"],
          ]} />
          <InfoBox title="50% Rule">
            Statistical analysis shows that with First Fit, approximately 1/3 of memory is wasted to external fragmentation — for every 2 allocated blocks there is 1 unusable hole on average.
          </InfoBox>
          <SectionTitle>Segmentation</SectionTitle>
          <P1>Memory viewed as a collection of variable-length <em>segments</em> (code, stack, heap, data), each with a name/number and length. Logical address = ⟨segment, offset⟩. The <strong>Segment Table</strong> maps each segment to its base and limit in physical memory.</P1>
          <UL items={[
            "Provides protection: each segment has read/write/execute permission bits.",
            "Allows sharing: two processes can share a code segment at different virtual addresses.",
            "Suffers external fragmentation (variable-size segments).",
          ]} />
        </>),
      },
      {
        title: "Paging & Address Translation",
        content: (<>
          <P1><strong>Paging</strong> divides both physical memory and logical address space into fixed-size units. Physical memory → <strong>frames</strong>. Logical memory → <strong>pages</strong>. Page size = frame size (typically 4 KB). Eliminates external fragmentation entirely.</P1>
          <SectionTitle>Address Translation</SectionTitle>
          <Code>{`Logical address (n-bit):  [  page number p  |  offset d  ]
                                  (n-m bits)       (m bits)
                           where page size = 2ᵐ bytes

Page Table entry: p → frame number f
Physical address: [  frame number f  |  offset d  ]`}</Code>
          <P1>The <strong>Page Table Base Register (PTBR)</strong> points to the page table in memory. Every memory access requires 2 memory accesses: one for the page table, one for data — doubled memory access time.</P1>
          <SectionTitle>Translation Lookaside Buffer (TLB)</SectionTitle>
          <P1>The TLB is a small, fast, fully-associative hardware cache that stores recent ⟨page→frame⟩ translations. It solves the double-access problem.</P1>
          <Table headers={["TLB Scenario", "Memory Accesses", "Formula"]} rows={[
            ["TLB Hit (prob = α)", "1 TLB lookup + 1 data access", "Time ≈ ε + m"],
            ["TLB Miss (prob = 1−α)", "1 TLB lookup + 1 page table access + 1 data access", "Time ≈ ε + 2m"],
            ["Effective Access Time (EAT)", "—", "EAT = α(ε+m) + (1−α)(ε+2m)"],
          ]} />
          <InfoBox title="Practical TLB Numbers">
            Modern CPUs: TLB access ε ≈ 0.5–1 ns. Memory access m ≈ 100 ns. TLB hit rate α ≈ 99%. EAT ≈ 0.99×101 + 0.01×201 ≈ 102 ns. Slowdown vs direct access: ≈ 2%. Without TLB: 200 ns — 2× slower.
          </InfoBox>
          <SectionTitle>Page Table Structures</SectionTitle>
          <Table headers={["Structure", "Idea", "Pro", "Con"]} rows={[
            ["Single-Level", "One flat array indexed by page number", "Simple", "Huge for 64-bit addresses (2⁵²× 8B)"],
            ["Two-Level (Hierarchical)", "Page table split into directory + 2nd-level tables (allocated on demand)", "Sparse allocation; manageable size", "3 memory accesses per reference"],
            ["Hashed Page Table", "Page # hashed into table; chains handle collisions", "O(1) average; good for sparse address spaces", "Hash collisions; complex"],
            ["Inverted Page Table", "One entry per physical frame (not per virtual page)", "O(1) space regardless of address space size", "O(n) search on TLB miss; hard to share pages"],
          ]} />
        </>),
      },
      {
        title: "Virtual Memory & Page Replacement",
        content: (<>
          <P1><strong>Virtual memory</strong> allows processes to use more address space than physical RAM by keeping only the active portion in memory and the rest on disk (swap/page file).</P1>
          <SectionTitle>Demand Paging</SectionTitle>
          <P1>Pages are loaded <em>only when referenced</em>. Each page table entry has a <strong>valid bit</strong>: 1 = in RAM, 0 = not in RAM. Accessing an invalid page triggers a <strong>page fault</strong>.</P1>
          <Code>{`Page Fault Handler Steps:
1. Trap to OS (hardware detects invalid page)
2. Save user-mode CPU state
3. Find a free frame (or evict one)
4. Read the page from disk into the free frame
5. Update page table: set frame #, valid bit = 1
6. Restart the instruction that caused the fault`}</Code>
          <SectionTitle>Page Replacement Algorithms</SectionTitle>
          <Table headers={["Algorithm", "Strategy", "Fault Count *", "Belady Anomaly?"]} rows={[
            ["Optimal (OPT)", "Replace page not used for longest future time", "Minimum possible", "No"],
            ["FIFO", "Replace oldest page in memory", "Higher than LRU", "Yes ⚠"],
            ["LRU", "Replace page not used for longest past time", "Close to OPT", "No"],
            ["LRU-Approx (Clock)", "FIFO + reference bit second chance", "Near LRU", "No"],
            ["LFU", "Replace least frequently used page", "Varies", "No"],
            ["MFU", "Replace most frequently used page (newly loaded = rare)", "Rarely optimal", "No"],
          ]} />
          <InfoBox title="* Example: reference string 7,0,1,2,0,3,0,4,2,3,0,3,2 with 3 frames">
            OPT: 9 page faults. LRU: 12 faults. FIFO: 15 faults. Demonstrating OPT &gt; LRU &gt; FIFO.
          </InfoBox>
          <SectionTitle>Bélády's Anomaly (FIFO Only)</SectionTitle>
          <P1>Counterintuitively, giving FIFO <em>more</em> frames can cause <em>more</em> page faults. This does not occur in stack-based algorithms (OPT, LRU) which are monotonically optimal as frames increase.</P1>
          <SectionTitle>Thrashing & Working Set</SectionTitle>
          <P1>When a process has fewer frames than its <strong>working set</strong> (the set of pages it actively uses), it constantly page-faults. CPU utilisation collapses. The OS adds more processes (trying to improve utilisation) which makes it worse — <strong>thrashing</strong>.</P1>
          <UL items={[
            "<strong>Working Set Model:</strong> Track pages referenced in the last Δ time units (the working set window).",
            "If Σ(working set sizes) &gt; total frames → suspend the lowest-priority process, free its frames.",
            "<strong>Page Fault Frequency (PFF) control:</strong> If a process's fault rate is too high → give it more frames. Too low → take frames away.",
          ]} />
          <SectionTitle>Copy-on-Write (COW)</SectionTitle>
          <P1>After <code>fork()</code>, parent and child share physical pages marked read-only. On first write to a shared page, the OS creates a private copy for the writing process. Makes <code>fork()</code> O(1) in memory — critical for performance.</P1>
        </>),
      },
    ],
  },

  /* ─── UNIT 5: FILE SYSTEMS ───────────────────────────────────── */
  {
    unit: "Unit 5 · File Systems",
    icon: <FileText className="h-4 w-4" />,
    topics: [
      {
        title: "File System Concepts",
        content: (<>
          <P1>A <strong>file system</strong> provides the OS abstraction for storing, retrieving, and organising persistent data on storage devices. It manages the translation from the user's view (named files) to the storage device's view (physical sectors).</P1>
          <SectionTitle>File Attributes</SectionTitle>
          <UL items={[
            "<strong>Name</strong> — human-readable identifier (only attribute stored in the directory, not the inode).",
            "<strong>Identifier (inode number)</strong> — unique number within the file system.",
            "<strong>Type</strong> — regular file, directory, symbolic link, block device, character device, socket, pipe.",
            "<strong>Location</strong> — pointer to first block or inode on device.",
            "<strong>Size</strong> — current size in bytes.",
            "<strong>Protection</strong> — access control (Unix rwx bits, ACLs).",
            "<strong>Timestamps</strong> — created (ctime), modified (mtime), last accessed (atime).",
          ]} />
          <SectionTitle>Directory Structures</SectionTitle>
          <Table headers={["Structure", "Description", "OS Examples"]} rows={[
            ["Single-Level", "All files in one global directory. Name conflicts for multi-user systems.", "CP/M"],
            ["Two-Level", "Each user has their own directory. Better isolation, still limited.", "Early Unix"],
            ["Tree-Structured", "Hierarchical directories. Absolute paths from root (/). Relative paths from current directory.", "Unix, Windows, macOS"],
            ["Acyclic Graph", "Hard links allow files to have multiple directory entries. No cycles.", "Unix (hard links only)"],
            ["General Graph", "Symbolic links allow cycles. Requires cycle detection in traversal.", "Unix (with symlinks)"],
          ]} />
          <SectionTitle>File Operations</SectionTitle>
          <Table headers={["Operation", "Syscall", "Description"]} rows={[
            ["Create", "open(O_CREAT)", "Allocate space, make directory entry"],
            ["Open", "open()", "Find file, check permissions, create file descriptor"],
            ["Read", "read(fd, buf, n)", "Transfer n bytes from current position to buffer"],
            ["Write", "write(fd, buf, n)", "Transfer n bytes from buffer to file"],
            ["Seek", "lseek(fd, off, whence)", "Reposition file pointer without I/O"],
            ["Close", "close(fd)", "Release file descriptor, flush buffers"],
            ["Delete", "unlink()", "Remove directory entry; file deleted when link count drops to 0"],
            ["Truncate", "truncate()", "Clear file contents but keep attributes"],
          ]} />
        </>),
      },
      {
        title: "Disk Allocation Methods & Inodes",
        content: (<>
          <P1>The file system must decide how to store file data blocks on disk. Three classic methods exist, each with distinct tradeoffs.</P1>
          <SectionTitle>Contiguous Allocation</SectionTitle>
          <P1>Each file occupies a consecutive run of disk blocks. The directory entry stores start block and length.</P1>
          <UL items={[
            "✅ <strong>Fast sequential access</strong> — minimal seek time.",
            "✅ <strong>Fast random access</strong> — compute block address directly.",
            "❌ <strong>External fragmentation</strong> — free blocks scatter over time.",
            "❌ <strong>File growth</strong> — can't easily extend if next blocks are occupied.",
          ]} />
          <SectionTitle>Linked Allocation</SectionTitle>
          <P1>Each block contains a pointer to the next block. Directory stores first and last block. Used by FAT filesystem.</P1>
          <UL items={[
            "✅ No external fragmentation — any free block can be used.",
            "✅ Files can grow dynamically.",
            "❌ Sequential access only — must follow chain for random access.",
            "❌ Pointer overhead — 4 bytes per 512-byte block = 0.78% overhead.",
            "❌ Reliability — one bad pointer corrupts the rest of the file.",
          ]} />
          <SectionTitle>Indexed Allocation</SectionTitle>
          <P1>Each file has an <strong>index block</strong> (inode) containing all data block pointers. Directory stores pointer to the index block.</P1>
          <UL items={[
            "✅ Direct random access via the index block.",
            "✅ No external fragmentation.",
            "❌ Index block overhead for small files.",
            "❌ Limited maximum file size (solved with multi-level indexing).",
          ]} />
          <SectionTitle>Unix Inode Structure</SectionTitle>
          <Code>{`struct inode {
    mode_t   i_mode;       // file type + permissions (rwxrwxrwx)
    uid_t    i_uid;        // owner user ID
    gid_t    i_gid;        // owner group ID
    off_t    i_size;       // file size in bytes
    time_t   i_atime;      // last access time
    time_t   i_mtime;      // last modification time
    time_t   i_ctime;      // last status change time
    nlink_t  i_nlinks;     // hard link count
    blkptr_t i_direct[12]; // 12 direct block pointers (48KB at 4KB blocks)
    blkptr_t i_single;     // single-indirect: 1024 pointers → 4MB
    blkptr_t i_double;     // double-indirect: 1024² pointers → 4GB
    blkptr_t i_triple;     // triple-indirect: 1024³ pointers → 4TB
};
// Total max file size (4KB blocks, 4B ptrs): ≈ 4 TB`}</Code>
          <SectionTitle>Free Space Management</SectionTitle>
          <Table headers={["Method", "Structure", "Pros / Cons"]} rows={[
            ["Bit Vector (Bitmap)", "1 bit per block: 0=free, 1=allocated", "Easy to find contiguous free blocks; must be in memory"],
            ["Linked Free List", "Chain of free blocks, each pointing to next", "No wasted space for bitmap; sequential traversal only"],
            ["Grouping", "First free block holds N addresses; last address points to next group", "Find many free blocks quickly"],
            ["Counting", "Track (start, count) pairs of consecutive free blocks", "Efficient when files allocated/freed contiguously"],
          ]} />
        </>),
      },
      {
        title: "Disk Scheduling Algorithms",
        content: (<>
          <P1>Disk access has three cost components. Seek time dominates and is what scheduling algorithms optimise. The disk head services requests in an order that minimises total head movement.</P1>
          <Table headers={["Component", "Definition", "Typical Value (HDD)"]} rows={[
            ["Seek Time", "Time for head to move to correct track", "3–15 ms (dominant)"],
            ["Rotational Latency", "Time for sector to rotate under head", "~4 ms at 7200 RPM"],
            ["Transfer Time", "Time to read/write data once head is positioned", "~0.1 ms per sector"],
          ]} />
          <SectionTitle>FCFS</SectionTitle>
          <P1>Serve requests in arrival order. Fair but poor performance if requests are scattered across the disk.</P1>
          <Code>{`Queue: 98, 183, 37, 122, 14, 124, 65, 67   Head starts at 53
FCFS order: 53→98→183→37→122→14→124→65→67
Total head movement: 640 cylinders`}</Code>
          <SectionTitle>SSTF — Shortest Seek Time First</SectionTitle>
          <P1>Service the request closest to current head position. Greedy. Reduces seek time but can cause starvation of far requests.</P1>
          <Code>{`Same queue, head at 53:
SSTF order: 53→65→67→98→122→124→183→37→14
Total head movement: 236 cylinders  (63% improvement)`}</Code>
          <SectionTitle>SCAN (Elevator Algorithm)</SectionTitle>
          <P1>Head moves in one direction, servicing all requests until it reaches the end (or last request), then reverses. No starvation. Uniform service for requests in both directions.</P1>
          <SectionTitle>C-SCAN (Circular SCAN)</SectionTitle>
          <P1>Like SCAN but after reaching the end, the head returns to the beginning without servicing (fast seek). Then scans forward again. More uniform wait times than SCAN.</P1>
          <SectionTitle>LOOK / C-LOOK</SectionTitle>
          <P1>Optimised SCAN/C-SCAN — head only goes as far as the last request in each direction, not to the physical end of disk. More efficient in practice.</P1>
          <Table headers={["Algorithm", "Total Movement *", "Notes"]} rows={[
            ["FCFS", "640", "Worst; fair"],
            ["SSTF", "236", "Good avg; starvation possible"],
            ["SCAN", "208", "No starvation; slight unevenness near edges"],
            ["C-SCAN", "187", "Most uniform wait times"],
            ["C-LOOK", "153", "Best practical performance"],
          ]} />
          <InfoBox title="SSDs Don't Need Disk Scheduling">
            Solid State Drives have no moving parts — all locations are accessed equally fast. Disk scheduling algorithms apply only to HDDs. For SSDs, the focus shifts to wear levelling and write amplification minimisation.
          </InfoBox>
        </>),
      },
      {
        title: "File System Implementation",
        content: (<>
          <P1>A complete file system implementation involves multiple layers, each hiding complexity from the layer above.</P1>
          <SectionTitle>Layered File System Architecture</SectionTitle>
          <div className="my-4 border rounded-xl overflow-hidden text-sm">
            {[
              { label: "Application Programs", bg: "#dbeafe" },
              { label: "Logical File System (metadata, protection, directory structure)", bg: "#ede9fe" },
              { label: "File-Organisation Module (maps logical to physical blocks)", bg: "#d1fae5" },
              { label: "Basic File System (generic I/O by block number)", bg: "#fef9c3" },
              { label: "I/O Control (device drivers, interrupt handlers)", bg: "#fee2e2" },
              { label: "Hardware (HDD/SSD controller)", bg: "#f3f4f6" },
            ].map(({ label, bg }) => (
              <div key={label} className="px-4 py-2.5 border-b text-sm font-medium text-neutral-700 text-center" style={{ background: bg }}>
                {label}
              </div>
            ))}
          </div>
          <SectionTitle>On-Disk Structures</SectionTitle>
          <Table headers={["Structure", "Location", "Purpose"]} rows={[
            ["Boot Control Block (Boot Block)", "First block of volume", "Contains info needed to boot OS from this volume"],
            ["Volume Control Block (Superblock)", "First block of file system", "Block count, block size, free block count, free inode count"],
            ["Directory Structure", "Throughout file system", "Maps file names to inode numbers"],
            ["Inode Table", "Fixed region of disk", "One inode per file; stores all metadata"],
            ["Data Blocks", "Remainder of disk", "Actual file contents"],
          ]} />
          <SectionTitle>Journaling File Systems</SectionTitle>
          <P1>A <strong>journal</strong> (or write-ahead log) records pending changes before committing them to the main file system. If the system crashes mid-write, the journal is replayed on next boot to restore consistency — preventing corruption.</P1>
          <UL items={[
            "<strong>Write-ahead logging:</strong> Write journal entry → flush to disk → apply change → mark journal entry as complete.",
            "<strong>Journal modes:</strong> Full (journal data + metadata, slowest but safest), Ordered (journal metadata, data written first — default ext4), Writeback (journal metadata only, fastest, less safe).",
            "<strong>Examples:</strong> ext3/ext4 (Linux), NTFS (Windows), APFS (macOS), ZFS.",
          ]} />
        </>),
      },
    ],
  },

  /* ─── UNIT 6: I/O SYSTEMS ────────────────────────────────────── */
  {
    unit: "Unit 6 · I/O & Storage Systems",
    icon: <HardDrive className="h-4 w-4" />,
    topics: [
      {
        title: "I/O Hardware & Software",
        content: (<>
          <P1>The I/O subsystem is responsible for all communication between the CPU, memory, and peripheral devices. Its design profoundly affects overall system performance.</P1>
          <SectionTitle>I/O Hardware Components</SectionTitle>
          <UL items={[
            "<strong>Device Controller:</strong> A chip/circuit board that controls one or more devices. Has registers (data, control, status) that the CPU reads/writes to issue commands.",
            "<strong>Device Driver:</strong> OS software that understands a specific controller's register protocol and presents a uniform interface to the kernel.",
            "<strong>Memory-Mapped I/O:</strong> Controller registers are mapped to specific memory addresses. CPU uses regular load/store to communicate. No special I/O instructions needed.",
            "<strong>Port-Mapped I/O:</strong> Special IN/OUT CPU instructions access a separate I/O address space (x86 legacy).",
          ]} />
          <SectionTitle>I/O Techniques</SectionTitle>
          <Table headers={["Technique", "How It Works", "CPU Utilisation", "Best For"]} rows={[
            ["Programmed I/O (Polling)", "CPU continuously checks device status register in a loop", "100% — CPU wasted", "Very fast devices, simple embedded systems"],
            ["Interrupt-Driven I/O", "Device interrupts CPU when operation completes", "Low — CPU does useful work while device operates", "Moderate-speed devices (keyboard, serial)"],
            ["DMA (Direct Memory Access)", "DMA controller autonomously transfers data between device and RAM; interrupts CPU only at start/end", "Minimal — CPU free during entire transfer", "High-speed devices (disk, network, GPU)"],
            ["Channel I/O", "Independent I/O processors (channels) execute I/O programs", "Minimal", "Mainframe systems"],
          ]} />
          <SectionTitle>I/O Software Layers</SectionTitle>
          <div className="my-4 border rounded-xl overflow-hidden text-sm">
            {[
              { label: "User-Level I/O Libraries (stdio, buffering, formatting)", bg: "#dbeafe" },
              { label: "Device-Independent OS Software (naming, protection, buffering, error handling)", bg: "#ede9fe" },
              { label: "Device Drivers (device-specific code)", bg: "#d1fae5" },
              { label: "Interrupt Handlers (service hardware interrupts)", bg: "#fef9c3" },
              { label: "Hardware Devices", bg: "#fee2e2" },
            ].map(({ label, bg }) => (
              <div key={label} className="px-4 py-2.5 border-b text-sm font-medium text-neutral-700 text-center" style={{ background: bg }}>
                {label}
              </div>
            ))}
          </div>
          <SectionTitle>Buffering, Caching & Spooling</SectionTitle>
          <Table headers={["Technique", "Purpose", "Example"]} rows={[
            ["Single Buffer", "Smooth speed mismatch between device and CPU", "Read one disk block while processing the previous"],
            ["Double Buffer", "Producer fills one buffer while consumer empties the other", "Audio/video streaming"],
            ["Circular Buffer", "Ring of N buffers for continuous high-speed streaming", "Network packet buffers"],
            ["Cache", "Store frequently accessed data in fast memory", "Buffer Cache / Page Cache in Linux"],
            ["Spool (FSPOOL)", "Queue jobs for a device that can't interleave (serialises access)", "Print spooler"],
          ]} />
        </>),
      },
      {
        title: "RAID & Mass Storage",
        content: (<>
          <P1><strong>RAID (Redundant Array of Independent Disks)</strong> combines multiple physical disks to provide better performance, higher capacity, or fault tolerance — or a combination of these.</P1>
          <SectionTitle>RAID Levels in Detail</SectionTitle>
          <Table headers={["Level", "Name", "Technique", "Min Disks", "Read Perf", "Write Perf", "Fault Tolerance", "Usable Capacity"]} rows={[
            ["RAID 0", "Striping", "Data split across N disks in blocks", "2", "N×", "N×", "None", "100%"],
            ["RAID 1", "Mirroring", "Exact duplicate on 2 disks", "2", "2× (parallel reads)", "1×", "1 disk failure", "50%"],
            ["RAID 4", "Block-level parity", "Striping + dedicated parity disk", "3", "Good", "Poor (parity disk bottleneck)", "1 disk", "(N-1)/N"],
            ["RAID 5", "Distributed parity", "Parity distributed across all disks", "3", "Good", "Medium", "1 disk", "(N-1)/N"],
            ["RAID 6", "Double distributed parity", "Two parity blocks distributed", "4", "Good", "Lower than RAID 5", "2 disks", "(N-2)/N"],
            ["RAID 10 (1+0)", "Stripe of mirrors", "RAID 0 across RAID 1 pairs", "4", "Excellent", "Good", "1 disk per pair", "50%"],
          ]} />
          <SectionTitle>HDD vs SSD Architecture</SectionTitle>
          <Table headers={["Aspect", "HDD", "SSD"]} rows={[
            ["Storage medium", "Magnetic platters + read/write head", "NAND flash memory cells"],
            ["Access time", "5–15 ms (seek + rotation)", "0.05–0.15 ms (random)"],
            ["Sequential throughput", "100–200 MB/s", "500–7000 MB/s"],
            ["Random IOPS", "100–200", "100,000–1,000,000"],
            ["Power consumption", "5–10 W", "2–5 W"],
            ["Noise/Vibration", "Yes (mechanical)", "None"],
            ["Wear", "Mechanical failure", "Write endurance (P/E cycles)"],
            ["Best for", "High-capacity cold storage", "OS, databases, latency-sensitive apps"],
          ]} />
        </>),
      },
    ],
  },

  /* ─── UNIT 7: SECURITY ───────────────────────────────────────── */
  {
    unit: "Unit 7 · Security & Protection",
    icon: <Lock className="h-4 w-4" />,
    topics: [
      {
        title: "Protection Mechanisms",
        content: (<>
          <P1><strong>Protection</strong> refers to the mechanisms that control processes' access to system resources. <strong>Security</strong> is the broader problem of defending against external and internal attacks.</P1>
          <SectionTitle>Access Control Models</SectionTitle>
          <Table headers={["Model", "Description", "Example"]} rows={[
            ["Discretionary Access Control (DAC)", "Owner of resource decides who can access it", "Unix file permissions (chmod)"],
            ["Mandatory Access Control (MAC)", "System policy enforces access, users cannot override", "SELinux, military classification"],
            ["Role-Based Access Control (RBAC)", "Permissions assigned to roles; users assigned roles", "Corporate systems, databases"],
            ["Attribute-Based Access Control (ABAC)", "Access based on attributes of user, resource, environment", "Cloud IAM policies (AWS, Azure)"],
          ]} />
          <SectionTitle>Unix Permission Model</SectionTitle>
          <Code>{`ls -l myfile.txt
-rwxr-xr--  1 alice  staff  4096  Jan 29  myfile.txt
│││││││││
│││││││└── Others: r-- (read only)
│││││└──── Group:  r-x (read + execute)
│││└────── Owner:  rwx (read + write + execute)
│└──────── File type: - (regular), d (dir), l (link)...
│
chmod 754 myfile.txt   # same as above
# 7 = 111 = rwx (owner)
# 5 = 101 = r-x (group)
# 4 = 100 = r-- (others)`}</Code>
          <SectionTitle>setuid & setgid Bits</SectionTitle>
          <P1>When the <strong>setuid</strong> bit is set on an executable, it runs with the permissions of the file's <em>owner</em>, not the user executing it. Example: <code>passwd</code> must run as root to write to /etc/shadow, but any user needs to run it.</P1>
          <WarnBox title="Security Risk">
            setuid programs are extremely powerful attack targets. A bug in a setuid root binary (like the famous sudo CVEs) can give an attacker full root access.
          </WarnBox>
        </>),
      },
      {
        title: "Security Threats & Cryptography",
        content: (<>
          <P1>Modern OS security must defend against a wide spectrum of threats, from software bugs to network attacks.</P1>
          <SectionTitle>Common Attack Types</SectionTitle>
          <Table headers={["Attack", "Mechanism", "Defence"]} rows={[
            ["Buffer Overflow", "Write beyond array bounds to overwrite return address; redirect execution to shellcode", "Stack canaries, ASLR, NX bit, bounds checking"],
            ["SQL Injection", "Malicious SQL in user input alters database queries", "Prepared statements, input sanitisation"],
            ["Race Condition (TOCTOU)", "Time-of-check to time-of-use: resource changes between check and use", "Atomic operations, O_NOFOLLOW flag"],
            ["Privilege Escalation", "Exploit bug in privileged code to gain root/admin", "Least privilege principle, capability model"],
            ["Rootkit", "Modify OS kernel to hide malware", "Secure boot, kernel module signing, TPM"],
            ["Side-Channel Attack", "Infer secrets from timing, power, or cache behaviour (Spectre, Meltdown)", "Kernel page table isolation (KPTI), constant-time code"],
          ]} />
          <SectionTitle>OS-Level Defences</SectionTitle>
          <CardGrid items={[
            { title: "ASLR", body: "<strong>Address Space Layout Randomisation</strong> — randomises base addresses of stack, heap, libraries. Makes shellcode injection much harder.", color: "#3b82f6" },
            { title: "NX/DEP", body: "<strong>No-eXecute / Data Execution Prevention</strong> — marks memory pages as either executable (code) or writable (data) but never both. Prevents shellcode execution in data.", color: "#10b981" },
            { title: "Stack Canaries", body: "Random value placed between local variables and return address. Checked before function return — if changed, stack smash detected.", color: "#f59e0b" },
            { title: "Secure Boot", body: "UEFI verifies OS bootloader signature before execution. Prevents bootkit malware from loading before the OS.", color: "#ef4444" },
          ]} />
          <SectionTitle>Cryptographic Fundamentals</SectionTitle>
          <Table headers={["Type", "Key", "Examples", "OS Usage"]} rows={[
            ["Symmetric", "Same key encrypt+decrypt", "AES-256, ChaCha20", "Disk encryption (LUKS, BitLocker), TLS bulk data"],
            ["Asymmetric (Public-Key)", "Public key encrypts; private key decrypts", "RSA-4096, ECC (ECDSA, ECDH)", "SSH authentication, TLS handshake, code signing"],
            ["Hash Functions", "No key — one-way", "SHA-256, SHA-3, bcrypt", "Password storage (salted+hashed), file integrity (checksums)"],
            ["HMAC", "Hash + secret key for authentication", "HMAC-SHA256", "API authentication tokens, cookie signing"],
          ]} />
        </>),
      },
    ],
  },

  /* ─── UNIT 8: ADVANCED ───────────────────────────────────────── */
  {
    unit: "Unit 8 · Advanced OS Topics",
    icon: <Zap className="h-4 w-4" />,
    topics: [
      {
        title: "Virtualisation & Hypervisors",
        content: (<>
          <P1><strong>Virtualisation</strong> abstracts physical hardware into multiple isolated virtual machines (VMs), each running its own OS and believing it has exclusive hardware access.</P1>
          <SectionTitle>How Virtualisation Works</SectionTitle>
          <UL items={[
            "The <strong>hypervisor (VMM)</strong> runs directly on hardware or as an OS process.",
            "Guest OS runs in a less-privileged mode — its kernel instructions are intercepted (trapped) by the hypervisor.",
            "The hypervisor either emulates the instruction or safely executes it on the real hardware.",
            "Hardware-assisted virtualisation (Intel VT-x, AMD-V) adds a dedicated ring below ring 0 for the hypervisor, greatly improving performance.",
          ]} />
          <Table headers={["Type", "Runs On", "Characteristics", "Examples"]} rows={[
            ["Type 1 (Bare-Metal)", "Directly on hardware", "Best performance; no host OS overhead", "VMware ESXi, Xen, KVM, Hyper-V"],
            ["Type 2 (Hosted)", "On top of host OS", "Easier to set up; host OS overhead", "VirtualBox, VMware Workstation, QEMU"],
            ["Para-virtualisation", "Bare-metal; guest modified to call hypervisor directly", "Near-native performance; guest must be modified", "Xen (HVM mode)"],
            ["Hardware-Assisted", "Bare-metal with CPU support (VT-x/AMD-V)", "Run unmodified guest OSes efficiently", "KVM + QEMU, ESXi, Hyper-V"],
          ]} />
          <SectionTitle>Containers vs VMs</SectionTitle>
          <Table headers={["Aspect", "Virtual Machine", "Container (Docker/OCI)"]} rows={[
            ["Isolation level", "Full OS isolation (hardware-level MMU)", "Process-level (Linux namespaces + cgroups)"],
            ["Size", "GBs (full OS + app)", "MBs (app + libs only; shares kernel)"],
            ["Boot time", "Minutes (OS boot sequence)", "Milliseconds (process start)"],
            ["Performance overhead", "~5–10% (paravirt) to ~20% (full emulation)", "~1–3% (near-native)"],
            ["Security isolation", "Very strong", "Weaker (shared kernel = one CVE affects all)"],
            ["Use case", "Running different OSes; strong isolation", "Microservices; rapid scaling; DevOps CI/CD"],
          ]} />
        </>),
      },
      {
        title: "Distributed Systems & Cloud OS",
        content: (<>
          <P1>A <strong>distributed system</strong> is a collection of autonomous computers that appear to users as a single coherent system. The OS must manage resources across network-connected nodes.</P1>
          <SectionTitle>Key Design Goals</SectionTitle>
          <Table headers={["Goal", "Description", "Mechanisms"]} rows={[
            ["Transparency", "Hide distribution from users and applications", "Naming services, load balancers, migration"],
            ["Scalability", "Performance grows as nodes are added", "Horizontal scaling, consistent hashing, sharding"],
            ["Fault Tolerance", "System continues despite partial failures", "Replication, consensus (Raft/Paxos), heartbeats"],
            ["Consistency", "All nodes see the same data at the same time", "Two-phase commit, distributed transactions"],
            ["Security", "Protect across untrusted networks", "TLS everywhere, mutual authentication, RBAC"],
          ]} />
          <SectionTitle>CAP Theorem</SectionTitle>
          <P1>A distributed data store can guarantee at most <strong>two</strong> of the following three simultaneously:</P1>
          <div className="grid grid-cols-3 gap-3 my-4">
            {[
              { title: "Consistency", body: "Every read receives the most recent write or an error", color: "#3b82f6" },
              { title: "Availability", body: "Every request receives a response (not necessarily latest)", color: "#10b981" },
              { title: "Partition Tolerance", body: "System works despite arbitrary network partition", color: "#f59e0b" },
            ].map(({ title, body, color }) => (
              <div key={title} className="p-4 rounded-xl border-2 text-center" style={{ borderColor: color, background: color + "15" }}>
                <p className="font-black text-sm mb-1" style={{ color }}>{title}</p>
                <p className="text-xs text-neutral-600">{body}</p>
              </div>
            ))}
          </div>
          <UL items={[
            "<strong>CP systems</strong> (Consistency + Partition Tolerance): HBase, ZooKeeper — sacrifice availability during partition.",
            "<strong>AP systems</strong> (Availability + Partition Tolerance): Cassandra, DynamoDB — sacrifice strict consistency.",
            "<strong>CA systems</strong> (Consistency + Availability): only possible if you give up partition tolerance — practical only for single-node databases.",
          ]} />
          <SectionTitle>Cloud-Native OS Concepts</SectionTitle>
          <Table headers={["Concept", "Description"]} rows={[
            ["Container Orchestration", "Kubernetes automatically schedules, scales, and heals containers across a cluster"],
            ["Service Mesh", "Istio/Linkerd handles service-to-service mTLS, observability, load balancing"],
            ["Serverless (FaaS)", "OS manages event-driven function execution; user writes only function code (AWS Lambda)"],
            ["CGroups v2", "Linux control groups limit/track CPU, memory, I/O per container"],
            ["Namespaces", "Linux namespaces isolate PID, network, mount, IPC, UTS, user per container"],
          ]} />
        </>),
      },
      {
        title: "Linux Internals",
        content: (<>
          <P1>Linux is the world's most widely deployed OS kernel — from Android phones and IoT devices to supercomputers and cloud servers. Understanding its internals illuminates real OS design choices.</P1>
          <SectionTitle>Linux Kernel Architecture</SectionTitle>
          <UL items={[
            "<strong>Monolithic + Loadable Modules:</strong> The core kernel is monolithic for speed, but drivers and filesystems can be loaded/unloaded as modules without rebooting.",
            "<strong>Completely Fair Scheduler (CFS):</strong> Default scheduler uses a red-black tree ordered by virtual runtime. Every runnable process gets a fair share of CPU proportional to its weight (priority).",
            "<strong>Memory:</strong> Slab/SLUB allocator for kernel objects; Buddy system for pages; transparent huge pages (THP).",
            "<strong>VFS (Virtual File System):</strong> Abstract layer that lets ext4, XFS, Btrfs, NFS, FUSE, procfs all work through the same read()/write() interface.",
            "<strong>Netfilter/iptables:</strong> Kernel packet filtering framework. Basis for all Linux firewalls and NAT.",
          ]} />
          <SectionTitle>Linux Process Management</SectionTitle>
          <Code>{`# Viewing processes
ps aux           # all processes with details
top / htop       # interactive real-time view
pstree           # visualise process tree
/proc/<PID>/     # process information filesystem

# Signals
kill -9 <PID>   # SIGKILL — immediate termination
kill -15 <PID>  # SIGTERM — graceful shutdown
killall nginx   # kill all processes named nginx

# Process priorities (nice values: -20 highest to +19 lowest)
nice -n 10 ./cpu_heavy    # run with low priority
renice -5 -p <PID>        # change running process priority`}</Code>
          <SectionTitle>Linux Memory Commands</SectionTitle>
          <Code>{`free -h                # RAM and swap usage
vmstat 1               # virtual memory statistics (1-sec interval)
cat /proc/meminfo      # detailed memory breakdown
slabtop                # kernel slab allocator usage
/proc/<PID>/maps       # virtual memory layout of a process
pmap <PID>             # process memory map`}</Code>
        </>),
      },
    ],
  },

  /* ─── UNIT 9: NETWORKING IN OS ───────────────────────────────── */
  {
    unit: "Unit 9 · Networking & Sockets",
    icon: <Network className="h-4 w-4" />,
    topics: [
      {
        title: "Networking Fundamentals",
        content: (<>
          <P1>The OS networking stack implements protocols that allow processes on different machines (or the same machine) to communicate reliably.</P1>
          <SectionTitle>OSI Model vs TCP/IP</SectionTitle>
          <Table headers={["OSI Layer", "TCP/IP Layer", "Protocols", "OS Role"]} rows={[
            ["7. Application", "Application", "HTTP, FTP, SSH, DNS, SMTP", "Socket API; application reads/writes"],
            ["6. Presentation", "Application", "TLS/SSL, encoding", "TLS implemented in kernel or library"],
            ["5. Session", "Application", "RPC, NetBIOS", "Socket state management"],
            ["4. Transport", "Transport", "TCP, UDP, SCTP", "Kernel TCP/UDP stack; flow control, error recovery"],
            ["3. Network", "Internet", "IPv4, IPv6, ICMP, ARP", "IP routing, packet forwarding"],
            ["2. Data Link", "Network Access", "Ethernet, Wi-Fi (802.11), PPP", "NIC driver; frame construction"],
            ["1. Physical", "Network Access", "Cables, radio waves, fibre", "Hardware (NIC, switch)"],
          ]} />
          <SectionTitle>Socket Programming Model</SectionTitle>
          <Code>{`// TCP Server (simplified C)
int server_fd = socket(AF_INET, SOCK_STREAM, 0);   // create socket
bind(server_fd, &addr, sizeof(addr));               // assign port
listen(server_fd, 128);                             // accept queue
while (true) {
    int client_fd = accept(server_fd, &client, &len); // block until connection
    // handle client (fork or thread)
    read(client_fd, buf, sizeof(buf));
    write(client_fd, response, resp_len);
    close(client_fd);
}

// TCP Client
int sock = socket(AF_INET, SOCK_STREAM, 0);
connect(sock, &server_addr, sizeof(server_addr));  // three-way handshake
write(sock, request, req_len);
read(sock, response, sizeof(response));
close(sock);`}</Code>
          <SectionTitle>TCP vs UDP</SectionTitle>
          <Table headers={["Property", "TCP", "UDP"]} rows={[
            ["Connection", "Connection-oriented (3-way handshake)", "Connectionless (fire-and-forget)"],
            ["Reliability", "Guaranteed delivery, ordering, no duplicates", "No guarantees — may lose, reorder, duplicate"],
            ["Flow Control", "Yes (sliding window)", "No"],
            ["Congestion Control", "Yes (AIMD, BBR)", "No"],
            ["Overhead", "~20 byte header + connection state", "~8 byte header only"],
            ["Latency", "Higher (ACKs, retransmits)", "Lower (no setup, no ACKs)"],
            ["Use cases", "HTTP, SSH, FTP, database", "DNS, video streaming, VoIP, gaming"],
          ]} />
        </>),
      },
    ],
  },

  /* ─── UNIT 10: SHELL & CLI ───────────────────────────────────── */
  {
    unit: "Unit 10 · Shell & Command Line",
    icon: <Terminal className="h-4 w-4" />,
    topics: [
      {
        title: "Shell Internals & Scripting",
        content: (<>
          <P1>The <strong>shell</strong> is a command interpreter that reads user input, parses commands, forks child processes, and waits for them. It is also a full scripting language.</P1>
          <SectionTitle>How the Shell Executes a Command</SectionTitle>
          <Code>{`User types: ls -la /home
Shell steps:
  1. Read line from stdin
  2. Parse into tokens: ["ls", "-la", "/home"]
  3. fork() — create child process (child is a copy of shell)
  4. In child: execve("/bin/ls", ["ls","-la","/home"], envp)
              — replaces child's image with ls binary
  5. In parent: wait(&status) — wait for child to exit
  6. Shell prints prompt again`}</Code>
          <SectionTitle>I/O Redirection</SectionTitle>
          <Code>{`command > file      # stdout to file (overwrite)
command >> file     # stdout to file (append)
command < file      # stdin from file
command 2> file     # stderr to file
command &> file     # both stdout+stderr to file
command1 | command2 # pipe: stdout of cmd1 → stdin of cmd2

# Example: find all Python files, search for TODO, save results
find . -name "*.py" | xargs grep -n "TODO" > todos.txt 2>/dev/null`}</Code>
          <SectionTitle>Essential Bash Script Patterns</SectionTitle>
          <Code>{`#!/bin/bash
# Variables
NAME="AlgoLogic"
echo "Hello, $NAME"

# Conditionals
if [ -f /etc/passwd ]; then
    echo "passwd exists"
elif [ $UID -eq 0 ]; then
    echo "Running as root"
else
    echo "Not root, no passwd"
fi

# Loops
for f in *.txt; do
    wc -l "$f"
done

while read line; do
    echo ">> $line"
done < input.txt

# Functions
greet() {
    local user="$1"         # local variable
    echo "Welcome, $user!"
    return 0
}
greet "student"

# Process substitution
diff <(sort file1.txt) <(sort file2.txt)`}</Code>
          <SectionTitle>Key Unix Commands Reference</SectionTitle>
          <Table headers={["Command", "Purpose", "Key Flags"]} rows={[
            ["ls", "List directory contents", "-la (all, long format), -lh (human sizes), -R (recursive)"],
            ["find", "Search for files", "-name, -type, -mtime, -exec, -size"],
            ["grep", "Search text patterns", "-r (recursive), -n (line numbers), -i (case insensitive), -v (invert)"],
            ["awk", "Text processing language", "'{print $1}' (print first field), -F: (field separator)"],
            ["sed", "Stream editor", "'s/old/new/g' (substitute globally)"],
            ["chmod", "Change permissions", "chmod 755 file, chmod +x script.sh"],
            ["ps", "Process status", "ps aux (all processes), ps -ef (full format)"],
            ["netstat/ss", "Network connections", "ss -tulpn (listening TCP/UDP with PID)"],
            ["strace", "Trace system calls", "strace -p <PID> (attach to running process)"],
            ["lsof", "List open files", "lsof -p <PID>, lsof -i :80 (port 80)"],
          ]} />
        </>),
      },
    ],
  },
];

const ALL_TOPICS = UNITS.flatMap(u => u.topics.map(t => ({ ...t, unit: u.unit, unitIcon: u.icon })));

/* ═══════════════════════════════════════════════════════════════
   PAGE COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function OSTheoryPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const topic = ALL_TOPICS[currentIndex];
  const progress = Math.round(((currentIndex + 1) / ALL_TOPICS.length) * 100);

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Source Sans Pro', sans-serif", background: "var(--alg-bg)", color: "var(--alg-text)" }}>
      {/* Navbar */}
      <header className="fixed top-0 w-full h-14 flex items-center justify-between px-6 border-b z-50 shadow-sm bg-white" style={{ borderColor: "var(--border-color)" }}>
        <Link href="/" className="font-black text-xl no-underline flex items-center gap-2" style={{ color: P }}>
          <Code2 className="h-6 w-6" /> AlgoLogic
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden md:block text-xs font-semibold uppercase tracking-widest text-neutral-400">OS Tutorial</span>
          <div className="flex items-center gap-2">
            <div className="w-28 h-1.5 rounded-full overflow-hidden bg-gray-200">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: S }} />
            </div>
            <span className="text-xs text-neutral-400 font-mono">{currentIndex + 1}/{ALL_TOPICS.length}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setSidebarOpen(o => !o)} className="p-2 rounded-lg hover:bg-gray-100 text-neutral-500 transition-colors" title="Toggle sidebar">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <Link href="/" className="text-sm font-semibold no-underline flex items-center gap-1.5 text-neutral-500 hover:text-[var(--alg-secondary)] transition-colors">
            <ArrowLeft className="h-4 w-4" /> Exit
          </Link>
        </div>
      </header>

      <div className="flex pt-14 min-h-[calc(100vh-56px)]">
        {/* Sidebar */}
        {sidebarOpen && (
          <nav className="w-64 min-w-[256px] border-r overflow-y-auto py-4 shrink-0 bg-white hidden md:block" style={{ borderColor: "var(--border-color)" }}>
            <p className="px-5 pb-3 text-xs font-black uppercase tracking-widest" style={{ color: P }}>Contents</p>
            {UNITS.map(unit => (
              <div key={unit.unit} className="mb-1">
                <div className="flex items-center gap-2 px-5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  {unit.icon}<span>{unit.unit.split("·")[1]?.trim()}</span>
                </div>
                {unit.topics.map(t => {
                  const idx = ALL_TOPICS.findIndex(x => x.title === t.title && x.unit === unit.unit);
                  const active = idx === currentIndex;
                  const done = idx < currentIndex;
                  return (
                    <button key={t.title} onClick={() => setCurrentIndex(idx)}
                      className={`block w-full text-left py-1.5 pl-9 pr-3 text-xs transition-all border-l-2 ${active ? "font-bold" : done ? "font-medium text-neutral-400 border-transparent" : "font-normal border-transparent text-neutral-500 hover:bg-gray-50 hover:text-[var(--alg-text)]"}`}
                      style={active ? { background: S + "12", color: P, borderColor: S } : {}}
                    >
                      {done && <span className="mr-1 text-green-500">✓</span>}{t.title}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto py-10 px-5 md:px-10">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: S }}>{topic.unit}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black mb-1" style={{ color: P }}>{topic.title}</h1>
            <hr className="my-5" style={{ borderColor: "var(--border-color)" }} />
            <div>{topic.content}</div>

            {/* Prev / Next */}
            <div className="flex justify-between items-center mt-14 pt-6 border-t" style={{ borderColor: "var(--border-color)" }}>
              <button
                onClick={() => { setCurrentIndex(i => Math.max(0, i - 1)); window.scrollTo(0, 0); }}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white transition-all hover:-translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed disabled:translate-y-0"
                style={{ background: S }}
              >
                <ArrowLeft className="h-4 w-4" /> Previous
              </button>
              {currentIndex < ALL_TOPICS.length - 1 ? (
                <button
                  onClick={() => { setCurrentIndex(i => i + 1); window.scrollTo(0, 0); }}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white transition-all hover:-translate-y-0.5"
                  style={{ background: P }}
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <Link href="/quiz/os"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white no-underline transition-all hover:-translate-y-0.5"
                  style={{ background: "#16a34a" }}
                >
                  Take OS Quiz →
                </Link>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
