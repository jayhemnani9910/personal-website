import { ChevronRight } from "lucide-react";

export function PipelineStage({
    icon: Icon, label, sublabel, delay, isActive
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string; sublabel: string; delay: number; isActive: boolean;
}) {
    return (
        <div className="flex flex-col items-center group" style={{ animation: `fadeSlideUp 0.5s ease-out ${delay}ms both` }}>
            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center border-2 transition-all duration-300
                ${isActive ? 'bg-[var(--accent)] border-[var(--accent)] text-white scale-110' : 'bg-[var(--bg-secondary)] border-[var(--border)] text-[var(--text-muted)] group-hover:border-[var(--accent)]'}`}>
                <Icon className="w-7 h-7 md:w-8 md:h-8" />
            </div>
            <span className="mt-3 text-sm font-medium text-[var(--text-primary)]">{label}</span>
            <span className="text-xs text-[var(--text-muted)]">{sublabel}</span>
        </div>
    );
}

export function PipelineArrow({ delay }: { delay: number }) {
    return (
        <div className="flex-shrink-0 hidden md:flex items-center px-2" style={{ animation: `fadeIn 0.3s ease-out ${delay}ms both` }}>
            <div className="w-8 h-0.5 bg-[var(--border)] relative overflow-hidden">
                <div className="absolute inset-0 bg-[var(--accent)]" style={{ animation: `slideRight 1.5s ease-in-out infinite`, animationDelay: `${delay}ms` }} />
            </div>
            <ChevronRight className="w-4 h-4 text-[var(--text-muted)] -ml-1" />
        </div>
    );
}
