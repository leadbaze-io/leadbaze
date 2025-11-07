import { lazy, Suspense } from 'react'
import { AnimatedBeam } from '../magicui/animated-beam'

// Lazy load do carousel para não bloquear renderização inicial
const Slider = lazy(() => import('react-slick').then(module => ({ default: module.default })))

// CSS do carousel também lazy
if (typeof window !== 'undefined') {
  import("slick-carousel/slick/slick.css")
  import("slick-carousel/slick/slick-theme.css")
}

export default function MobileBenefits() {
  // Depoimentos de empresas B2B fictícias com fotos
  const testimonials = [
    {
      company: "TechCorp Solutions",
      name: "Carlos Mendes",
      position: "Diretor de Vendas",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      quote: "A LeadBaze revolucionou nossa estratégia de prospecção. Em apenas 3 semanas, conseguimos qualificar mais de 500 leads de alta qualidade.",
      rating: 5,
      achievement: "+500 leads em 3 semanas"
    },
    {
      company: "DataFlow Analytics",
      name: "Ana Silva",
      position: "Head de Growth",
      photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
      quote: "A precisão dos dados e a facilidade de uso nos permitiu aumentar nossa taxa de conversão em 40% no primeiro mês.",
      rating: 5,
      achievement: "+40% conversão"
    },
    {
      company: "InnovateLab",
      name: "Roberto Santos",
      position: "CEO",
      photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      quote: "Como startup, precisávamos de uma solução eficiente e escalável. A LeadBaze superou todas as nossas expectativas.",
      rating: 5,
      achievement: "Escalabilidade total"
    },
    {
      company: "FutureTech Systems",
      name: "Mariana Costa",
      position: "VP de Marketing",
      photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      quote: "A integração com WhatsApp e a qualidade dos contatos nos permitiu reduzir o tempo de qualificação de leads em 60%.",
      rating: 5,
      achievement: "-60% tempo qualificação"
    },
    {
      company: "SmartSolutions",
      name: "Pedro Almeida",
      position: "Diretor Comercial",
      photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      quote: "Em 6 meses, nossa equipe de vendas dobrou a produtividade graças aos leads qualificados da LeadBaze.",
      rating: 5,
      achievement: "2x produtividade"
    },
    {
      company: "DigitalCore",
      name: "Fernanda Lima",
      position: "CTO",
      photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
      quote: "A arquitetura escalável da LeadBaze nos permitiu processar milhões de leads sem comprometer a performance.",
      rating: 5,
      achievement: "Milhões de leads"
    },
    {
      company: "CloudTech",
      name: "Ricardo Oliveira",
      position: "VP de Vendas",
      photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
      quote: "Nossa equipe de vendas triplicou a eficiência graças aos leads qualificados e segmentados da LeadBaze.",
      rating: 5,
      achievement: "3x eficiência"
    },
    {
      company: "NextGen Solutions",
      name: "Camila Rodrigues",
      position: "Diretora de Marketing",
      photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      quote: "A segmentação inteligente dos leads nos permitiu criar campanhas muito mais direcionadas e eficazes.",
      rating: 5,
      achievement: "Campanhas eficazes"
    },
    {
      company: "TechFlow Systems",
      name: "Juliana Ferreira",
      position: "Diretora de Vendas",
      photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
      quote: "A LeadBaze transformou completamente nossa abordagem de prospecção. Resultados incríveis em tempo recorde.",
      rating: 5,
      achievement: "Resultados recorde"
    },
    {
      company: "DataSync Corp",
      name: "Lucas Martins",
      position: "Head de Growth",
      photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face",
      quote: "A qualidade dos dados e a facilidade de integração nos permitiram escalar rapidamente nossa operação de vendas.",
      rating: 5,
      achievement: "Escala rápida"
    },
    {
      company: "InnovateHub",
      name: "Patricia Santos",
      position: "VP Comercial",
      photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
      quote: "Com a LeadBaze, conseguimos reduzir drasticamente o tempo de qualificação e aumentar nossa taxa de conversão.",
      rating: 5,
      achievement: "Conversão otimizada"
    },
    {
      company: "FutureCore",
      name: "André Costa",
      position: "Diretor de Marketing",
      photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      quote: "A precisão dos leads e a segmentação inteligente nos permitiram criar campanhas muito mais eficazes e direcionadas.",
      rating: 5,
      achievement: "Campanhas direcionadas"
    }
  ]

  const settings = {
    dots: false,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    fade: true,
    cssEase: "ease-in-out",
    arrows: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: true
        }
      }
    ]
  }

  return (
    <section className="md:hidden py-16 bg-white overflow-hidden hidden">
      <div className="relative max-w-md mx-auto px-4">
        {/* Header */}
        <AnimatedBeam delay={0.2}>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Líderes de Vendas confiam na <span className="bg-gradient-to-r from-green-500 via-green-400 to-green-600 bg-clip-text text-transparent font-extrabold" style={{WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>LeadBaze</span>!
            </h2>
          </div>
        </AnimatedBeam>

        {/* Carousel - Lazy loaded */}
        <AnimatedBeam delay={0.4}>
          <div className="testimonial-swiper">
            <Suspense fallback={<div className="min-h-[400px] flex items-center justify-center">Carregando...</div>}>
              <Slider {...settings}>
                {testimonials.map((testimonial, index) => (
                <div key={index} className="px-2">
                  <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500" style={{minHeight: '350px', maxHeight: '350px'}}>
                    {/* Conteúdo */}
                    <div className="p-6 relative">
                      {/* Foto do Empresário */}
                      <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-full border-4 border-white shadow-lg overflow-hidden">
                          <img
                            src={testimonial.photo}
                            alt={testimonial.name}
                            width={64}
                            height={64}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Informações */}
                      <div className="text-center mb-4">
                        <h4 className="text-lg font-bold text-gray-900 mb-1">
                          {testimonial.name}
                        </h4>
                        <p className="text-sm bg-gradient-to-r from-green-500 via-green-400 to-green-600 bg-clip-text text-transparent font-semibold mb-1" style={{WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                          {testimonial.position}
                        </p>
                        <p className="text-xs text-gray-600 font-medium">
                          {testimonial.company}
                        </p>
                      </div>

                      {/* Quote */}
                      <blockquote className="text-sm text-gray-700 leading-relaxed italic mb-6 text-center min-h-[100px] flex items-center justify-center">
                        "{testimonial.quote}"
                      </blockquote>

                      {/* Rating */}
                      <div className="flex justify-center space-x-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <div key={i} className="w-4 h-4 text-yellow-400">
                            ★
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              </Slider>
            </Suspense>
          </div>
        </AnimatedBeam>
      </div>

      <style>{`
        .testimonial-swiper {
          padding: 0 20px;
        }
        
        .testimonial-swiper .slick-prev,
        .testimonial-swiper .slick-next {
          width: 40px;
          height: 40px;
          background: transparent;
          border: none;
          z-index: 10;
          transition: all 0.3s ease;
        }
        
        .testimonial-swiper .slick-prev:hover,
        .testimonial-swiper .slick-next:hover {
          transform: scale(1.1);
        }
        
        .testimonial-swiper .slick-prev {
          left: -30px;
        }
        
        .testimonial-swiper .slick-next {
          right: -30px;
        }
        
        .testimonial-swiper .slick-prev:before,
        .testimonial-swiper .slick-next:before {
          content: '';
          font-size: 24px;
          font-weight: bold;
          color: #10b981;
        }
        
        .testimonial-swiper .slick-prev:before {
          content: '←';
        }
        
        .testimonial-swiper .slick-next:before {
          content: '→';
        }
        
        @media (max-width: 640px) {
          .testimonial-swiper .slick-prev,
          .testimonial-swiper .slick-next {
            width: 32px;
            height: 32px;
          }
          
          .testimonial-swiper .slick-prev {
            left: -25px;
          }
          
          .testimonial-swiper .slick-next {
            right: -25px;
          }
        }
      `}</style>
    </section>
  )
}