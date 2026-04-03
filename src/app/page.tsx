'use client';

import React, { useEffect, useRef, useState } from 'react';
import GoogleReviewsCarousel from '@/components/home/GoogleReviewsCarousel';
import { CardContainer, CardBody, CardItem } from '@/components/ui/3d-card';
import { galleryImages } from '@/lib/galleryConfig';

// Particle class moved outside component to fix lint
class Particle {
  canvas: HTMLCanvasElement;
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  color: string;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.speedY = Math.random() * 0.5 - 0.25;
    this.speedX = Math.random() * 0.5 - 0.25;
    this.opacity = Math.random() * 0.5 + 0.2;
    this.color = Math.random() > 0.3 ? '#C9A84C' : '#F5F0E8';
  }

  update() {
    this.y -= this.speedY;
    this.x += this.speedX;
    if (this.y < 0) this.y = this.canvas.height;
    if (this.y > this.canvas.height) this.y = 0;
    if (this.x < 0) this.x = this.canvas.width;
    if (this.x > this.canvas.width) this.x = 0;
  }
  
  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.opacity;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// MenuCard Component with 3D effect
function MenuCard({
  image,
  category,
  title,
  description,
  delay,
}: {
  image: string;
  category: string;
  title: string;
  description: string;
  delay: string;
}) {
  return (
    <CardContainer 
      containerClassName="!py-0"
      className="w-full h-80 reveal" 
    >
      <CardBody className="!w-full !h-full bg-gray-900 border border-white/[0.2] rounded-xl overflow-hidden relative">
        <CardItem translateZ={100} className="w-full h-full absolute top-0 left-0">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover"
          />
        </CardItem>
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/30 z-10"></div>
        <CardItem 
          translateZ={50} 
          as="div" 
          className="absolute bottom-0 left-0 right-0 px-6 py-6 z-20 w-full"
        >
          <span className="text-gold text-sm font-semibold block mb-2">{category}</span>
          <h3 className="text-white text-2xl font-bold mb-2">{title}</h3>
          <p className="text-gray-300 text-sm">{description}</p>
        </CardItem>
      </CardBody>
    </CardContainer>
  );
}

