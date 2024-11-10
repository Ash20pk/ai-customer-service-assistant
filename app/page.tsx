'use client';

import Link from 'next/link';
import { Bot, Clock, Code, ArrowRight } from 'lucide-react';
import Navbar from './components/Navbar';


export default function Home() {

  const features = [
    {
      icon: <Bot className="w-6 h-6" />,
      title: "One-Time Learning",
      description: "Initial setup allows for comprehensive data input, creating a knowledge base tailored to your business.",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "24/7 Availability",
      description: "Provide instant support to your customers around the clock with our AI assistant.",
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: "Seamless Integration",
      description: "Easy to integrate with any website using our simple embed code.",
    },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-64px)]">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative z-10 text-center">
              <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                Elevate Your Customer Service
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
                AI-powered assistant that learns and adapts to your business needs. Provide instant, accurate support to your customers 24/7.
              </p>
              <div className="mt-10 flex items-center justify-center gap-6">
                <Link 
                  href="/dashboard" 
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-black rounded-full hover:bg-gray-800 transition-colors"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-gray-200 to-gray-400 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                Powerful Features
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Everything you need to provide exceptional customer support
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="relative p-8 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-2 w-12 h-12 bg-gray-50 rounded-xl mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                Ready to transform your customer support?
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Get started with AI Chat today and see the difference.
              </p>
              <Link 
                href="/dashboard"
                className="mt-8 inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-black rounded-full hover:bg-gray-800 transition-colors"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}