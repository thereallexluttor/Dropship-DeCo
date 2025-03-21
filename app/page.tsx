"use client"

import { useState } from "react"
import Layout from "./components/Layout"
import Hero from "./components/Hero"
import FeaturedCollections from "./components/FeaturedCollections"
import FeaturedProducts from "./components/FeaturedProducts"
import Testimonials from "./components/Testimonials"
import Newsletter from "./components/Newsletter"
import { categories } from "./data/categories"
import { CartProvider } from "./contexts/CartContext"

export default function Home() {
  return (
    <CartProvider>
      <Layout categories={categories}>
        <Hero />
        <FeaturedCollections />
        <FeaturedProducts />
        <Testimonials />
        <Newsletter />
      </Layout>
    </CartProvider>
  )
}