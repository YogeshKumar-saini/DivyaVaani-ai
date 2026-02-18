import { cn } from "@/lib/utils";
import { HTMLMotionProps, motion } from "framer-motion";

interface GlassCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    gradient?: "none" | "subtle" | "glow";
    hoverEffect?: boolean;
}

export function GlassCard({
    children,
    className,
    gradient = "subtle",
    hoverEffect = false,
    ...props
}: GlassCardProps) {
    return (
        <motion.div
            className={cn(
                "relative overflow-hidden rounded-3xl border border-white/5 bg-black/20 backdrop-blur-3xl",
                hoverEffect && "transition-all duration-300 hover:bg-black/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:border-white/10",
                className
            )}
            {...props}
        >
            {/* Graduate Overlays */}
            {gradient === "subtle" && (
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none opacity-50" />
            )}
            {gradient === "glow" && (
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-cyan-500/10 pointer-events-none" />
            )}

            {/* Noise Texture (Optional, adds realism) */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-noise" />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
}
