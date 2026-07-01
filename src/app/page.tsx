'use client';

import React, { useEffect, useRef, useState } from 'react';
import GoogleReviewsCarousel from '@/components/home/GoogleReviewsCarousel';
import { CardContainer, CardBody, CardItem } from '@/components/ui/3d-card';
import { galleryImages } from '@/lib/galleryConfig';
import ChefAnimation from '@/components/home/ChefAnimation';
import { Play, X } from 'lucide-react';

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
      containerClassName="card-container-outer"
      className="card-container-inner reveal" 
    >
      <CardBody className="card-body-3d">
        <CardItem translateZ={100} className="card-item-3d w-full h-full absolute top-0 left-0">
          <img
            src={image}
            alt={title}
          />
        </CardItem>
        <div className="card-gradient-overlay"></div>
        <CardItem 
          translateZ={50} 
          as="div" 
          className="card-item-3d card-text-container"
        >
          <span className="text-gold" style={{ fontSize: '0.9rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>{category}</span>
          <h3 className="text-white" style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>{title}</h3>
          <p className="text-gray-300" style={{ fontSize: '0.95rem', lineHeight: '1.5', color: 'var(--color-text-muted)' }}>{description}</p>
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
  const [dbAssets, setDbAssets] = useState<Record<string, string>>({});
  const [dbGallery, setDbGallery] = useState<{ img: string; title: string }[]>([]);
  const [dbVideos, setDbVideos] = useState<{ id: string; url: string; title: string }[]>([]);
  const [activeLightboxVideo, setActiveLightboxVideo] = useState<{ id: string; url: string; title: string } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const [assetsRes, galleryRes, videosRes] = await Promise.all([
          fetch('/api/admin/assets', { cache: 'no-store' }),
          fetch('/api/admin/gallery', { cache: 'no-store' }),
          fetch('/api/admin/videos', { cache: 'no-store' })
        ]);
        if (assetsRes.ok) {
          const assetsData = await assetsRes.json();
          const assetMap: Record<string, string> = {};
          assetsData.forEach((asset: any) => {
            if (asset.url) {
              assetMap[asset.key] = asset.url;
            }
          });
          setDbAssets(assetMap);
        }
        if (galleryRes.ok) {
          const galleryData = await galleryRes.json();
          if (galleryData.length > 0) {
            setDbGallery(galleryData.map((img: any) => ({ img: img.url, title: img.title })));
          }
        }
        if (videosRes.ok) {
          const videosData = await videosRes.json();
          setDbVideos(videosData);
        }
      } catch (err) {
        console.error('Failed to fetch dynamic media:', err);
      }
    };
    fetchMedia();
  }, []);
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
           <a href="/menu" className="hover-target">Menu Packages</a>
          <a href="#menu" className="hover-target">Signature Menu</a>
          <a href="#how-it-works" className="hover-target">Experience</a>
          <a href="/gallery" className="hover-target">Gallery</a>
          <a href="/admin/login" className="hover-target" style={{ color: 'var(--color-gold)' }}>Admin</a>
        </div>
        <a href="#cta" className="nav-cta hover-target">Book Now</a>
      </nav>

      <section id="hero">
        <div 
          id="hero-bg"
          style={dbAssets.hero_bg ? { backgroundImage: `url(${dbAssets.hero_bg})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.3)' } : {}}
        ></div>
        <div className="hero-vignette"></div>
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
            <a href="#menu" className="btn btn-gold btn-shimmer hover-target">Explore Menu</a>
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
            <img src={dbAssets.about_plating || "https://images.unsplash.com/photo-1555244162-803834f87a4d?auto=format&fit=crop&q=80&w=1000"} alt="Exquisite plating" />
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

      <section id="culinary-art" style={{ backgroundColor: 'var(--color-surface)', borderTop: '1px solid rgba(201, 168, 76, 0.15)', borderBottom: '1px solid rgba(201, 168, 76, 0.15)' }}>
        <div className="container culinary-split">
          <div className="reveal reveal-left" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <ChefAnimation />
          </div>
          <div className="reveal reveal-right" style={{ flex: 1 }}>
            <span className="section-tag">Behind The Scenes</span>
            <h2 style={{ fontSize: 'clamp(2.5rem, 4vw, 4rem)', marginBottom: '2rem', fontStyle: 'italic' }}>The Culinary Theatre.</h2>
            <p style={{ marginBottom: '1.5rem', fontSize: '1.125rem', lineHeight: '1.7' }}>
              Every event is a sensory performance. Watch our master chefs blend Nagpur&apos;s rich aromatic spices with innovative, high-flame cooking techniques.
            </p>
            <p style={{ fontSize: '1.125rem', lineHeight: '1.7' }}>
              From slow-simmering signature biryanis to rapid wok-tossed snacks, our kitchen is a theatre of passion, precision, and hygiene—transforming premium ingredients into mouthwatering catering memories.
            </p>
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
              image={dbAssets.package_snacks || "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&q=80&w=800"}
              category="Snacks & Starters"
              title="Non-Veg Delights"
              description="A tantalizing selection of premium non-veg snacks."
            />
            <MenuCard 
              delay="0.3s"
              image={dbAssets.package_biryani || "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800"}
              category="Main Course"
              title="Signature Chicken Biryani"
              description="Our most praised dish slow-cooked to perfection."
            />
            <MenuCard 
              delay="0.5s"
              image={dbAssets.package_buffet || "https://images.unsplash.com/photo-1621841957884-1210fe19b66d?auto=format&fit=crop&q=80&w=800"}
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
          <div className="showcase-grid">
            {(dbGallery.length > 0 ? dbGallery : galleryImages).map((item, i) => (
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

              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="gallery">
        <div className="gallery-container">
          {(dbGallery.length > 0 ? dbGallery.slice(0, 4) : [
            { img: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=800', title: 'Impeccable Settings' },
            { img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800', title: 'Artful Plating' },
            { img: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800', title: 'Ambient Experiences' },
            { img: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&q=80&w=800', title: 'Culinary Mastery' },
          ]).map((item, i) => (
            <div key={i} className="gallery-item hover-target">
              <img src={item.img} alt={item.title} />
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section style={{ padding: '7rem 0', position: 'relative' }}>
        <div className="container reveal">
          <div className="section-header reveal">
            <span className="section-tag">Packages</span>
            <h2>Transparent Pricing.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem', marginTop: '4rem' }}>
            {[
              { name: 'Starter', price: '₹299', perHead: 'per head', items: ['Up to 50 guests', 'Vegetarian menu', 'Basic setup', 'Standard service'] },
              { name: 'Classic', price: '₹599', perHead: 'per head', items: ['Up to 200 guests', 'Veg & Non-Veg', 'Premium setup', 'Professional staff', 'Beverages included'], featured: true },
              { name: 'Premium', price: '₹899', perHead: 'per head', items: ['Unlimited guests', 'Customized menu', 'Luxury setup', 'Senior chef', 'Beverages & desserts', 'Decoration'] }
            ].map((pkg, i) => (
              <div key={i} className={`pricing-card ${pkg.featured ? 'featured' : ''}`}>
                {pkg.featured && (
                  <div className="featured-badge">
                    <span>★ MOST POPULAR</span>
                  </div>
                )}
                <div>
                  <h3>{pkg.name}</h3>
                  <div className="pricing-card-price">{pkg.price}</div>
                  <p className="pricing-card-period">{pkg.perHead}</p>
                  <ul className="pricing-card-items">
                    {pkg.items.map((item, j) => (
                      <li key={j}>
                        <span className="check">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <button className="btn btn-gold btn-shimmer hover-target" style={{ width: '100%', padding: '0.8rem', background: pkg.featured ? 'var(--color-gold)' : 'transparent', border: '1px solid var(--color-gold)', color: pkg.featured ? 'var(--color-bg)' : 'var(--color-gold)', cursor: 'pointer', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.9rem' }}>Get Quote</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section style={{ padding: '7rem 0', backgroundColor: '#0a0a0a', borderTop: '1px solid rgba(201, 168, 76, 0.1)', borderBottom: '1px solid rgba(201, 168, 76, 0.1)' }}>
        <div className="container reveal">
          <div className="section-header reveal">
            <span className="section-tag">Behind the Scenes</span>
            <h2>See Us in Action.</h2>
          </div>
          
          <style>{`
            .video-gallery-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
              gap: 2.5rem;
              margin-top: 3.5rem;
            }
            .video-gallery-card {
              position: relative;
              aspect-ratio: 16/9;
              border-radius: 12px;
              overflow: hidden;
              border: 1px solid rgba(201, 168, 76, 0.15);
              background: #050505;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
              cursor: pointer;
              transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .video-gallery-card:hover {
              transform: translateY(-8px);
              border-color: rgba(201, 168, 76, 0.5);
              box-shadow: 0 20px 45px rgba(201, 168, 76, 0.2);
            }
            .video-card-overlay {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.2) 50%, rgba(0, 0, 0, 0) 100%);
              z-index: 2;
              transition: all 0.3s ease;
            }
            .video-gallery-card:hover .video-card-overlay {
              background: rgba(0, 0, 0, 0.4);
            }
            .video-play-btn {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) scale(0.8);
              width: 56px;
              height: 56px;
              border-radius: 50%;
              background: rgba(201, 168, 76, 0.95);
              color: #000;
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 3;
              opacity: 0;
              transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
              box-shadow: 0 0 15px rgba(201, 168, 76, 0.5);
            }
            .video-gallery-card:hover .video-play-btn {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
            .video-card-title-bar {
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              padding: 1.25rem;
              z-index: 3;
            }
            .video-card-title {
              margin: 0;
              font-size: 1.1rem;
              font-weight: 600;
              color: #F5F0E8;
              font-family: var(--font-display);
            }
            .video-card-badge {
              font-size: 0.75rem;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: var(--color-gold);
              margin-bottom: 0.25rem;
              display: block;
            }
            .video-lightbox-overlay {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0, 0, 0, 0.95);
              backdrop-filter: blur(12px);
              -webkit-backdrop-filter: blur(12px);
              z-index: 9999;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 2rem;
              animation: fadeIn 0.3s ease-out;
            }
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            .video-lightbox-container {
              width: 100%;
              max-width: 1024px;
              position: relative;
              animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
            @keyframes scaleIn {
              from { transform: scale(0.9); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
            .video-lightbox-close {
              position: absolute;
              top: -3.5rem;
              right: 0;
              background: none;
              border: none;
              color: #fff;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 0.5rem;
              transition: color 0.3s;
            }
            .video-lightbox-close:hover {
              color: var(--color-gold);
            }
            .video-lightbox-media {
              aspect-ratio: 16/9;
              width: 100%;
              border-radius: 12px;
              overflow: hidden;
              border: 1px solid rgba(201, 168, 76, 0.3);
              box-shadow: 0 25px 50px rgba(0,0,0,0.8), 0 0 50px rgba(201,168,76,0.15);
              background: #000;
            }
            .video-lightbox-title {
              margin-top: 1.5rem;
              font-size: 1.5rem;
              color: #F5F0E8;
              text-align: center;
              font-family: var(--font-display);
              font-style: italic;
            }
          `}</style>

          <div className="video-gallery-grid">
            {(dbVideos.length > 0 ? dbVideos : [
              { id: 'default-1', url: 'https://www.youtube.com/embed/zpqh9c-D1sQ', title: 'Delight Caterers - Behind the Scenes' }
            ]).map((video) => {
              const isYoutube = video.url.includes('youtube.com') || video.url.includes('youtu.be');
              
              const getYoutubeLoopUrl = (srcUrl: string) => {
                const watchRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?\s]+)/;
                const match = srcUrl.match(watchRegex);
                let videoId = '';
                if (match && match[1]) {
                  videoId = match[1];
                } else if (srcUrl.includes('youtube.com/embed/')) {
                  const embedIdRegex = /youtube\.com\/embed\/([^&?\s]+)/;
                  const embedMatch = srcUrl.match(embedIdRegex);
                  if (embedMatch && embedMatch[1]) {
                    videoId = embedMatch[1].split('?')[0];
                  }
                }
                if (videoId) {
                  return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0&iv_load_policy=3`;
                }
                return srcUrl;
              };

              return (
                <div 
                  key={video.id} 
                  className="video-gallery-card reveal"
                  onClick={() => setActiveLightboxVideo(video)}
                >
                  {isYoutube ? (
                    <iframe 
                      width="100%" 
                      height="100%" 
                      src={getYoutubeLoopUrl(video.url)} 
                      title={video.title}
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      style={{ border: 'none', width: '100%', height: '100%', pointerEvents: 'none', objectFit: 'cover' }}
                    />
                  ) : (
                    <video
                      src={video.url}
                      loop
                      muted
                      autoPlay
                      playsInline
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}
                  
                  <div className="video-card-overlay"></div>
                  
                  <div className="video-play-btn">
                    <Play size={24} fill="#000" style={{ marginLeft: '4px' }} />
                  </div>
                  
                  <div className="video-card-title-bar">
                    <span className="video-card-badge">Behind The Scenes</span>
                    <h3 className="video-card-title">{video.title}</h3>
                  </div>
                </div>
              );
            })}
          </div>

          <p style={{ color: 'var(--color-text-muted)', marginTop: '3.5rem', textAlign: 'center', maxWidth: '600px', margin: '3.5rem auto 0', lineHeight: '1.7', fontSize: '1.05rem' }}>
            Watch our culinary team prepare exquisite dishes and orchestrate unforgettable fine-dining events for our guests. Click any video to play with audio.
          </p>
        </div>
      </section>

      {/* Lightbox Modal */}
      {activeLightboxVideo && (
        <div className="video-lightbox-overlay" onClick={() => setActiveLightboxVideo(null)}>
          <div className="video-lightbox-container" onClick={(e) => e.stopPropagation()}>
            <button className="video-lightbox-close" onClick={() => setActiveLightboxVideo(null)}>
              <X size={32} />
            </button>
            <div className="video-lightbox-media">
              {(() => {
                const isYoutube = activeLightboxVideo.url.includes('youtube.com') || activeLightboxVideo.url.includes('youtu.be');
                if (isYoutube) {
                  let embedUrl = activeLightboxVideo.url;
                  const watchRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?\s]+)/;
                  const match = activeLightboxVideo.url.match(watchRegex);
                  let videoId = '';
                  if (match && match[1]) {
                    videoId = match[1];
                  } else if (activeLightboxVideo.url.includes('youtube.com/embed/')) {
                    const embedIdRegex = /youtube\.com\/embed\/([^&?\s]+)/;
                    const embedMatch = activeLightboxVideo.url.match(embedIdRegex);
                    if (embedMatch && embedMatch[1]) {
                      videoId = embedMatch[1].split('?')[0];
                    }
                  }
                  if (videoId) {
                    embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1&rel=0`;
                  }
                  return (
                    <iframe
                      width="100%"
                      height="100%"
                      src={embedUrl}
                      title={activeLightboxVideo.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ border: 'none', width: '100%', height: '100%' }}
                    />
                  );
                } else {
                  return (
                    <video
                      src={activeLightboxVideo.url}
                      controls
                      autoPlay
                      style={{ width: '100%', height: '100%' }}
                    />
                  );
                }
              })()}
            </div>
            <h4 className="video-lightbox-title">{activeLightboxVideo.title}</h4>
          </div>
        </div>
      )}

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
              <a href="/gallery">Gallery</a>
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
