"use client"

import { useState } from "react"
import Layout from "./components/Layout"
import Hero from "./components/Hero"
import FeaturedCollections from "./components/FeaturedCollections"
import Testimonials from "./components/Testimonials"
import Newsletter from "./components/Newsletter"
import { categories } from "./data/categories"

export default function Home() {
  return (
    <Layout categories={categories}>
      <Hero />
      <FeaturedCollections />
      <Testimonials />
      <Newsletter />
    </Layout>
  )
}