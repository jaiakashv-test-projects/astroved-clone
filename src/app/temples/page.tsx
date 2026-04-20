"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";

interface Temple {
  _id: string;
  name: string;
  location: string;
  description: string;
  imageUrl: string;
  deity: string;
  history: string;
}

export default function TemplesPage() {
  const [items, setItems] = useState<Temple[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/temples")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#fcf9f2] py-12">
        <div className="mx-auto max-w-6xl px-6">
          <h1 className="text-4xl font-extrabold text-[#2c1c4e] text-center mb-4">
            Sacred Temples
          </h1>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Explore the spiritual heritage and history of India's most powerful shrines.
          </p>

          {loading ? (
             <div className="flex justify-center py-20">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-12 w-12 bg-purple-200 rounded-full mb-4"></div>
                  <div className="h-4 w-48 bg-purple-100 rounded"></div>
                </div>
             </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20">
               <div className="text-6xl mb-4">🕉️</div>
               <p className="text-gray-500 text-lg">We are currently cataloging more sacred temples. Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-12">
              {items.map((item, index) => (
                <div key={item._id} className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 items-center bg-white rounded-3xl overflow-hidden shadow-sm border border-orange-100 p-6 md:p-8`}>
                  <div className="w-full md:w-1/2 h-80 rounded-2xl overflow-hidden shadow-lg">
                    <img 
                      src={item.imageUrl || "https://images.unsplash.com/photo-1519280459341-33758079543e?auto=format&fit=crop&w=800&q=80"} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-full md:w-1/2 space-y-4">
                    <div className="inline-block px-4 py-1 bg-orange-50 text-orange-600 rounded-full text-sm font-bold">
                       {item.location}
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">{item.name}</h2>
                    <div className="text-purple-700 font-medium">Deity: {item.deity}</div>
                    <p className="text-gray-600 leading-relaxed text-lg">{item.description}</p>
                    {item.history && (
                        <div className="pt-4 border-t border-gray-100">
                           <h4 className="font-bold text-gray-800 mb-2">Heritage & Significance</h4>
                           <p className="text-gray-500 italic">{item.history}</p>
                        </div>
                    )}
                    <button className="mt-6 border-2 border-purple-600 text-purple-600 px-8 py-2 rounded-full font-bold hover:bg-purple-600 hover:text-white transition-all">
                      Learn More
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
