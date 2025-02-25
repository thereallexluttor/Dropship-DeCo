"use client"

import Image from "next/image"
import Link from "next/link"
import { ShoppingBag, Search, Menu } from "lucide-react"
import { useState, useRef, useEffect } from "react"

export default function Home() {
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const categories = [
    {
      name: "HOMBRE",
      items: ["Nike", "Adidas", "Puma", "Under Armour"],
    },
    {
      name: "MUJER",
      items: ["Zara", "H&M", "Mango", "Bershka"],
    },
    {
      name: "ACCESORIOS PARA HOMBRE",
      items: ["Relojes", "Cinturones", "Corbatas", "Carteras"],
    },
    {
      name: "ACCESORIOS PARA MUJER",
      items: ["Bolsos", "Joyería", "Bufandas", "Sombreros"],
    },
  ]

  const handleMouseEnter = (index: number) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setActiveDropdown(index)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null)
    }, 200) // 300ms delay before closing
  }
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed w-full bg-white z-10 transition-colors duration-300 ease-in-out hover:bg-black group">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-2xl font-bold text-black transition-colors duration-300 ease-in-out group-hover:text-white"
        >
      <img 
      src="/DEU_Berlin_COA.svg.png" 
      alt="Berlin Coat of Arms" 
      className="h-9 w-auto" 
    />
  Berlin Market
      </Link>
          <nav className="hidden md:flex space-x-6">
            {categories.map((category, index) => (
              <div
                key={index}
                className="relative group/item"
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
              >
                <button className="text-black text-sm font-bold transition-colors duration-300 ease-in-out group-hover:text-white hover:text-gold focus:outline-none">
                  {category.name}
                </button>
                <div
                  className={`absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 transition-all duration-300 ease-in-out ${
                    activeDropdown === index
                      ? "opacity-100 translate-y-0 visible"
                      : "opacity-0 -translate-y-2 invisible"
                  }`}
                >
                  <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                    {category.items.map((item, itemIndex) => (
                      <a
                        key={itemIndex}
                        href="#"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
                        role="menuitem"
                      >
                        {item}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </nav>
          <div className="flex items-center space-x-4">
            <Search className="h-6 w-6 text-black transition-colors duration-300 ease-in-out group-hover:text-white cursor-pointer" />
            <ShoppingBag className="h-6 w-6 text-black transition-colors duration-300 ease-in-out group-hover:text-white cursor-pointer" />
            <Menu className="h-6 w-6 text-black transition-colors duration-300 ease-in-out group-hover:text-white cursor-pointer md:hidden" />
          </div>
        </div>
      </header>

      <main>
        <section className="relative h-screen">
          <Image
            src="/placeholder.svg?height=1080&width=1920"
            alt="Luxury sportswear"
            layout="fill"
            objectFit="cover"
            priority
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-center px-4">
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">Elevate Your Style</h1>
              <p className="text-lg md:text-xl text-white mb-6">Luxury sportswear for the modern you</p>
              <Link
                href="#"
                className="bg-gold text-black px-6 py-2 text-lg font-semibold hover:bg-opacity-90 transition-colors"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Featured Products</h2>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-4 md:gap-8">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="bg-white shadow-lg">
                  <Image
                    src={`/placeholder.svg?height=400&width=400`}
                    alt={`Product ${item}`}
                    width={400}
                    height={400}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">Luxury Item {item}</h3>
                    <p className="text-gray-600 mb-4">€299.99</p>
                    <button className="w-full bg-black text-white py-2 hover:bg-opacity-90 transition-colors">
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <Image
                src="/placeholder.svg?height=600&width=600"
                alt="About Berlin Market"
                width={600}
                height={600}
                className="rounded-lg shadow-lg"
              />
            </div>
            <div className="md:w-1/2 md:pl-12">
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <p className="text-gray-700 mb-6">
                Berlin Market was born from a passion for combining luxury with performance. Our curated collection of
                sportswear and accessories embodies the spirit of Berlin - bold, innovative, and always ahead of the
                curve.
              </p>
              <Link
                href="#"
                className="inline-block bg-black text-white px-6 py-3 font-semibold hover:bg-opacity-90 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-black text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Shop</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="hover:text-gold transition-colors">
                    Men
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-gold transition-colors">
                    Women
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-gold transition-colors">
                    Accessories
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-gold transition-colors">
                    New Arrivals
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">About</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="hover:text-gold transition-colors">
                    Our Story
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-gold transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-gold transition-colors">
                    Press
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-gold transition-colors">
                    Sustainability
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Customer Care</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="hover:text-gold transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-gold transition-colors">
                    Shipping & Returns
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-gold transition-colors">
                    Size Guide
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-gold transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Connect</h3>
              <div className="flex space-x-4">
                <Link href="#" className="text-white hover:text-gold transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
                <Link href="#" className="text-white hover:text-gold transition-colors">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
                <Link href="#" className="text-white hover:text-gold transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-800 pt-8 flex justify-between items-center">
            <p className="text-sm">&copy; 2023 Berlin Market. All rights reserved.</p>
            <div className="flex space-x-6">
              <Link href="#" className="text-sm hover:text-gold transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-sm hover:text-gold transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

