import { LanguageProvider } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import TestsSection from '@/components/TestsSection';
import EducationalContent from '@/components/EducationalContent';
import DoctorsSection from '@/components/DoctorsSection';
import Quote from '@/components/Quote';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <LanguageProvider>
      <div className="min-h-screen w-full site-bg">
        <Header />
        <main>
          <Hero />
          <About />
          <TestsSection />
          <EducationalContent />
          <DoctorsSection />
          <Quote />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
};

export default Index;
