"use client";

import React from "react";
import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { StarsBackground } from "@/components/ui/stars-background";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { cn } from "@/lib/utils";

export const BackgroundController = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <AuroraBackground className={cn("fixed inset-0", className)}>
            <StarsBackground
                starDensity={0.0001}
                allStarsTwinkle={true}
                twinkleProbability={0.7}
                minTwinkleSpeed={1}
                maxTwinkleSpeed={3}
                className="z-0 pointer-events-none opacity-50"
            />
            <ShootingStars
                starColor="#fbbf24"
                trailColor="#a855f7"
                minSpeed={10}
                maxSpeed={25}
                minDelay={5000}
                maxDelay={15000}
                className="z-0 pointer-events-none opacity-40"
            />
            <div className="relative z-10 w-full h-full overflow-y-auto overflow-x-hidden">
                {children}
            </div>
        </AuroraBackground>
    );
};
