import '../styles/skeleton-loading.css'

interface LoadingScreenProps {
  message?: string
  fullScreen?: boolean
}

export default function LoadingScreen({
  message = "Carregando...",
  fullScreen = true
}: LoadingScreenProps) {
  const containerClass = fullScreen
    ? "fixed inset-0 backdrop-blur-sm z-50 transition-colors duration-300"
    : "w-full h-64 transition-colors duration-300"

  const bgStyle = fullScreen 
    ? {backgroundColor: 'rgba(255, 255, 255, 0.9)'}
    : {backgroundColor: '#ffffff'}

  return (
    <div className={`${containerClass} flex items-center justify-center`} style={bgStyle}>
      <style>{`
        @keyframes loadingFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes loadingSpinner {
          from { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.05); }
          to { transform: rotate(360deg) scale(1); }
        }
        @keyframes loadingProgress {
          0% { width: 0%; }
          50% { width: 100%; }
          100% { width: 0%; }
        }
        @keyframes loadingDot {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.3); opacity: 1; }
        }
        .loading-content {
          animation: loadingFadeIn 0.3s ease-out;
        }
        .loading-spinner {
          animation: loadingSpinner 2s linear infinite;
        }
        .loading-progress {
          animation: loadingProgress 1.5s ease-in-out infinite;
        }
        .loading-dot-0 { animation: loadingDot 1.2s ease-in-out infinite; }
        .loading-dot-1 { animation: loadingDot 1.2s ease-in-out infinite 0.2s; }
        .loading-dot-2 { animation: loadingDot 1.2s ease-in-out infinite 0.4s; }
      `}</style>
      <div className="text-center loading-content">
        {/* Spinner duplo para melhor visual */}
        <div className="mb-6 relative loading-spinner">
          <div className="w-12 h-12 border-2 rounded-full" style={{borderColor: '#b7c7c1'}}></div>
          <div className="w-12 h-12 border-2 border-transparent rounded-full absolute top-0 left-0 animate-spin" style={{borderTopColor: '#10b981'}}></div>
        </div>

        {/* Texto de carregamento */}
        <p className="font-medium text-lg" style={{color: '#2e4842', opacity: 0, animation: 'loadingFadeIn 0.3s ease-out 0.2s forwards'}}>
          {message}
        </p>

        {/* Barra de progresso animada */}
        <div
          className="mt-4 h-1 rounded-full loading-progress"
          style={{ 
            maxWidth: "200px", 
            margin: "16px auto 0",
            background: "linear-gradient(to right, #00ff00, #00cc00)"
          }}
        />

        {/* Pontos de loading */}
        <div className="flex justify-center space-x-2 mt-4">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full loading-dot-${index}`}
              style={{backgroundColor: '#00ff00'}}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Loading skeleton para listas
export function ListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="rounded-lg border p-6 transition-colors duration-300 opacity-0 animate-pulse"
          style={{
            backgroundColor: '#ffffff', 
            borderColor: '#b7c7c1',
            animationDelay: `${i * 0.1}s`,
            animationFillMode: 'forwards'
          }}
        >
          <div className="animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-2 flex-1">
                <div className="h-4 skeleton-loading-force rounded w-3/4"></div>
                <div className="h-3 skeleton-loading-force rounded w-1/2"></div>
              </div>
              <div className="h-8 skeleton-loading-force rounded w-16"></div>
            </div>
            <div className="space-y-2">
              <div className="h-3 skeleton-loading-force rounded w-full"></div>
              <div className="h-3 skeleton-loading-force rounded w-2/3"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Loading skeleton para cards de leads
export function LeadCardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(9)].map((_, i) => (
        <div
          key={i}
          className="rounded-lg border p-4 transition-colors duration-300 opacity-0 animate-pulse"
          style={{
            backgroundColor: '#ffffff', 
            borderColor: '#b7c7c1',
            animationDelay: `${i * 0.05}s`,
            animationFillMode: 'forwards'
          }}
        >
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-3">
              <div className="h-4 skeleton-loading-force rounded w-16"></div>
              <div className="h-4 skeleton-loading-force rounded w-12"></div>
            </div>
            <div className="space-y-2 mb-3">
              <div className="h-5 skeleton-loading-force rounded w-3/4"></div>
              <div className="h-3 skeleton-loading-force rounded w-full"></div>
            </div>
            <div className="space-y-2">
              <div className="h-3 skeleton-loading-force rounded w-2/3"></div>
              <div className="h-3 skeleton-loading-force rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Loading para gráficos/analytics
export function AnalyticsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="rounded-lg border p-6 transition-colors duration-300 opacity-0 animate-pulse"
          style={{
            backgroundColor: '#ffffff', 
            borderColor: '#b7c7c1',
            animationDelay: `${i * 0.1}s`,
            animationFillMode: 'forwards'
          }}
        >
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 skeleton-loading-force rounded w-1/2"></div>
              <div className="h-8 w-8 skeleton-loading-force rounded"></div>
            </div>
            <div className="h-8 skeleton-loading-force rounded w-3/4 mb-2"></div>
            <div className="h-3 skeleton-loading-force rounded w-1/3"></div>
          </div>
        </div>
      ))}
    </div>
  )
}
