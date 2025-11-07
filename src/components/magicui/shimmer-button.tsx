import { cn } from "../../lib/utils"

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
  shimmerColor?: string
  borderRadius?: string
  shimmerDuration?: string
  background?: string
  hoverBackground?: string
  textColor?: string
}

export function ShimmerButton({
  children,
  className,
  shimmerColor = "#00ff00",
  borderRadius = "0.75rem",
  shimmerDuration = "3s",
  background = "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  hoverBackground = "linear-gradient(135deg, #059669 0%, #047857 100%)",
  textColor = "#ffffff",
  ...props
}: ShimmerButtonProps) {
  return (
    <button
      className={cn(
        "group relative inline-flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border-none px-6 py-3 [text-decoration:none] transition-transform hover:scale-105 active:scale-95 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-semibold",
        className,
      )}
      style={{
        borderRadius,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        fontWeight: "700",
        boxShadow: "none",
        border: "none",
      }}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2 font-medium">
        {children}
      </span>

      <div
        className="absolute inset-0 -top-[20px] flex h-[calc(100%+40px)] w-full justify-center blur-[8px]"
        style={{
          background: `linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)`,
          animation: `shimmer ${shimmerDuration} infinite`,
          transform: "translateX(-100%)",
          pointerEvents: "none", // Garantir que não intercepta cliques
        }}
      />

      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </button>
  )
}