import React from 'react'
import { ArrowRight, Code, Users, Calendar } from 'lucide-react'

export default function AboutSection() {
  return (
    <section className="bg-gradient-to-b from-blue-100 to-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-extrabold text-blue-800 mb-8 text-center">
          About Elev8
        </h2>
        
        <p className="text-xl text-gray-700 mb-12 text-center">
          At Elev8, we specialize in transforming coding events into exceptional experiences. Our Event Management Platform is designed to streamline every step, from registration to execution, ensuring a seamless and engaging experience for all participants.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <FeatureCard 
            icon={<Code className="w-8 h-8 text-blue-600" />}
            title="Tailored for Coders"
            description="Our platform is built with the unique needs of coding events in mind, from hackathons to workshops."
          />
          <FeatureCard 
            icon={<Users className="w-8 h-8 text-blue-600" />}
            title="Seamless Collaboration"
            description="Foster teamwork and networking with our integrated collaboration tools."
          />
          <FeatureCard 
            icon={<Calendar className="w-8 h-8 text-blue-600" />}
            title="End-to-End Management"
            description="From registration to post-event surveys, we've got every aspect covered."
          />
        </div>
        
        <div className="text-center">
          <a 
            href="/" 
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-purple-700 transition duration-150 ease-in-out"
          >
            Explore Our Platform
            <ArrowRight className="ml-2 w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">{title}</h3>
      <p className="text-gray-600 text-center">{description}</p>
    </div>
  )
}