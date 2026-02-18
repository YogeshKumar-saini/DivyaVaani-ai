
"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface StarProps {
    x: number;
    y: number;
    radius: number;
    opacity: number;
    twinkleSpeed: number | null;
}

interface StarsBackgroundProps {
    starDensity?: number;
    allStarsTwinkle?: boolean;
    twinkleProbability?: number;
    minTwinkleSpeed?: number;
    maxTwinkleSpeed?: number;
    className?: string;
}

export const StarsBackground = ({
    starDensity = 0.00015,
    allStarsTwinkle = true,
    twinkleProbability = 0.7,
    minTwinkleSpeed = 0.5,
    maxTwinkleSpeed = 1,
    className,
}: StarsBackgroundProps) => {
    const [stars, setStars] = useState<StarProps[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    const generateStars = useCallback(
        (width: number, height: number): StarProps[] => {
            const area = width * height;
            const numStars = Math.floor(area * starDensity);
            return Array.from({ length: numStars }, () => {
                const shouldTwinkle =
                    allStarsTwinkle || Math.random() < twinkleProbability;
                return {
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: Math.random() * 0.05 + 0.5,
                    opacity: Math.random() * 0.5 + 0.5,
                    twinkleSpeed: shouldTwinkle
                        ? minTwinkleSpeed +
                        Math.random() * (maxTwinkleSpeed - minTwinkleSpeed)
                        : null,
                };
            });
        },
        [
            starDensity,
            allStarsTwinkle,
            twinkleProbability,
            minTwinkleSpeed,
            maxTwinkleSpeed,
        ]
    );

    useEffect(() => {
        const updateStars = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setStars(generateStars(width, height));
            }
        };

        updateStars();

        const resizeObserver = new ResizeObserver(updateStars);
        const container = containerRef.current;
        if (container) {
            resizeObserver.observe(container);
        }

        return () => {
            if (container) {
                resizeObserver.unobserve(container);
            }
        };
    }, [
        starDensity,
        allStarsTwinkle,
        twinkleProbability,
        minTwinkleSpeed,
        maxTwinkleSpeed,
        generateStars,
    ]);

    return (
        <div
            ref={containerRef}
            className={cn("h-full w-full absolute inset-0 text-white pointer-events-none z-0", className)}
        >
            <svg className="h-full w-full bg-transparent">
                {stars.map((star, index) => (
                    <circle
                        key={index}
                        cx={star.x}
                        cy={star.y}
                        r={star.radius}
                        className={cn(
                            "fill-current",
                            star.twinkleSpeed !== null && "animate-twinkle"
                        )}
                        style={{
                            opacity: star.opacity,
                            animationDuration: star.twinkleSpeed
                                ? `${star.twinkleSpeed}s`
                                : "0s",
                        }}
                    />
                ))}
            </svg>
        </div>
    );
};
