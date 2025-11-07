import { useState, useEffect } from 'react'

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <>
      <style>{`
        @keyframes scrollButtonFadeIn {
          from { opacity: 0; transform: scale(0.8) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes scrollButtonFadeOut {
          from { opacity: 1; transform: scale(1) translateY(0); }
          to { opacity: 0; transform: scale(0.8) translateY(20px); }
        }
        .scroll-button-enter {
          animation: scrollButtonFadeIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .scroll-button-exit {
          animation: scrollButtonFadeOut 0.3s ease-in forwards;
        }
      `}</style>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className={`inline-flex items-center justify-center font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-600 hover:to-emerald-700 focus:ring-green-500 px-3 text-sm fixed bottom-4 right-4 z-[9999] w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-xl border border-white/30 backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 scroll-button-enter`}
          aria-label="Voltar ao topo"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      )}
    </>
  )
}
