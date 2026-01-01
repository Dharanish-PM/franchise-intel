// HPI 1.5-V
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMember } from '@/integrations';
import { useUserStore } from '@/store/userStore';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Globe, 
  TrendingUp, 
  LayoutDashboard, 
  Store, 
  ArrowRight, 
  CheckCircle2,
  Menu,
  X,
  PieChart,
  Activity,
  Layers,
  ShieldCheck
} from 'lucide-react';

// --- Utility Components ---

type AnimatedElementProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

const AnimatedElement: React.FC<AnimatedElementProps> = ({ children, className, delay = 0 }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          element.classList.add('is-visible');
        }, delay);
        observer.unobserve(element);
      }
    }, { threshold: 0.1 });

    observer.observe(element);
    return () => observer.disconnect();
  }, [delay]);

  return <div ref={ref} className={`opacity-0 translate-y-8 transition-all duration-1000 ease-out ${className || ''}`}>{children}</div>;
};

// --- Main Component ---

export default function HomePage() {
  const { member, isAuthenticated, isLoading } = useMember();
  const { user } = useUserStore();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle scroll for sticky header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Determine dashboard link based on role
  const getDashboardLink = () => {
    if (user?.role === 'ADMIN' || user?.role === 'BRAND_MANAGER') {
      return "/admin/dashboard";
    }
    if (user?.role === 'SALES') {
      return "/sales/dashboard";
    }
    return "/store/dashboard";
  };

  const handleAuthAction = () => {
    if (isAuthenticated) {
      navigate(getDashboardLink());
    } else {
      navigate('/login');
    }
  };

  // --- Styles for scoped animations ---
  const styles = `
    .is-visible {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
    
    .hero-image-container {
      perspective: 1000px;
    }
    
    .hero-image {
      transform: rotateX(5deg) rotateY(-5deg) rotateZ(2deg);
      transition: transform 0.5s ease-out;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
    }
    
    .hero-image:hover {
      transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1.02);
    }

    .clip-diagonal {
      clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);
    }

    .clip-diagonal-reverse {
      clip-path: polygon(0 15%, 100% 0, 100% 100%, 0 100%);
    }

    .soft-gradient {
      background: linear-gradient(135deg, #F9FAFA 0%, #F3F4F6 100%);
    }

    .text-gradient {
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-image: linear-gradient(90deg, #374151, #6B7280);
    }
  `;

  return (
    <div className="min-h-screen bg-background font-paragraph text-foreground overflow-x-hidden selection:bg-soft-gold selection:text-white">
      <style>{styles}</style>

      {/* --- Navigation --- */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          isScrolled ? 'bg-white/90 backdrop-blur-md border-gray-200 py-4 shadow-sm' : 'bg-transparent border-transparent py-6'
        }`}
      >
        <div className="container mx-auto px-6 max-w-[120rem] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-soft-gold rounded-sm flex items-center justify-center text-white">
              <Layers size={20} />
            </div>
            <span className="font-heading text-2xl font-bold tracking-tight text-primary">Franchise<span className="text-soft-gold">OS</span></span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {['Solutions', 'Platform', 'Analytics', 'Enterprise'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-secondary hover:text-primary transition-colors">
                {item}
              </a>
            ))}
          </nav>

          {/* Auth Button */}
          <div className="hidden md:flex items-center gap-4">
            <Button 
              onClick={handleAuthAction}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {isLoading ? 'Loading...' : isAuthenticated ? 'Launch Dashboard' : 'Sign In'}
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-primary" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-100 p-6 md:hidden flex flex-col gap-4 shadow-xl animate-in slide-in-from-top-5">
            {['Solutions', 'Platform', 'Analytics', 'Enterprise'].map((item) => (
              <a key={item} href="#" className="text-lg font-heading text-primary py-2 border-b border-gray-50">
                {item}
              </a>
            ))}
            <Button onClick={handleAuthAction} className="w-full mt-4 bg-primary text-white">
              {isAuthenticated ? 'Launch Dashboard' : 'Sign In'}
            </Button>
          </div>
        )}
      </header>

      {/* --- Hero Section --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-30">
          <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-soft-gold/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/4" />
          <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-gray-200/20 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/4" />
        </div>

        <div className="container mx-auto px-6 max-w-[120rem]">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            
            {/* Hero Content */}
            <div className="lg:w-1/2 space-y-8 z-10">
              <AnimatedElement>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-soft-gold/10 text-soft-gold text-xs font-bold tracking-widest uppercase mb-4">
                  <span className="w-2 h-2 rounded-full bg-soft-gold animate-pulse" />
                  Enterprise Grade Intelligence
                </div>
              </AnimatedElement>
              
              <AnimatedElement delay={100}>
                <h1 className="font-heading text-5xl lg:text-7xl xl:text-8xl leading-[0.9] text-primary">
                  Orchestrate Your <br />
                  <span className="text-soft-gold italic">Franchise Empire.</span>
                </h1>
              </AnimatedElement>

              <AnimatedElement delay={200}>
                <p className="text-lg lg:text-xl text-secondary max-w-xl leading-relaxed font-light">
                  The definitive platform for multi-location intelligence. Unify data, empower store managers, and drive global growth with surgical precision.
                </p>
              </AnimatedElement>

              <AnimatedElement delay={300}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={handleAuthAction}
                    className="h-14 px-8 rounded-full bg-primary text-white text-lg hover:bg-primary/90 shadow-lg hover:shadow-primary/20 transition-all"
                  >
                    Start Analysis
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button variant="outline" className="h-14 px-8 rounded-full border-gray-300 text-primary hover:bg-gray-50 text-lg">
                    View Demo
                  </Button>
                </div>
              </AnimatedElement>

              <AnimatedElement delay={400}>
                <div className="flex items-center gap-8 pt-8 border-t border-gray-100">
                  <div>
                    <p className="font-heading text-3xl text-primary">1000+</p>
                    <p className="text-xs text-secondary uppercase tracking-wider">Locations Managed</p>
                  </div>
                  <div className="w-px h-10 bg-gray-200" />
                  <div>
                    <p className="font-heading text-3xl text-primary">$2.5B</p>
                    <p className="text-xs text-secondary uppercase tracking-wider">Revenue Tracked</p>
                  </div>
                </div>
              </AnimatedElement>
            </div>

            {/* Hero Visual */}
            <div className="lg:w-1/2 w-full hero-image-container relative">
              <AnimatedElement delay={200} className="relative z-10">
                <div className="hero-image rounded-2xl overflow-hidden border border-white/50 bg-white/50 backdrop-blur-sm p-2 shadow-2xl">
                  <Image 
                    src="https://static.wixstatic.com/media/26a5b8_ba16f15cb2f043e3acb29f96cd67eda3~mv2.png?originWidth=1152&originHeight=768" 
                    alt="FranchiseOS Dashboard Interface" 
                    width={1200} 
                    height={800}
                    className="rounded-xl w-full h-auto object-cover shadow-inner"
                  />
                  
                  {/* Floating Elements for Parallax Feel */}
                  <div className="absolute -left-12 top-1/4 bg-white p-4 rounded-xl shadow-xl border border-gray-100 max-w-[200px] hidden xl:block animate-in fade-in slide-in-from-right-10 duration-1000 delay-500">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-100 rounded-lg text-green-600">
                        <TrendingUp size={16} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Daily Revenue</p>
                        <p className="font-bold text-gray-900">+12.5%</p>
                      </div>
                    </div>
                    <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 w-[75%]" />
                    </div>
                  </div>

                  <div className="absolute -right-8 bottom-1/4 bg-white p-4 rounded-xl shadow-xl border border-gray-100 max-w-[200px] hidden xl:block animate-in fade-in slide-in-from-left-10 duration-1000 delay-700">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <Globe size={16} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Active Stores</p>
                        <p className="font-bold text-gray-900">142 / 150</p>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedElement>
            </div>
          </div>
        </div>
      </section>

      {/* --- Value Proposition Grid --- */}
      <section className="py-24 bg-white relative z-10">
        <div className="container mx-auto px-6 max-w-[120rem]">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <AnimatedElement>
              <h2 className="font-heading text-4xl md:text-5xl text-primary mb-6">The Operating System for Scale</h2>
            </AnimatedElement>
            <AnimatedElement delay={100}>
              <p className="text-secondary text-lg font-light">
                Unified control for headquarters. Autonomy for store managers. 
                FranchiseOS bridges the gap between strategy and execution.
              </p>
            </AnimatedElement>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                icon: <Globe className="w-8 h-8 text-soft-gold" />,
                title: "Global Command Center",
                desc: "Real-time visibility across all territories. Monitor KPIs, compliance, and operational health from a single pane of glass."
              },
              {
                icon: <PieChart className="w-8 h-8 text-soft-gold" />,
                title: "Predictive Forecasting",
                desc: "AI-driven insights that anticipate inventory needs and revenue trends before they happen, reducing waste and maximizing profit."
              },
              {
                icon: <ShieldCheck className="w-8 h-8 text-soft-gold" />,
                title: "Standardized Excellence",
                desc: "Ensure brand consistency with centralized inventory management, automated alerts, and benchmark reporting."
              }
            ].map((feature, idx) => (
              <AnimatedElement key={idx} delay={idx * 100}>
                <div className="group p-8 rounded-2xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-xl transition-all duration-300 h-full">
                  <div className="mb-6 p-4 bg-white rounded-xl shadow-sm inline-block group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="font-heading text-2xl text-primary mb-4">{feature.title}</h3>
                  <p className="text-secondary font-light leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </AnimatedElement>
            ))}
          </div>
        </div>
      </section>

      {/* --- Feature Deep Dive: Admin --- */}
      <section className="py-32 soft-gradient clip-diagonal relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-[120rem]">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="lg:w-1/2 order-2 lg:order-1">
              <AnimatedElement>
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                  <Image 
                    src="https://static.wixstatic.com/media/26a5b8_784f5a964cdc485d92264bcd75cae857~mv2.png?originWidth=960&originHeight=640" 
                    alt="Admin Analytics Dashboard" 
                    width={1000} 
                    height={700}
                    className="w-full h-auto object-cover"
                  />
                  {/* Overlay UI Element */}
                  <div className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur-md p-6 rounded-xl border border-white/50 shadow-lg">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Global Revenue</p>
                        <p className="font-heading text-3xl text-primary">$12.4M</p>
                      </div>
                      <div className="h-10 w-32 flex items-end gap-1">
                        {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                          <div key={i} className="w-full bg-soft-gold rounded-t-sm" style={{ height: `${h}%`, opacity: 0.5 + (i * 0.1) }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedElement>
            </div>
            
            <div className="lg:w-1/2 order-1 lg:order-2">
              <AnimatedElement>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px w-12 bg-soft-gold" />
                  <span className="text-soft-gold uppercase tracking-widest text-sm font-bold">Head Office Control</span>
                </div>
                <h2 className="font-heading text-4xl lg:text-6xl text-primary mb-8">Total Visibility.<br />Zero Blind Spots.</h2>
                <p className="text-secondary text-lg font-light mb-8 leading-relaxed">
                  Eliminate the guesswork of managing distributed operations. Our Admin Dashboard aggregates data streams from every franchise location into actionable intelligence.
                </p>
                
                <ul className="space-y-4 mb-10">
                  {[
                    "Real-time inventory tracking across 100+ locations",
                    "Automated compliance & performance benchmarking",
                    "Granular access controls for regional managers"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-soft-gold shrink-0" />
                      <span className="text-primary font-light">{item}</span>
                    </li>
                  ))}
                </ul>

                <Button variant="outline" className="rounded-full px-8 py-6 border-primary text-primary hover:bg-primary hover:text-white transition-colors">
                  Explore Admin Features
                </Button>
              </AnimatedElement>
            </div>
          </div>
        </div>
      </section>

      {/* --- Feature Deep Dive: Store Manager --- */}
      <section className="py-32 bg-white relative">
        <div className="container mx-auto px-6 max-w-[120rem]">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="lg:w-1/2">
              <AnimatedElement>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px w-12 bg-soft-gold" />
                  <span className="text-soft-gold uppercase tracking-widest text-sm font-bold">Store Level Empowerment</span>
                </div>
                <h2 className="font-heading text-4xl lg:text-6xl text-primary mb-8">Empower the Frontline.</h2>
                <p className="text-secondary text-lg font-light mb-8 leading-relaxed">
                  Give your store managers the tools they need to succeed without the noise. A focused, intuitive dashboard designed for daily operations, not data science.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                  <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                    <Activity className="w-8 h-8 text-primary mb-4" />
                    <h4 className="font-heading text-xl mb-2">Smart Alerts</h4>
                    <p className="text-sm text-secondary font-light">Instant notifications for low stock and order anomalies.</p>
                  </div>
                  <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                    <LayoutDashboard className="w-8 h-8 text-primary mb-4" />
                    <h4 className="font-heading text-xl mb-2">Simplified View</h4>
                    <p className="text-sm text-secondary font-light">Clutter-free interface focusing on daily KPIs and tasks.</p>
                  </div>
                </div>

                <Button variant="outline" className="rounded-full px-8 py-6 border-primary text-primary hover:bg-primary hover:text-white transition-colors">
                  See Manager View
                </Button>
              </AnimatedElement>
            </div>

            <div className="lg:w-1/2">
              <AnimatedElement>
                <div className="relative">
                  {/* Decorative Elements */}
                  <div className="absolute -top-10 -right-10 w-64 h-64 bg-soft-gold/10 rounded-full blur-3xl" />
                  
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
                    <Image 
                      src="https://static.wixstatic.com/media/26a5b8_4caf65e9a47049e1bb0b7f9f5cf0498a~mv2.png?originWidth=960&originHeight=640" 
                      alt="Store Manager Tablet Interface" 
                      width={1000} 
                      height={700}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                </div>
              </AnimatedElement>
            </div>
          </div>
        </div>
      </section>

      {/* --- Live Data Simulation / Ticker --- */}
      <section className="py-12 bg-primary text-white overflow-hidden">
        <div className="container mx-auto px-6 max-w-[120rem] mb-8">
          <p className="text-center text-soft-gold uppercase tracking-widest text-xs font-bold">Live Network Activity</p>
        </div>
        <div className="flex whitespace-nowrap overflow-hidden">
          <div className="animate-marquee flex gap-12 items-center min-w-full px-6">
            {[...Array(10)].map((_, i) => (
              <React.Fragment key={i}>
                <div className="flex items-center gap-3 opacity-70 hover:opacity-100 transition-opacity">
                  <Store size={16} className="text-soft-gold" />
                  <span className="font-light text-sm">Store #{100 + i} <span className="text-gray-400 mx-2">|</span> Order Placed <span className="text-green-400">$1,240.00</span></span>
                </div>
                <div className="flex items-center gap-3 opacity-70 hover:opacity-100 transition-opacity">
                  <Activity size={16} className="text-blue-400" />
                  <span className="font-light text-sm">Inventory Alert <span className="text-gray-400 mx-2">|</span> Seattle Branch <span className="text-red-400">Low Stock: Coffee Beans</span></span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
        <style>{`
          .animate-marquee {
            animation: marquee 40s linear infinite;
          }
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </section>

      {/* --- CTA Section --- */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://static.wixstatic.com/media/26a5b8_d8e9a939d0f9448b98ccd457fb44d467~mv2.png?originWidth=768&originHeight=1152')] opacity-[0.03]" />
        
        <div className="container mx-auto px-6 max-w-[120rem] relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatedElement>
              <h2 className="font-heading text-5xl md:text-7xl text-primary mb-8">Ready to scale with precision?</h2>
            </AnimatedElement>
            <AnimatedElement delay={100}>
              <p className="text-xl text-secondary font-light mb-12 max-w-2xl mx-auto">
                Join the leading franchises using FranchiseOS to unify their operations and drive consistent growth.
              </p>
            </AnimatedElement>
            <AnimatedElement delay={200}>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button 
                  onClick={handleAuthAction}
                  className="h-16 px-10 rounded-full bg-primary text-white text-xl hover:bg-primary/90 shadow-2xl hover:shadow-primary/30 transition-all transform hover:-translate-y-1"
                >
                  {isAuthenticated ? 'Go to Dashboard' : 'Get Started Now'}
                </Button>
                <Button variant="ghost" className="h-16 px-10 rounded-full text-primary text-lg hover:bg-gray-50">
                  Contact Sales
                </Button>
              </div>
            </AnimatedElement>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-gray-50 border-t border-gray-200 pt-20 pb-10">
        <div className="container mx-auto px-6 max-w-[120rem]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 bg-soft-gold rounded-sm flex items-center justify-center text-white">
                  <Layers size={14} />
                </div>
                <span className="font-heading text-xl font-bold text-primary">Franchise<span className="text-soft-gold">OS</span></span>
              </div>
              <p className="text-secondary font-light text-sm leading-relaxed">
                The complete operating system for modern franchise management. Built for scale, designed for clarity.
              </p>
            </div>
            
            {[
              { title: "Product", links: ["Features", "Integrations", "Pricing", "Changelog"] },
              { title: "Company", links: ["About Us", "Careers", "Blog", "Contact"] },
              { title: "Resources", links: ["Documentation", "API Reference", "Community", "Help Center"] }
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-bold text-primary mb-6">{col.title}</h4>
                <ul className="space-y-4">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-secondary hover:text-soft-gold transition-colors text-sm font-light">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-400 font-light">
              © 2024 FranchiseOS Inc. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-xs text-gray-400 hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="text-xs text-gray-400 hover:text-primary transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}