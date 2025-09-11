"use client";

import { motion } from "framer-motion";

function FloatingPaths({ position }: { position: number }) {
    const paths = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
            380 - i * 5 * position
        } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
            152 - i * 5 * position
        } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
            684 - i * 5 * position
        } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
        width: 0.5 + i * 0.03,
    }));

    return (
        <div className="absolute inset-0 pointer-events-none">
            <svg
                className="w-full h-full text-medical-500/30 dark:text-medical-400/40"
                viewBox="0 0 696 316"
                fill="none"
                preserveAspectRatio="xMidYMid slice"
            >
                <title>Medical Background Paths</title>
                {paths.map((path) => (
                    <motion.path
                        key={path.id}
                        d={path.d}
                        stroke="currentColor"
                        strokeWidth={path.width}
                        strokeOpacity={0.1 + path.id * 0.02}
                        initial={{ pathLength: 0.2, opacity: 0.3 }}
                        animate={{
                            pathLength: 1,
                            opacity: [0.2, 0.6, 0.2],
                            pathOffset: [0, 1, 0],
                        }}
                        transition={{
                            duration: 20 + Math.random() * 15,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                        }}
                    />
                ))}
            </svg>
        </div>
    );
}

export function AppBackgroundPaths({ children }: { children?: React.ReactNode }) {
    return (
        <div className="relative w-full min-h-screen bg-gradient-to-br from-medical-50 via-white to-medical-100">
            {/* Animated background paths */}
            <div className="absolute inset-0 overflow-hidden">
                <FloatingPaths position={1} />
                <FloatingPaths position={-0.7} />
                <FloatingPaths position={0.3} />
            </div>

            {/* Additional visible decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-medical-500/15 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-medical-600/15 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-medical-400/10 rounded-full blur-2xl animate-bounce"></div>
                <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-medical-300/10 rounded-full blur-2xl animate-bounce"></div>
            </div>

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}