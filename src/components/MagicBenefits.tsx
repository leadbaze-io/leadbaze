import Slider from 'react-slick'
import { AnimatedBeam } from './magicui/animated-beam'
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"

export default function MagicBenefits() {
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
      company: "CloudTech Brasil",
      name: "Rafael Oliveira",
      position: "Diretor de Vendas",
      photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
      quote: "A LeadBaze transformou completamente nosso processo de vendas. ROI de 8x no primeiro trimestre.",
      rating: 5,
      achievement: "ROI 8x"
    },
    {
      company: "StartupHub",
      name: "Juliana Ferreira",
      position: "CEO",
      photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
      quote: "Como aceleradora, recomendamos a LeadBaze para todas as startups do nosso portfólio. Resultados excepcionais.",
      rating: 5,
      achievement: "Recomendada 100%"
    },
    {
      company: "FintechMax",
      name: "André Santos",
      position: "Head de Marketing",
      photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
      quote: "A segmentação inteligente da LeadBaze nos permitiu atingir nosso público-alvo com precisão cirúrgica.",
      rating: 5,
      achievement: "Precisão cirúrgica"
    },
    {
      company: "E-commerce Plus",
      name: "Camila Rodrigues",
      position: "Diretora Comercial",
      photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      quote: "Nossa taxa de conversão aumentou 300% após implementar a LeadBaze. Ferramenta indispensável.",
      rating: 5,
      achievement: "+300% conversão"
    },
    {
      company: "AgroTech Solutions",
      name: "Marcos Pereira",
      position: "VP de Vendas",
      photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face",
      quote: "No setor agrícola, a LeadBaze nos conectou com os produtores certos. Parcerias estratégicas garantidas.",
      rating: 5,
      achievement: "Parcerias estratégicas"
    },
    {
      company: "HealthTech Innovation",
      name: "Dr. Patricia Lima",
      position: "Diretora Médica",
      photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
      quote: "A LeadBaze nos ajudou a expandir nossa rede de clínicas parceiras. Crescimento sustentável e qualificado.",
      rating: 5,
      achievement: "Rede expandida"
    }
  ]

  // Configurações do Slick
  const settings = {
    dots: false,
    infinite: true,
    speed: 600,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    cssEase: "ease-in-out",
    arrows: true,
    centerMode: false,
    variableWidth: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ]
  }
  return (
    <section className="relative py-20 md:py-32 bg-white overflow-hidden">

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimatedBeam delay={0.2}>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-8">
              Líderes de Vendas confiam na <span className="bg-gradient-to-r from-green-500 via-green-400 to-green-600 bg-clip-text text-transparent font-extrabold" style={{WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>LeadBaze</span>!
            </h2>
          </div>
        </AnimatedBeam>

        {/* Carrossel com React Slick */}
        <AnimatedBeam delay={0.4}>
          <div className="max-w-7xl mx-auto">
            <Slider {...settings}>
              {testimonials.map((testimonial, index) => (
                <div key={index} className="px-3">
                  <div className="bg-white rounded-2xl shadow-lg border overflow-hidden group hover:shadow-xl transition-all duration-300 h-full flex flex-col" 
                       style={{borderColor: '#00ff00', borderWidth: '2px'}}>
                    

                    {/* Conteúdo Compacto */}
                    <div className="p-6 relative flex-1 flex flex-col">
                      {/* Foto do Empresário */}
                      <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-full border-3 border-white shadow-lg overflow-hidden group-hover:scale-105 transition-transform duration-300">
                          <img
                            src={testimonial.photo}
                            alt={testimonial.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Informações do Executivo */}
                      <div className="text-center mb-4">
                        <h4 className="text-lg font-bold text-gray-900 mb-1">
                          {testimonial.name}
                        </h4>
                        <p className="text-sm font-semibold mb-1 bg-gradient-to-r from-green-500 via-green-400 to-green-600 bg-clip-text text-transparent" style={{WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                          {testimonial.position}
                        </p>
                        <p className="text-xs text-gray-600 font-medium mb-2">
                          {testimonial.company}
                        </p>
                      </div>

                      {/* Depoimento */}
                      <blockquote className="text-sm text-gray-700 leading-relaxed italic mb-6 text-center relative px-2 flex-1 min-h-[100px]">
                        <span className="text-2xl text-gray-300 absolute -top-2 -left-1 font-serif">"</span>
                        {testimonial.quote}
                        <span className="text-2xl text-gray-300 absolute -bottom-4 -right-1 font-serif">"</span>
                      </blockquote>

                      {/* Rating */}
                      <div className="flex justify-center space-x-1 mt-auto">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <div key={i} className="w-4 h-4 text-lg" style={{color: '#00ff00'}}>
                            ★
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Efeito de Hover Sutil */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl" style={{backgroundColor: '#00ff00'}}></div>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </AnimatedBeam>
      </div>

      {/* Estilos Customizados para Slick */}
      <style>{`
        .slick-slider {
          position: relative;
          display: block;
          box-sizing: border-box;
          user-select: none;
          touch-action: pan-y;
          -webkit-touch-callout: none;
          -khtml-user-select: none;
          -ms-touch-action: pan-y;
          -ms-user-select: none;
          -moz-user-select: none;
          -webkit-user-select: none;
        }
        
        .slick-list {
          position: relative;
          display: block;
          overflow: hidden;
          margin: 0;
          padding: 0;
        }
        
        .slick-track {
          position: relative;
          top: 0;
          left: 0;
          display: block;
        }
        
        .slick-slide {
          display: none;
          float: left;
          height: 100%;
          min-height: 1px;
        }
        
        .slick-slide.slick-active {
          display: block;
        }
        
        .slick-slide > div {
          height: 100%;
        }
        
        .slick-slide > div > div {
          height: 350px !important;
          min-height: 350px !important;
          max-height: 350px !important;
          display: flex !important;
          flex-direction: column !important;
        }
        
        .slick-slide blockquote {
          height: 80px !important;
          overflow: hidden !important;
          display: -webkit-box !important;
          -webkit-line-clamp: 3 !important;
          -webkit-box-orient: vertical !important;
        }
        
        
        .slick-prev,
        .slick-next {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          width: 40px;
          height: 40px;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #10b981;
          font-size: 0;
          line-height: 0;
        }
        
        .slick-prev:hover,
        .slick-next:hover {
          color: #059669;
          transform: translateY(-50%) scale(1.1);
        }
        
        .slick-prev {
          left: -50px;
        }
        
        .slick-next {
          right: -50px;
        }
        
        .slick-prev:before {
          content: '←';
          font-size: 24px;
          font-weight: bold;
          color: #10b981;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .slick-next:before {
          content: '→';
          font-size: 24px;
          font-weight: bold;
          color: #10b981;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        @media (max-width: 768px) {
          .slick-prev {
            left: -25px;
          }
          
          .slick-next {
            right: -25px;
          }
          
          .slick-prev,
          .slick-next {
            width: 28px;
            height: 28px;
          }
        }
      `}</style>
    </section>
  )
}