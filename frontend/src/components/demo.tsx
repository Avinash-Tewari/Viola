'use client'

import { SplineScene } from "@/components/ui/splite";
import { Card } from "@/components/ui/card"
import { Spotlight } from "@/components/ui/spotlight"
 
export function SplineSceneBasic() {
  return (
    <Card className="w-full max-w-6xl mx-auto h-[500px] bg-black/[0.96] relative overflow-hidden border-[rgba(255,255,255,0.08)]">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="white"
      />
      
      <div className="flex h-full flex-col md:flex-row">
        {/* Left content */}
        <div className="flex-1 p-8 md:p-12 relative z-10 flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
            Meet Viola
          </h1>
          <p className="mt-4 text-neutral-300 max-w-lg text-base leading-relaxed">
            Your AI-powered voice & text assistant. Have natural conversations,
            search the web, send emails, and more — all powered by real-time 3D interaction.
          </p>
        </div>

        {/* Right content - Spline 3D */}
        <div className="flex-1 relative min-h-[250px]">
          <SplineScene 
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </div>
    </Card>
  )
}

export function Demo() {
  return (
    <div className="flex items-center justify-center min-h-screen px-6 py-8">
      <SplineSceneBasic />
    </div>
  )
}
