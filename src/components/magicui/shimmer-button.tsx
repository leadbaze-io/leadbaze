import { cn } from "../../lib/utils"

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
  shimmerColor?: string
  borderRadius?: string
  shimmerDuration?: string
  background?: string
  hoverBackground?: string
}

export function ShimmerButton({
  children,
  className,
  shimmerColor = "#ffffff",
  borderRadius = "0.5rem",
  shimmerDuration = "3s",
  background = "linear-gradient(45deg, #3b82f6, #8b5cf6)",
  hoverBackground = "linear-gradient(45deg, #2563eb, #7c3aed)",
  ...props
}: ShimmerButtonProps) {
  return (
    <button
      className={cn(
        "group relative inline-flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border-none px-6 py-3 text-white [text-decoration:none] transition-transform hover:scale-105 active:scale-95",
        className,
      )}
      style={{
        background,
        borderRadius,
        transition: "background 0.3s ease, transform 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = hoverBackground
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = background
      }}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2 font-medium">
        {children}
      </span>

      <div
        className="absolute inset-0 -top-[20px] flex h-[calc(100%+40px)] w-full justify-center blur-[12px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)`,
          animation: `shimmer ${shimmerDuration} infinite`,
          transform: "translateX(-100%)",
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