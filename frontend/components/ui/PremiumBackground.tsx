"use client";
import React from "react";
import { cn } from "@/lib/utils";

export const PremiumBackground = ({
    children,
    className,
}: {
    children?: React.ReactNode;
    className?: string;
}) => {
    return (
        <div
            className={cn(
                "min-h-screen flex flex-col items-center justify-center bg-zinc-950 w-full overflow-hidden relative",
                className
            )}
        >
            {/* Deep Space Gradients - Base Layer */}
            <div className="absolute inset-0 bg-neutral-950">
                <div className="absolute inset-0 bg-gradient-to-tr from-violet-950/20 via-neutral-950 to-orange-950/20" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-neutral-950/0 to-transparent" />
            </div>

            {/* Animated Orbs/Glows */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-orange-600/10 blur-[120px] animate-pulse-slow" />
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px] animate-pulse-slow delay-75" />
                <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[40%] rounded-full bg-red-600/10 blur-[120px] animate-pulse-slow delay-150" />
            </div>

            {/* Shooting Stars Logic */}
            <div className="absolute inset-0 overflow-hidden">
                <ShootingStar />
                <ShootingStar delay={2000} />
                <ShootingStar delay={4000} />
                <ShootingStar delay={6500} />
            </div>

            {/* Static Stars / Dust */}
            <div className="absolute inset-0 bg-[url('/images/stars-texture.png')] opacity-20 bg-repeat mix-blend-screen"
                style={{ backgroundImage: 'radial-gradient(1px 1px at 20px 30px, #eee, rgba(0,0,0,0)), radial-gradient(1px 1px at 40px 70px, #fff, rgba(0,0,0,0)), radial-gradient(1px 1px at 50px 160px, #ddd, rgba(0,0,0,0)), radial-gradient(1px 1px at 90px 40px, #fff, rgba(0,0,0,0)), radial-gradient(1px 1px at 130px 80px, #fff, rgba(0,0,0,0)), radial-gradient(1px 1px at 160px 120px, #ddd, rgba(0,0,0,0))', backgroundSize: '200px 200px' }}
            />

            {/* Content */}
            <div className="relative z-10 w-full flex-1 flex flex-col">
                {children}
            </div>
        </div>
    );
};

const ShootingStar = ({ delay = 0 }: { delay?: number }) => {
    return (
        <span
            className="absolute h-0.5 w-[100px] bg-gradient-to-r from-transparent via-white to-transparent rotate-[215deg] animate-shooting-star"
            style={{
                top: `${Math.random() * 50}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${delay}ms`,
            }}
        />
    );
};
