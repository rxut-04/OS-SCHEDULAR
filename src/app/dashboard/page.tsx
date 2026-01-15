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
import { MeshGradient } from '@paper-design/shaders-react'
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
    <div className="space-y-6 font-['Lexend:Regular',_sans-serif]">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
          {/* Total Score Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/[0.08] p-6 rounded-2xl relative overflow-hidden group hover:bg-white/10 transition-colors duration-300">
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
                <p className="text-neutral-400 text-sm font-medium">Total Score</p>
              </div>
              <h3 className="text-4xl font-bold text-neutral-50 mb-2">2,450</h3>
              <div className="flex items-center gap-2 text-[#22D3EE] text-xs font-medium bg-[#22D3EE]/10 w-fit px-2 py-1 rounded-full border border-[#22D3EE]/20">
                <ChartLineData size={16} />
                <span>+12% this week</span>
              </div>
            </div>
          </div>

          {/* Mastered Card */}
          <Link href="/dashboard/progress">
            <div className="bg-white/5 backdrop-blur-xl border border-white/[0.08] p-6 rounded-2xl relative overflow-hidden group hover:bg-white/10 transition-colors duration-300 cursor-pointer">
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
                   <p className="text-neutral-400 text-sm font-medium">Algorithms Mastered</p>
                </div>
                <h3 className="text-4xl font-bold text-neutral-50 mb-2">8/12</h3>
                <div className="w-full bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden">
                  <div className="bg-blue-500 h-1.5 rounded-full w-2/3 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                </div>
              </div>
            </div>
          </Link>

          {/* Streak Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/[0.08] p-6 rounded-2xl relative overflow-hidden group hover:bg-white/10 transition-colors duration-300">
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
                <p className="text-neutral-400 text-sm font-medium">Current Streak</p>
              </div>
              <h3 className="text-4xl font-bold text-[#22D3EE] mb-2">5 Days</h3>
              <p className="text-neutral-500 text-xs">Keep the momentum going!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Start Learning Card - Featured */}
        <motion.div 
          className="lg:col-span-2 relative min-h-[400px] h-auto rounded-2xl overflow-hidden border border-white/[0.08] group cursor-pointer"
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute inset-0 z-0">
             <MeshGradient
                colors={["#000000", "#1e3a8a", "#000000", "#1e40af", "#172554"]}
                speed={0.2}
            />
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent z-10" />
          
          <div className="relative z-20 h-full p-8 flex flex-col justify-center max-w-xl pb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-medium w-fit mb-6">
              <Education size={16} />
              <span>Recommended for you</span>
            </div>
            <h2 className="text-5xl font-bold text-white mb-4 leading-tight font-['Lexend:SemiBold',_sans-serif]">
              Master CPU Scheduling
            </h2>
            <div className="text-blue-400 text-xl mb-6 font-light tracking-wide flex items-center gap-2">
                <span className="w-8 h-[1px] bg-blue-400 inline-block"></span>
                Interactive Visualization
            </div>
            <p className="text-neutral-300 mb-8 max-w-md font-light leading-relaxed">
              Dive deep into FCFS, SJF, Round Robin and Priority scheduling with our 3D interactive visualizer.
            </p>
            <Link href="/modules">
              <button className="px-8 py-3 bg-[#3B82F6] text-white rounded-lg font-bold flex items-center gap-3 hover:bg-[#2563EB] transition-all group-hover:pl-10 duration-300 shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                <Play size={20} />
                <span>Start Learning</span>
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Daily Quiz Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/[0.08] p-6 rounded-2xl flex flex-col hover:bg-white/10 transition-colors duration-300">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-neutral-50 flex items-center gap-2">
              <Image 
                 src="https://cdn-icons-png.flaticon.com/512/6193/6193980.png" 
                 alt="Quiz" 
                 width={24} 
                 height={24} 
              />
              Daily Quiz
            </h3>
            <span className="text-xs font-medium bg-[#A855F7]/10 text-[#A855F7] px-2 py-1 rounded border border-[#A855F7]/20 uppercase tracking-wider">
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
                 className="drop-shadow-[0_0_30px_rgba(168,85,247,0.3)]"
              />
            </div>
            <div>
              <h4 className="text-neutral-50 font-medium text-lg mb-1">OS Fundamentals</h4>
              <div className="flex items-center justify-center gap-2 text-neutral-400 text-sm">
                  <span>10 Questions</span>
                  <span className="w-1 h-1 rounded-full bg-neutral-600"></span>
                  <span>15 Mins</span>
              </div>
            </div>
            <Link href="/dashboard/quiz" className="w-full">
              <button className="w-full py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-50 transition-all font-medium text-sm flex items-center justify-center gap-2 group">
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
        <div className="bg-white/5 backdrop-blur-xl border border-white/[0.08] p-6 rounded-2xl hover:bg-white/10 transition-colors duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <UserActivity size={20} className="text-[#3B82F6]"/>
              <div>
                 <h3 className="text-lg font-bold text-neutral-50">Learning Activity</h3>
                 <p className="text-neutral-500 text-xs">Time spent learning per day</p>
              </div>
            </div>
            <div className="flex gap-2">
               <button className="px-3 py-1 rounded bg-white/10 text-xs text-neutral-300 hover:bg-white/20 transition-colors">Weekly</button>
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{fontSize: 12, fontFamily: 'Lexend'}} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="rgba(255,255,255,0.3)" tick={{fontSize: 12, fontFamily: 'Lexend'}} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontFamily: 'Lexend' }}
                  itemStyle={{ color: '#fff' }}
                  cursor={{stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1}}
                />
                <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Proficiency Bars */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/[0.08] p-6 rounded-2xl hover:bg-white/10 transition-colors duration-300">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Meter size={20} className="text-[#A855F7]"/>
              <div>
                <h3 className="text-lg font-bold text-neutral-50">Algorithm Proficiency</h3>
                <p className="text-neutral-500 text-xs">Your progress across topics</p>
              </div>
            </div>
          </div>
          <div className="space-y-6">
             {[
               { name: 'CPU Scheduling', progress: 75, color: 'bg-[#3B82F6]', shadow: 'shadow-[0_0_10px_rgba(59,130,246,0.5)]' },
               { name: 'Disk Scheduling', progress: 45, color: 'bg-[#A855F7]', shadow: 'shadow-[0_0_10px_rgba(168,85,247,0.5)]' },
               { name: 'Memory Management', progress: 30, color: 'bg-[#22D3EE]', shadow: 'shadow-[0_0_10px_rgba(34,211,238,0.5)]' },
               { name: 'Page Replacement', progress: 60, color: 'bg-[#06B6D4]', shadow: 'shadow-[0_0_10px_rgba(6,182,212,0.5)]' },
             ].map((item) => (
               <div key={item.name} className="space-y-2 group">
                 <div className="flex justify-between text-sm">
                   <span className="text-neutral-300 font-medium group-hover:text-white transition-colors">{item.name}</span>
                   <span className="text-neutral-400 font-mono">{item.progress}%</span>
                 </div>
                 <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                   <div 
                      className={`h-full rounded-full ${item.color} ${item.shadow} transition-all duration-1000 ease-out`} 
                      style={{ width: `${item.progress}%` }}
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
