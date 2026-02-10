"use client";

import { useState } from "react";
import { AnimatedRadialChart } from "@/components/ui/animated-radial-chart";

export default function ProgressPage() {
  const [value, setValue] = useState(74);
  const [size, setSize] = useState(300);
  const [strokeWidth, setStrokeWidth] = useState<number | undefined>(undefined);
  const [showLabels, setShowLabels] = useState(true);
  const [duration, setDuration] = useState(2);

  return (
    <div className="min-h-screen bg-transparent p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Main Chart Display */}
        <div className="flex items-center justify-center min-h-[500px]">
          <AnimatedRadialChart
            value={value}
            size={400}
            strokeWidth={strokeWidth}
            showLabels={showLabels}
            duration={duration}
            key={`${value}-${size}-${strokeWidth}-${showLabels}-${duration}`} // Force re-render on changes
          />
        </div>

        {/* Different Sizes Demo */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold" style={{ color: 'var(--alg-text)' }}>Size Variations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-center justify-items-center">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">Small (150px)</p>
              <AnimatedRadialChart value={45} size={150} />
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">Medium (200px)</p>
              <AnimatedRadialChart value={65} size={200} />
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">Large (250px)</p>
              <AnimatedRadialChart value={85} size={250} />
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">Extra Large (300px)</p>
              <AnimatedRadialChart value={95} size={300} />
            </div>
          </div>
        </div>

        {/* Props Documentation */}
        <div className="p-6 rounded-lg border" style={{ background: 'var(--alg-white)', borderColor: 'var(--border-color)' }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--alg-text)' }}>Component Props</h2>
          <div className="space-y-3" style={{ color: 'var(--text-secondary)' }}>
            <div><code className="text-orange-600">value</code>: <span className="text-neutral-600">number (0-100) - The percentage value to display</span></div>
            <div><code className="text-orange-600">size</code>: <span className="text-neutral-600">number - The width/height of the component in pixels</span></div>
            <div><code className="text-orange-600">strokeWidth</code>: <span className="text-neutral-600">number | undefined - Custom stroke width (auto-calculated if not provided)</span></div>
            <div><code className="text-orange-600">className</code>: <span className="text-neutral-600">string - Additional CSS classes</span></div>
            <div><code className="text-orange-600">showLabels</code>: <span className="text-neutral-600">boolean - Show/hide 0% and 100% labels</span></div>
            <div><code className="text-orange-600">duration</code>: <span className="text-neutral-600">number - Animation duration in seconds</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
