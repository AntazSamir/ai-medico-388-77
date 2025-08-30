import { motion } from "framer-motion";

function DebugFloatingPaths({ position }: { position: number }) {
    const paths = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        d: `M-${380 - i * 8 * position} -${189 + i * 8}C-${
            380 - i * 8 * position
        } -${189 + i * 8} -${312 - i * 8 * position} ${216 - i * 8} ${
            152 - i * 8 * position
        } ${343 - i * 8}C${616 - i * 8 * position} ${470 - i * 8} ${
            684 - i * 8 * position
        } ${875 - i * 8} ${684 - i * 8 * position} ${875 - i * 8}`,
        width: 1 + i * 0.1,
    }));

    return (
        <div className="absolute inset-0 pointer-events-none">
            <svg
                className="w-full h-full text-medical-500 dark:text-medical-400"
                viewBox="0 0 696 316"
                fill="none"
                preserveAspectRatio="xMidYMid slice"
            >
                <title>Debug Medical Background Paths</title>
                {paths.map((path) => (
                    <motion.path
                        key={path.id}
                        d={path.d}
                        stroke="currentColor"
                        strokeWidth={path.width}
                        strokeOpacity={0.3 + path.id * 0.05}
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{
                            pathLength: 1,
                            opacity: [0.3, 0.8, 0.3],
                            pathOffset: [0, 1, 0],
                        }}
                        transition={{
                            duration: 8 + Math.random() * 4,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                            delay: path.id * 0.2,
                        }}
                    />
                ))}
            </svg>
        </div>
    );
}

export function DebugBackgroundPaths({ children }: { children?: React.ReactNode }) {
    return (
        <div className="relative w-full min-h-screen bg-gradient-to-br from-medical-100 via-medical-200 to-medical-300">
            {/* Very visible animated background paths */}
            <div className="absolute inset-0 overflow-hidden">
                <DebugFloatingPaths position={1} />
                <DebugFloatingPaths position={-0.8} />
                <DebugFloatingPaths position={0.5} />
            </div>

            {/* Very visible decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 right-20 w-32 h-32 bg-medical-500/50 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute bottom-20 left-20 w-40 h-40 bg-medical-600/50 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-medical-400/60 rounded-full blur-lg animate-bounce"></div>
            </div>

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}