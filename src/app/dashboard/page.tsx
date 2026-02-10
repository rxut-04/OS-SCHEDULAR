"use client";

import { motion } from 'framer-motion'
import Image from 'next/image'
import { 
  Trophy, 
  CenterCircle, 
  Flash, 
  Education,
  Play,
  ChartLineData,
  Meter,
  UserActivity,
  ArrowRight
} from '@carbon/icons-react'
import Link from 'next/link'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

const data = [
  { name: 'Mon', score: 40 },
  { name: 'Tue', score: 30 },
  { name: 'Wed', score: 60 },
  { name: 'Thu', score: 45 },
  { name: 'Fri', score: 80 },
  { name: 'Sat', score: 55 },
  { name: 'Sun', score: 75 },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
          {/* Total Score Card */}
          <div className="p-6 rounded-2xl relative overflow-hidden group transition-colors duration-300 border" style={{ background: 'var(--alg-white)', borderColor: 'var(--border-color)', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <div className="absolute top-0 right-0 p-4 transition-opacity">
              <Image 
                 src="https://cdn-icons-png.flaticon.com/512/3188/3188696.png" 
                 alt="Trophy" 
                 width={96} 
                 height={96} 
              />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Image 
                   src="https://cdn-icons-png.flaticon.com/512/3188/3188696.png" 
                   alt="Trophy" 
                   width={24} 
                   height={24} 
                />
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Total Score</p>
              </div>
              <h3 className="text-4xl font-bold mb-2" style={{ color: 'var(--alg-text)' }}>2,450</h3>
              <div className="flex items-center gap-2 text-xs font-medium w-fit px-2 py-1 rounded-full border" style={{ color: 'var(--alg-secondary)', background: 'var(--alg-mint)', borderColor: 'var(--alg-secondary)' }}>
                <ChartLineData size={16} />
                <span>+12% this week</span>
              </div>
            </div>
          </div>

          {/* Mastered Card */}
          <Link href="/dashboard/progress">
            <div className="p-6 rounded-2xl relative overflow-hidden group transition-colors duration-300 cursor-pointer border" style={{ background: 'var(--alg-white)', borderColor: 'var(--border-color)', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div className="absolute top-0 right-0 p-4 transition-opacity">
                <Image 
                   src="https://cdn-icons-png.flaticon.com/512/8187/8187797.png" 
                   alt="Target" 
                   width={96} 
                   height={96} 
                />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                   <Image 
                      src="https://cdn-icons-png.flaticon.com/512/8187/8187797.png" 
                      alt="Target" 
                      width={24} 
                      height={24} 
                   />
                   <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Algorithms Mastered</p>
                </div>
                <h3 className="text-4xl font-bold mb-2" style={{ color: 'var(--alg-text)' }}>8/12</h3>
                <div className="w-full h-1.5 rounded-full mt-4 overflow-hidden" style={{ background: 'var(--alg-bg)' }}>
                  <div className="h-1.5 rounded-full w-2/3" style={{ background: 'var(--alg-secondary)' }}></div>
                </div>
              </div>
            </div>
          </Link>

          {/* Streak Card */}
          <div className="p-6 rounded-2xl relative overflow-hidden group transition-colors duration-300 border" style={{ background: 'var(--alg-white)', borderColor: 'var(--border-color)', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <div className="absolute top-0 right-0 p-4 transition-opacity">
              <Image 
                 src="https://cdn-icons-png.flaticon.com/512/10808/10808692.png" 
                 alt="Flash" 
                 width={96} 
                 height={96} 
              />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Image 
                   src="https://cdn-icons-png.flaticon.com/512/10808/10808692.png" 
                   alt="Flash" 
                   width={24} 
                   height={24} 
                />
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Current Streak</p>
              </div>
              <h3 className="text-4xl font-bold mb-2" style={{ color: 'var(--alg-secondary)' }}>5 Days</h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Keep the momentum going!</p>
            </div>
          </div>
        </div>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Start Learning Card - Featured */}
          <Link href="/modules" className="block">
            <motion.div 
              className="relative min-h-[400px] h-auto rounded-2xl overflow-hidden border border-white/[0.08] group cursor-pointer"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(135deg, var(--alg-primary) 0%, var(--alg-header-bar) 100%)' }} />
              
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--alg-primary)]/95 via-[var(--alg-primary)]/60 to-transparent z-10" />
              
              <div className="relative z-20 h-full p-8 flex flex-col justify-center max-w-xl pb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium w-fit mb-6 border" style={{ background: 'var(--alg-mint)', borderColor: 'var(--alg-secondary)', color: 'var(--alg-primary)' }}>
                  <Education size={16} />
                  <span>Operating Systems</span>
                </div>
                <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                  Master CPU Scheduling
                </h2>
                <div className="text-lg mb-4 font-light tracking-wide flex items-center gap-2" style={{ color: 'var(--alg-mint)' }}>
                    <span className="w-6 h-[1px] inline-block" style={{ background: 'var(--alg-secondary)' }}></span>
                    Interactive Visualization
                </div>
                <p className="mb-6 max-w-md font-light leading-relaxed text-sm text-white/90">
                  Dive deep into FCFS, SJF, Round Robin and Priority scheduling with our 3D interactive visualizer.
                </p>
                <button className="px-6 py-3 text-white rounded-lg font-bold flex items-center gap-3 transition-all group-hover:pl-8 duration-300 w-fit" style={{ background: 'var(--alg-secondary)' }}>
                  <Play size={18} />
                  <span>Start Learning</span>
                </button>
              </div>
            </motion.div>
          </Link>

          {/* AI/ML Visualizer Card */}
          <Link href="/modules?tab=aiml" className="block">
            <motion.div 
              className="relative min-h-[400px] h-auto rounded-2xl overflow-hidden border border-white/[0.08] group cursor-pointer"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(135deg, var(--alg-ai-accent) 0%, #043a2c 100%)' }} />
              
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--alg-ai-accent)]/95 via-[var(--alg-ai-accent)]/60 to-transparent z-10" />
              
              <div className="absolute top-4 right-4 z-20">
                <motion.div 
                  className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border"
                  style={{ background: 'var(--alg-yellow)', borderColor: 'var(--alg-primary)', color: 'var(--alg-text)' }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="w-2 h-2 rounded-full bg-[var(--alg-secondary)] animate-pulse"></span>
                  <span>NEW</span>
                </motion.div>
              </div>
              
              <div className="relative z-20 h-full p-8 flex flex-col justify-center max-w-xl pb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium w-fit mb-6 border" style={{ background: 'var(--alg-yellow)', borderColor: 'var(--alg-primary)', color: 'var(--alg-text)' }}>
                  <ChartLineData size={16} />
                  <span>Machine Learning</span>
                </div>
                <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                  AI/ML Visualizer
                </h2>
                <div className="text-lg mb-4 font-light tracking-wide flex items-center gap-2" style={{ color: 'var(--alg-yellow)' }}>
                    <span className="w-6 h-[1px] inline-block bg-[var(--alg-yellow)]"></span>
                    Learn by Visualization
                </div>
                <p className="mb-6 max-w-md font-light leading-relaxed text-sm text-white/90">
                  Explore K-Means, Neural Networks, Decision Trees and more with stunning interactive visualizations.
                </p>
                <button className="px-6 py-3 text-white rounded-lg font-bold flex items-center gap-3 transition-all group-hover:pl-8 duration-300 w-fit" style={{ background: 'var(--alg-secondary)' }}>
                  <Play size={18} />
                  <span>Explore AI/ML</span>
                </button>
              </div>
            </motion.div>
          </Link>

          {/* Daily Quiz Card */}
        <div className="p-6 rounded-2xl flex flex-col transition-colors duration-300 border" style={{ background: 'var(--alg-white)', borderColor: 'var(--border-color)', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--alg-text)' }}>
              <Image 
                 src="https://cdn-icons-png.flaticon.com/512/6193/6193980.png" 
                 alt="Quiz" 
                 width={24} 
                 height={24} 
              />
              Daily Quiz
            </h3>
            <span className="text-xs font-medium px-2 py-1 rounded border uppercase tracking-wider" style={{ background: 'var(--alg-mint)', color: 'var(--alg-secondary)', borderColor: 'var(--alg-secondary)' }}>
              New
            </span>
          </div>
          
          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
            <div className="relative">
              <Image 
                 src="https://cdn-icons-png.flaticon.com/512/6193/6193980.png" 
                 alt="Quiz" 
                 width={120} 
                 height={120} 
              />
            </div>
            <div>
              <h4 className="font-medium text-lg mb-1" style={{ color: 'var(--alg-text)' }}>OS Fundamentals</h4>
              <div className="flex items-center justify-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <span>10 Questions</span>
                  <span className="w-1 h-1 rounded-full bg-[var(--border-color)]"></span>
                  <span>15 Mins</span>
              </div>
            </div>
            <Link href="/dashboard/quiz" className="w-full">
              <button className="w-full py-3 rounded-lg border font-medium text-sm flex items-center justify-center gap-2 group transition-all" style={{ background: 'var(--alg-bg)', borderColor: 'var(--border-color)', color: 'var(--alg-text)' }}>
                <span>Start Quiz</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Progress Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <div className="p-6 rounded-2xl transition-colors duration-300 border" style={{ background: 'var(--alg-white)', borderColor: 'var(--border-color)', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <UserActivity size={20} style={{ color: 'var(--alg-secondary)' }}/>
              <div>
                 <h3 className="text-lg font-bold" style={{ color: 'var(--alg-text)' }}>Learning Activity</h3>
                 <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Time spent learning per day</p>
              </div>
            </div>
            <div className="flex gap-2">
               <button className="px-3 py-1 rounded text-xs transition-colors" style={{ background: 'var(--alg-mint)', color: 'var(--alg-primary)' }}>Weekly</button>
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" tick={{fontSize: 12}} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="var(--text-muted)" tick={{fontSize: 12}} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--alg-white)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--alg-text)' }}
                  cursor={{stroke: 'var(--border-color)', strokeWidth: 1}}
                />
                <Area type="monotone" dataKey="score" stroke="var(--alg-secondary)" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Proficiency Bars */}
        <div className="p-6 rounded-2xl transition-colors duration-300 border" style={{ background: 'var(--alg-white)', borderColor: 'var(--border-color)', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Meter size={20} style={{ color: 'var(--alg-secondary)' }}/>
              <div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--alg-text)' }}>Algorithm Proficiency</h3>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Your progress across topics</p>
              </div>
            </div>
          </div>
          <div className="space-y-6">
             {[
               { name: 'CPU Scheduling', progress: 75 },
               { name: 'Disk Scheduling', progress: 45 },
               { name: 'Memory Management', progress: 30 },
               { name: 'Page Replacement', progress: 60 },
             ].map((item) => (
               <div key={item.name} className="space-y-2 group">
                 <div className="flex justify-between text-sm">
                   <span className="font-medium transition-colors" style={{ color: 'var(--alg-text)' }}>{item.name}</span>
                   <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{item.progress}%</span>
                 </div>
                 <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'var(--alg-bg)' }}>
                   <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${item.progress}%`, background: 'var(--alg-secondary)' }}
                   />
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  )
}