// Interactive Statistics Counter Component
function StatCounter({ stat, index }: { stat: { target: number; suffix: string; label: string; icon: string }; index: number }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.1 });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOutQuad = 1 - Math.pow(1 - progress, 2);
      const current = Math.floor(stat.target * easeOutQuad * 10) / 10;
      setCount(current);

      if (progress === 1) clearInterval(interval);
    }, 16);

    return () => clearInterval(interval);
  }, [isVisible, stat.target]);

  return (
    <div
      ref={ref}
      className="stat-item reveal"
      style={{
        animation: isVisible ? `slideUp 0.6s ease-out ${index * 0.15}s both` : 'none',
      }}
      onMouseEnter={(e) => {
        const target = e.currentTarget;
        target.style.animation = 'pulse-glow 1.5s infinite';
      }}
      onMouseLeave={(e) => {
        const target = e.currentTarget;
        target.style.animation = 'none';
      }}
    >
      <div className="stat-number">
        {count.toLocaleString('en-IN', { maximumFractionDigits: 1 })}{stat.suffix}
      </div>
      <p className="stat-label">{stat.label}</p>
    </div>
  );
}

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const animatedLineRef = useRef<SVGLineElement>(null);
  const howItWorksRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Scroll handling
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      // Reveal animations
      const revealElements = document.querySelectorAll('.reveal');
      revealElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.85) {
          el.classList.add('active');
        }
      });

      // Parallax
      const heroBg = document.getElementById('hero-bg');
      const heroContent = document.querySelector('.hero-content') as HTMLElement;
      if (heroBg && heroContent && window.scrollY < window.innerHeight) {
        heroBg.style.transform = `translateY(${window.scrollY * 0.4}px)`;
        heroContent.style.transform = `translateY(${window.scrollY * 0.2}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    // Custom Cursor
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current && followerRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;

        setTimeout(() => {
          if (followerRef.current) {
            followerRef.current.style.left = `${e.clientX}px`;
            followerRef.current.style.top = `${e.clientY}px`;
          }
        }, 50);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);

    // Hover effect for cursor
    const hoverTargets = document.querySelectorAll('.hover-target, a, button');
    hoverTargets.forEach((target) => {
      target.addEventListener('mouseenter', () => {
        if (followerRef.current) {
          followerRef.current.style.width = '60px';
          followerRef.current.style.height = '60px';
          followerRef.current.style.backgroundColor = 'rgba(201, 168, 76, 0.1)';
        }
      });
      target.addEventListener('mouseleave', () => {
        if (followerRef.current) {
          followerRef.current.style.width = '40px';
          followerRef.current.style.height = '40px';
          followerRef.current.style.backgroundColor = 'transparent';
        }
      });
    });

    // Particle Canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let particlesArray: Particle[] = [];
        const init = () => {
          particlesArray = [];
          const num = Math.floor((canvas!.width * canvas!.height) / 15000);
          for (let i = 0; i < num; i++) particlesArray.push(new Particle(canvas));
        };

        const animate = () => {
          ctx.clearRect(0, 0, canvas!.width, canvas!.height);
          particlesArray.forEach((p) => {
            p.update();
            p.draw(ctx);
          });
          requestAnimationFrame(animate);
        };

        init();
        animate();

        window.addEventListener('resize', () => {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          init();
        });
      }
    }

    // Line Animation
    const lineObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && animatedLineRef.current) {
          setTimeout(() => {
            if (animatedLineRef.current) animatedLineRef.current.style.strokeDashoffset = '0';
          }, 500);
        }
      },
      { threshold: 0.5 }
    );
    if (howItWorksRef.current) lineObserver.observe(howItWorksRef.current);

    // Testimonial Interval
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 4);
    }, 5000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousemove', handleMouseMove);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="main-wrapper" style={{ cursor: 'none' }}>
      <div id="cursor" ref={cursorRef}></div>
      <div id="cursor-follower" ref={followerRef}></div>

      <nav className={`public-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="logo">Delight</div>
        <div className="nav-links">
          <a href="#about" className="hover-target">Our Story</a>
          <a href="#menu" className="hover-target">Signature Menu</a>
          <a href="#how-it-works" className="hover-target">Experience</a>
          <a href="#gallery" className="hover-target">Gallery</a>
          <a href="/admin/login" className="hover-target" style={{ color: 'var(--color-gold)' }}>Admin</a>
        </div>
        <a href="#cta" className="nav-cta hover-target">Book Now</a>
      </nav>

      <section id="hero">
        <div id="hero-bg"></div>
        <canvas id="particles-canvas" ref={canvasRef}></canvas>
        <div className="hero-content">
          <h1 className="hero-headline">
            <span style={{ animationDelay: '0.1s' }}>We </span>
            <span style={{ animationDelay: '0.3s' }}>Don&apos;t </span>
            <span style={{ animationDelay: '0.5s' }}>Just </span>
            <span style={{ animationDelay: '0.7s' }}>Cater.</span>
            <br />
            <span style={{ animationDelay: '0.9s' }}>We </span>
            <span style={{ animationDelay: '1.1s' }} className="italic-word">Craft </span>
            <span style={{ animationDelay: '1.3s' }}>Memories.</span>
          </h1>
          <p className="hero-subtext">Quality food & best catering services in Nagpur. Premium catering for weddings, corporate events & exclusive celebrations.</p>
          <div className="hero-ctas">
            <a href="#menu" className="btn btn-gold hover-target">Explore Menu</a>
            <a href="#cta" className="btn btn-ghost hover-target">Request a Quote</a>
          </div>
        </div>
      </section>

      <section className="marquee-section">
        <div className="marquee-content">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="marquee-text">
              Weddings &middot; Corporate Events &middot; Birthday Celebrations &middot; Private Dinners &middot; Anniversaries &middot;
            </span>
          ))}
        </div>
      </section>

      <section id="about">
        <div className="container about-split">
          <div className="about-image reveal reveal-left">
            <img src="https://images.unsplash.com/photo-1555244162-803834f87a4d?auto=format&fit=crop&q=80&w=1000" alt="Exquisite plating" />
          </div>
          <div className="about-content reveal reveal-right">
            <span className="section-tag">Our Story</span>
            <h2>Culinary Artistry, Delivered.</h2>
            <p>At Delight Caterers, we believe that food is more than nourishment—it is an experience, a statement, and a memory in the making. Serving Nagpur and nearby areas with exceptional catering services.</p>
            <div className="stats-row">
              <div className="stat"><h3>18+</h3><p>Years of Experience</p></div>
              <div className="stat"><h3>4.8/5</h3><p>Star Rating</p></div>
              <div className="stat"><h3>1000+</h3><p>Capacity Scalability</p></div>
            </div>
          </div>
        </div>
      </section>

      <section id="menu" style={{ overflow: 'hidden' }}>
        <div className="container">
          <div className="section-header reveal">
            <span className="section-tag">Curated Selections</span>
            <h2>A Taste of Elegance.</h2>
          </div>
          <div className="menu-grid">
            <MenuCard 
              delay="0.1s"
              image="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&q=80&w=800"
              category="Snacks & Starters"
              title="Non-Veg Delights"
              description="A tantalizing selection of premium non-veg snacks."
            />
            <MenuCard 
              delay="0.3s"
              image="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800"
              category="Main Course"
              title="Signature Chicken Biryani"
              description="Our most praised dish slow-cooked to perfection."
            />
            <MenuCard 
              delay="0.5s"
              image="https://images.unsplash.com/photo-1621841957884-1210fe19b66d?auto=format&fit=crop&q=80&w=800"
              category="Buffet Service"
              title="Indian & Chinese Flavors"
              description="A grand buffet spread of North Indian and Chinese delicacies."
            />
          </div>
          <div style={{ textAlign: 'center', marginTop: '4rem' }}>
              <a href="/menu" className="btn btn-gold hover-target">See Catering Packages</a>
          </div>
        </div>
      </section>

      <section id="how-it-works" ref={howItWorksRef}>
        <div className="container">
          <div className="section-header reveal">
            <span className="section-tag">The Process</span>
            <h2>Seamless Sophistication.</h2>
          </div>
          <div className="process-flow reveal">
            <div className="connecting-line-container">
              <svg width="100%" height="100%" preserveAspectRatio="none">
                <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#C9A84C" strokeWidth="2" strokeDasharray="10" strokeOpacity="0.3" />
                <line className="connecting-line" ref={animatedLineRef} x1="0" y1="50%" x2="100%" y2="50%" stroke="#C9A84C" strokeWidth="2" />
              </svg>
            </div>
            <div className="process-step">
              <div className="step-icon">1</div>
              <h3>Consult & Customize</h3>
              <p>Discuss your event needs and finalize guest capacity.</p>
            </div>
            <div className="process-step">
              <div className="step-icon">2</div>
              <h3>Flawless Preparation</h3>
              <p>Our chefs use 18 years of expertise to craft delicious meals.</p>
            </div>
            <div className="process-step">
              <div className="step-icon">3</div>
              <h3>Professional Service</h3>
              <p>Polite, well-behaved staff managing your event.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials">
        <div className="container reveal">
          <GoogleReviewsCarousel businessId="delight-caterers" />
        </div>
      </section>

      <section id="work-showcase" style={{ padding: '4rem 0' }}>
        <div className="container reveal">
          <div className="section-header reveal">
            <span className="section-tag">Gallery Highlights</span>
            <h2>Our Work in Action.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '3rem' }}>
            {galleryImages.map((item, i) => (
              <div key={i} style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', aspectRatio: '1', cursor: 'pointer' }} className="hover-target">
                <img 
                  src={item.img} 
                  alt={item.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'grayscale(0%)',
                    transition: 'filter 0.4s ease, transform 0.4s ease'
                  }}
                  onMouseEnter={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.style.filter = 'grayscale(0%)';
                    img.style.transform = 'scale(1.08)';
                  }}
                  onMouseLeave={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.style.filter = 'grayscale(0%)';
                    img.style.transform = 'scale(1)';
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                  padding: '2rem 1.5rem 1.5rem',
                  color: 'white',
                  transform: 'translateY(20px)',
                  transition: 'transform 0.4s ease',
                  zIndex: 10
                }}
                onMouseEnter={(e) => {
                  const div = e.currentTarget;
                  div.style.transform = 'translateY(0)';
                }}
                onMouseLeave={(e) => {
                  const div = e.currentTarget;
                  div.style.transform = 'translateY(20px)';
                }}
                >
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>{item.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="gallery">
        <div className="gallery-container">
          {[
            { img: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=800', title: 'Impeccable Settings' },
            { img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800', title: 'Artful Plating' },
            { img: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800', title: 'Ambient Experiences' },
            { img: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&q=80&w=800', title: 'Culinary Mastery' },
          ].map((item, i) => (
            <div key={i} className="gallery-item hover-target">
              <img src={item.img} alt={item.title} />
              <div className="gallery-caption"><h4>{item.title}</h4></div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container reveal">
          <div className="section-header reveal">
            <span className="section-tag">Packages</span>
            <h2>Transparent Pricing.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '3rem' }}>
            {[
              { name: 'Starter', price: '₹299', perHead: 'per head', items: ['Up to 50 guests', 'Vegetarian menu', 'Basic setup', 'Standard service'] },
              { name: 'Classic', price: '₹599', perHead: 'per head', items: ['Up to 200 guests', 'Veg & Non-Veg', 'Premium setup', 'Professional staff', 'Beverages included'], featured: true },
              { name: 'Premium', price: '₹899', perHead: 'per head', items: ['Unlimited guests', 'Customized menu', 'Luxury setup', 'Senior chef', 'Beverages & desserts', 'Decoration'] }
            ].map((pkg, i) => (
              <div key={i} style={{
                padding: '2.5rem',
                borderRadius: '4px',
                backgroundColor: pkg.featured ? 'var(--color-gold)' : 'rgba(255,255,255,0.08)',
                border: pkg.featured ? 'none' : '2px solid var(--color-gold)',
                transform: pkg.featured ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer'
              }} className="hover-target"
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.transform = pkg.featured ? 'scale(1.08)' : 'scale(1.02)';
                el.style.boxShadow = '0 10px 30px rgba(201, 168, 76, 0.2)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.transform = pkg.featured ? 'scale(1.05)' : 'scale(1)';
                el.style.boxShadow = 'none';
              }}>
                <h3 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: pkg.featured ? '#0a0a0a' : 'var(--color-gold)', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>{pkg.name}</h3>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.25rem', color: pkg.featured ? '#0a0a0a' : 'var(--color-gold)', fontFamily: 'var(--font-display)' }}>{pkg.price}</div>
                <p style={{ fontSize: '0.9rem', marginBottom: '2rem', color: pkg.featured ? 'rgba(10,10,10,0.8)' : 'var(--color-text-muted)' }}>{pkg.perHead}</p>
                <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem' }}>
                  {pkg.items.map((item, j) => (
                    <li key={j} style={{ padding: '0.5rem 0', borderBottom: '1px solid ' + (pkg.featured ? 'rgba(10,10,10,0.2)' : 'var(--color-gold)'), color: pkg.featured ? '#0a0a0a' : 'var(--color-text)', fontSize: '0.95rem' }}>✓ {item}</li>
                  ))}
                </ul>
                <button className="btn btn-gold hover-target" style={{ width: '100%', padding: '0.8rem', background: pkg.featured ? 'white' : 'var(--color-gold)', color: pkg.featured ? 'var(--color-gold)' : 'white', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold', fontSize: '1rem' }}>Get Quote</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section style={{ padding: '5rem 0', backgroundColor: '#0a0a0a' }}>
        <div className="container reveal">
          <div className="section-header reveal">
            <span className="section-tag">Behind the Scenes</span>
            <h2>See Us in Action.</h2>
          </div>
          <div style={{ marginTop: '3rem', borderRadius: '4px', overflow: 'hidden', aspectRatio: '16/9', boxShadow: '0 10px 40px rgba(201, 168, 76, 0.1)' }}>
            <iframe 
              width="100%" 
              height="100%" 
              src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
              title="Delight Caterers - Behind the Scenes"
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              style={{ borderRadius: '4px' }}>
            </iframe>
          </div>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '2rem', textAlign: 'center', maxWidth: '600px', margin: '2rem auto 0', lineHeight: '1.6' }}>
            Watch our team prepare exquisite dishes and create unforgettable catering experiences for your special events.
          </p>
        </div>
      </section>

      {/* Statistics Enhanced Interactive Section */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container reveal">
          <style>{`
            @keyframes slideUp {
              from {
                opacity: 0;
                transform: translateY(30px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            
            @keyframes pulse-glow {
              0%, 100% {
                box-shadow: 0 0 0 0 rgba(201, 168, 76, 0.4);
              }
              50% {
                box-shadow: 0 0 0 15px rgba(201, 168, 76, 0);
              }
            }
            
            @keyframes counter-bounce {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.1); }
            }
            
            .stat-item {
              padding: 2.5rem;
              border-radius: '8px';
              position: relative;
              overflow: hidden;
              cursor: pointer;
              transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
              background: rgba(201, 168, 76, 0.05);
            }
            
            .stat-item::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 3px;
              background: linear-gradient(90deg, var(--color-gold), transparent);
              transform: scaleX(0);
              transform-origin: left;
              transition: transform 0.6s ease;
            }
            
            .stat-item:hover::before {
              transform: scaleX(1);
            }
            
            .stat-item:hover {
              transform: translateY(-8px) scale(1.05);
              background: rgba(201, 168, 76, 0.15);
              box-shadow: 0 15px 40px rgba(201, 168, 76, 0.15);
            }
            
            .stat-number {
              font-size: 3.5rem;
              font-weight: bold;
              color: var(--color-gold);
              margin-bottom: 0.5rem;
              font-family: var(--font-display);
              font-style: italic;
              transition: all 0.3s ease;
            }
            
            .stat-item:hover .stat-number {
              font-size: 4rem;
              text-shadow: 0 0 20px rgba(201, 168, 76, 0.5);
            }
            
            .stat-label {
              font-size: 1.1rem;
              color: var(--color-text);
              font-weight: 500;
              transition: all 0.3s ease;
              position: relative;
            }
            
            .stat-item:hover .stat-label {
              color: var(--color-gold);
            }
          `}</style>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', textAlign: 'center' }}>
            {[
              { target: 18, suffix: '+', label: 'Years of Excellence', icon: '👨‍🍳' },
              { target: 4.8, suffix: '★', label: 'Customer Rating', icon: '⭐' },
              { target: 1000, suffix: '+', label: 'Guests Catered', icon: '🍽️' },
              { target: 500, suffix: '+', label: 'Events Completed', icon: '🎉' }
            ].map((stat, i) => (
              <StatCounter key={i} stat={stat} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ padding: '5rem 0', backgroundColor: '#0a0a0a' }}>
        <div className="container reveal">
          <div className="section-header reveal">
            <span className="section-tag">Questions</span>
            <h2>Frequently Asked.</h2>
          </div>
          <div style={{ maxWidth: '800px', margin: '3rem auto 0' }}>
            {[
              { q: 'What is the minimum number of guests?', a: 'We can accommodate events with a minimum of 20 guests. For smaller gatherings, please contact us for custom arrangements.' },
              { q: 'Do you offer vegetarian and vegan options?', a: 'Yes! We offer 100% vegetarian, vegan, and non-vegetarian menus. Our chefs can customize based on dietary preferences.' },
              { q: 'What areas do you serve?', a: 'We serve Nagpur and nearby areas within a 30km radius. Delivery outside this range is available upon request.' },
              { q: 'How far in advance should we book?', a: 'We recommend booking at least 2-3 weeks before your event. For large events (200+ guests), please book 1 month in advance.' },
              { q: 'Do you handle decoration and setup?', a: 'Yes! Our premium packages include full setup, arrangement, and professional service. We can customize based on your theme.' },
              { q: 'What payment methods do you accept?', a: 'We accept cash, UPI, bank transfer, and card payments. A 30% advance is required to confirm your booking.' }
            ].map((faq, i) => (
              <details key={i} style={{ marginBottom: '1.5rem', border: '1px solid var(--color-gold)', borderRadius: '4px', padding: '1.5rem', cursor: 'pointer' }}>
                <summary style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--color-gold)', cursor: 'pointer', fontFamily: 'var(--font-display)' }}>{faq.q}</summary>
                <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)', lineHeight: '1.6', fontSize: '0.95rem' }}>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="cta">
        <div className="cta-bg"></div>
        <div className="container cta-content reveal">
          <h2>Book Nagpur&apos;s Best.</h2>
          <p style={{ color: 'var(--color-ivory)', marginBottom: '2rem', fontSize: '1.2rem' }}>
            Flat No 2, Shakun Apartment, Sheela Nagar Colony, Katol Road.
          </p>
          <a href="tel:9689330035" className="btn btn-gold btn-glowing hover-target">Call 9689330035</a>
        </div>
      </section>

      <footer>
        <div className="container">
          <div className="footer-content">
            <div className="logo">Delight</div>
            <div className="footer-nav">
              <a href="#about">Our Story</a>
              <a href="#menu">Menu</a>
              <a href="#gallery">Gallery</a>
              <a href="/admin">Admin Login</a>
            </div>
            <div className="social-icons">
              <a href="#">IG</a>
              <a href="#">FB</a>
              <a href="#">IN</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 Delight Caterers. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
