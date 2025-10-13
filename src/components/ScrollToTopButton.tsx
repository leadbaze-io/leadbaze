import { useState, useEffect } from 'react'

import { motion, AnimatePresence } from 'framer-motion'

export default function ScrollToTopButton() {

  const [isVisible, setIsVisible] = useState(false)

  // Mostrar o botão quando o usuário rolar para baixo

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

  // Função para rolar para o topo

  const scrollToTop = () => {

    window.scrollTo({

      top: 0,

      behavior: 'smooth'

    })

  }

  return (

    <AnimatePresence>

      {isVisible && (

        <motion.button

          initial={{ opacity: 0, scale: 0.8, y: 20 }}

          animate={{ opacity: 1, scale: 1, y: 0 }}

          exit={{ opacity: 0, scale: 0.8, y: 20 }}

          transition={{

            type: "spring",

            stiffness: 300,

            damping: 30

          }}

          onClick={scrollToTop}

          className="inline-flex items-center justify-center font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-600 hover:to-emerald-700 focus:ring-green-500 px-3 text-sm fixed bottom-4 right-4 z-[9999] w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-xl border border-white/30 backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95"

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

        </motion.button>

      )}

    </AnimatePresence>

  )

}
