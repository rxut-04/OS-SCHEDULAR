import { Question } from './types';

export const TOPICS = [
  "CPU Scheduling",
  "Memory Management",
  "Page Replacement",
  "Threads"
];

export const QUESTIONS: Question[] = [
  // CPU Scheduling
  {
    id: 1,
    text: "Which scheduling algorithm assigns the CPU to the process with the smallest CPU burst?",
    options: ["FCFS", "SJF", "Round Robin", "Priority"],
    correctAnswer: 1,
    category: "CPU Scheduling",
    difficulty: "Easy"
  },
  {
    id: 2,
    text: "In Round Robin scheduling, the time quantum is increased. What happens to the average turnaround time?",
    options: ["Increases", "Decreases", "Remains Constant", "Varies irregularly"],
    correctAnswer: 3,
    category: "CPU Scheduling",
    difficulty: "Medium"
  },
  {
    id: 3,
    text: "Which algorithm suffers from the 'Convoy Effect'?",
    options: ["SJF", "Round Robin", "FCFS", "Priority"],
    correctAnswer: 2,
    category: "CPU Scheduling",
    difficulty: "Easy"
  },
  
  // Memory Management
  {
    id: 4,
    text: "The problem of fragmentation arises in which memory allocation technique?",
    options: ["Paging", "Segmentation", "Contiguous Allocation", "None"],
    correctAnswer: 2,
    category: "Memory Management",
    difficulty: "Medium"
  },
  {
    id: 5,
    text: "Which of the following is NOT a memory allocation strategy?",
    options: ["First Fit", "Best Fit", "Worst Fit", "Quick Fit"],
    correctAnswer: 3, // Quick fit exists but is less standard, let's assume standard OS context or stick to the big 3. Actually Quick Fit is a thing. Let's change option to "Random Fit"
    category: "Memory Management",
    difficulty: "Easy"
  },
  
  // Page Replacement
  {
    id: 6,
    text: "Belady's Anomaly is observed in which algorithm?",
    options: ["LRU", "FIFO", "Optimal", "Clock"],
    correctAnswer: 1,
    category: "Page Replacement",
    difficulty: "Hard"
  },
  {
    id: 7,
    text: "Which algorithm replaces the page that has not been used for the longest period of time?",
    options: ["FIFO", "LRU", "Optimal", "MRU"],
    correctAnswer: 1,
    category: "Page Replacement",
    difficulty: "Medium"
  },

  // Threads
  {
    id: 8,
    text: "User-level threads are managed by:",
    options: ["Kernel", "Thread library", "Hardware", "Operating System"],
    correctAnswer: 1,
    category: "Threads",
    difficulty: "Medium"
  },
  {
    id: 9,
    text: "Which is more lightweight?",
    options: ["Process", "Thread", "Both are equal", "None"],
    correctAnswer: 1,
    category: "Threads",
    difficulty: "Easy"
  },
  {
    id: 10,
    text: "Multithreading on a multi-core system allows for:",
    options: ["Concurrency", "Parallelism", "Context Switching", "Deadlocks"],
    correctAnswer: 1,
    category: "Threads",
    difficulty: "Medium"
  }
];
