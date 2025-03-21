"use client"

import { useState, useEffect } from "react"

export default function Newsletter() {
  const [email, setEmail] = useState("")
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement newsletter subscription
    console.log("Subscribing email:", email)
    setEmail("")
  }

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 overflow-hidden">
            <div 
              className="relative mb-3 inline-block"
              style={{
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                opacity: isVisible ? 1 : 0,
                transition: 'transform 0.7s ease-out, opacity 0.7s ease-out'
              }}
            >
              <span className="inline-block py-1 px-3 text-xs tracking-widest uppercase text-[#8B5A2B] font-medium bg-[#F9F5EC] rounded-sm">
                Newsletter
              </span>
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[120%] h-[2px] bg-gradient-to-r from-transparent via-[#8B5A2B] to-transparent opacity-30"></span>
            </div>
            
            <h2 
              className="text-2xl md:text-3xl font-sans text-[#1A1A1A] relative inline-block"
              style={{
                transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                opacity: isVisible ? 1 : 0,
                transition: 'transform 0.8s ease-out 0.2s, opacity 0.8s ease-out 0.2s'
              }}
            >
              <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-[#8B5A2B] to-[#D7B377]">Mantente Informado</span>
              <span 
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-[2px] w-24 bg-gradient-to-r from-[#8B5A2B] to-[#D7B377]"
                style={{
                  transform: isVisible ? 'scaleX(1)' : 'scaleX(0)',
                  transition: 'transform 1s ease-out 0.5s',
                  transformOrigin: 'center'
                }}
              ></span>
            </h2>
            <p 
              className="mt-6 text-gray-600 max-w-2xl mx-auto"
              style={{
                transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                opacity: isVisible ? 1 : 0,
                transition: 'transform 0.8s ease-out 0.3s, opacity 0.8s ease-out 0.3s'
              }}
            >
              Suscríbete para recibir las últimas novedades, colecciones exclusivas y ofertas especiales directamente en tu correo.
            </p>
          </div>

          <div 
            className="max-w-md mx-auto"
            style={{
              transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
              opacity: isVisible ? 1 : 0,
              transition: 'transform 0.9s ease-out 0.4s, opacity 0.9s ease-out 0.4s'
            }}
          >
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Tu correo electrónico"
                className="flex-1 px-6 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#8B5A2B] transition-colors duration-200"
                required
              />
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-[#8B5A2B] to-[#D7B377] text-white rounded-lg hover:opacity-90 transition-all duration-300 hover:shadow-md"
              >
                Suscribirse
              </button>
            </form>
            <p className="text-xs text-gray-500 text-center mt-4">
              Al suscribirte, aceptas recibir correos de marketing. Puedes darte de baja en cualquier momento.
            </p>
          </div>

          {/* Social Media Links */}
          <div 
            className="mt-16 text-center"
            style={{
              transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
              opacity: isVisible ? 1 : 0,
              transition: 'transform 0.9s ease-out 0.5s, opacity 0.9s ease-out 0.5s'
            }}
          >
            <span className="inline-block mb-2 py-1 px-3 text-xs tracking-widest uppercase text-[#8B5A2B] font-medium bg-[#F9F5EC] rounded-sm">Síguenos</span>
            <div className="flex justify-center gap-6 mt-4">
              <a 
                href="#" 
                className="text-gray-400 hover:text-[#8B5A2B] transition-colors duration-200 hover:scale-110 transform"
                style={{ transition: 'transform 0.3s ease-out, color 0.3s ease-out' }}
              >
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-[#8B5A2B] transition-colors duration-200 hover:scale-110 transform"
                style={{ transition: 'transform 0.3s ease-out, color 0.3s ease-out' }}
              >
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-[#8B5A2B] transition-colors duration-200 hover:scale-110 transform"
                style={{ transition: 'transform 0.3s ease-out, color 0.3s ease-out' }}
              >
                <span className="sr-only">Pinterest</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.552-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 