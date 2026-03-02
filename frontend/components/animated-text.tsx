'use client';

import { useEffect, useState } from 'react';

export function AnimatedText() {
  const languages = [
    "Discover restaurants in English",
    "සිංහලෙන් අවන්හල් සොයන්න",
    "தமிழில் உணவகங்களை கண்டறியுங்கள்"
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fadeOutTimer = setTimeout(() => {
      setIsVisible(false);
    }, 4500);

    const switchTimer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % languages.length);
      setIsVisible(true);
    }, 5000);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(switchTimer);
    };
  }, [currentIndex]);

  return (
    <p 
      className={`text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {languages[currentIndex]}
    </p>
  );
}
