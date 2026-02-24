"use client";
import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
    children?: ReactNode;
    showRadialGradient?: boolean;
    transparent?: boolean;
}

const ShootingStar = ({ delay = 0, top = 20, left = 50 }: { delay?: number; top?: number; left?: number }) => {
    return (
        <span
            className="absolute h-0.5 w-[100px] bg-gradient-to-r from-transparent via-white to-transparent rotate-[215deg] animate-shooting-star"
            style={{
                top: `${top}%`,
                left: `${left}%`,
                animationDelay: `${delay}ms`,
            }}
        />
    );
};

export const AuroraBackground = ({
    className,
    children,
    showRadialGradient = true,
    transparent = false,
    ...props
}: AuroraBackgroundProps) => {
    return (
        <div
            className={cn(
                "relative flex flex-col min-h-screen items-center justify-center text-slate-950 transition-bg",
                transparent ? "bg-transparent" : "bg-zinc-50 dark:bg-zinc-950",
                className
            )}
            {...props}
        >
            {/* Deep Space Base Layers (Visible primarily in Dark Mode) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Top Left Violet/Blue Glow */}
                <div className="absolute -top-[30%] -left-[10%] w-[60%] h-[60%] rounded-full bg-violet-600/10 dark:bg-violet-900/20 blur-[100px] animate-pulse-slow" />

                {/* Bottom Right Orange/Red Glow (DivyaVaani Brand Colors) */}
                <div className="absolute -bottom-[30%] -right-[10%] w-[60%] h-[60%] rounded-full bg-orange-600/10 dark:bg-orange-900/20 blur-[100px] animate-pulse-slow delay-1000" />

                {/* Center Subtle Blue Depth */}
                <div className="absolute top-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-blue-500/5 dark:bg-blue-900/10 blur-[120px]" />
            </div>

            {/* Aurora Effect Layer */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    className={cn(
                        `
            [--white-gradient:repeating-linear-gradient(100deg,var(--white)_0%,var(--white)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--white)_16%)]
            [--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)]
            
            /* Enhanced Premium Aurora Gradient */
            [--aurora-premium:repeating-linear-gradient(100deg,#f97316_10%,#9333ea_15%,#ec4899_20%,#eab308_25%,#3b82f6_30%)] 
            
            [background-image:var(--white-gradient),var(--aurora-premium)]
            dark:[background-image:var(--dark-gradient),var(--aurora-premium)]
            [background-size:300%,_200%]
            [background-position:50%_50%,50%_50%]
            filter blur-[10px] invert dark:invert-0
            after:content-[""] after:absolute after:inset-0 after:[background-image:var(--white-gradient),var(--aurora-premium)] 
            after:dark:[background-image:var(--dark-gradient),var(--aurora-premium)]
            after:[background-size:200%,_100%] 
            after:animate-aurora after:[background-attachment:fixed] after:mix-blend-difference
            pointer-events-none
            absolute -inset-[10px] opacity-40 will-change-transform`,

                        showRadialGradient &&
                        `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]`
                    )}
                ></div>
            </div>

            {/* Star Field Texture (Procedural Dots) */}
            <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-screen"
                style={{
                    backgroundImage: 'radial-gradient(1px 1px at 20px 30px, currentColor, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 100px 70px, currentColor, rgba(0,0,0,0)), radial-gradient(1px 1px at 150px 160px, currentColor, rgba(0,0,0,0)), radial-gradient(2px 2px at 200px 50px, currentColor, rgba(0,0,0,0))',
                    backgroundSize: '250px 250px',
                    color: 'var(--foreground)' // Adaptive color
                }}
            />

            {/* Shooting Stars */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <ShootingStar top={20} left={43} />
                <ShootingStar delay={2500} top={8} left={4} />
                <ShootingStar delay={4500} top={25} left={26} />
                <ShootingStar delay={7000} top={34} left={47} />
            </div>

            {children}
        </div>
    );
};
