'use client';

import React, { useEffect, useRef, useState } from 'react';

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
          <p className="hero-subtext">Premium catering for weddings, corporate events & exclusive celebrations.</p>
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
            <p>At Delight Caterers, we believe that food is more than nourishment—it is an experience, a statement, and a memory in the making.</p>
            <div className="stats-row">
              <div className="stat"><h3>18+</h3><p>Years of Experience</p></div>
              <div className="stat"><h3>4.8/5</h3><p>Star Rating</p></div>
              <div className="stat"><h3>1000+</h3><p>Capacity Scalability</p></div>
            </div>
          </div>
        </div>
      </section>

      <section id="menu">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-tag">Curated Selections</span>
            <h2>A Taste of Elegance.</h2>
          </div>
          <div className="menu-grid">
            <div className="menu-card reveal" style={{ transitionDelay: '0.1s' }}>
              <div className="menu-bg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&q=80&w=800')" }}></div>
              <div className="menu-card-content">
                <span className="menu-category">Snacks & Starters</span>
                <h3>Non-Veg Delights</h3>
                <p>A tantalizing selection of premium non-veg snacks.</p>
              </div>
            </div>
            <div className="menu-card reveal" style={{ transitionDelay: '0.3s' }}>
              <div className="menu-bg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800')" }}></div>
              <div className="menu-card-content">
                <span className="menu-category">Main Course</span>
                <h3>Signature Chicken Biryani</h3>
                <p>Our most praised dish slow-cooked to perfection.</p>
              </div>
            </div>
            <div className="menu-card reveal" style={{ transitionDelay: '0.5s' }}>
              <div className="menu-bg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1621841957884-1210fe19b66d?auto=format&fit=crop&q=80&w=800')" }}></div>
              <div className="menu-card-content">
                <span className="menu-category">Buffet Service</span>
                <h3>Indian & Chinese Flavors</h3>
                <p>A grand buffet spread of North Indian and Chinese delicacies.</p>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '4rem' }}>
              <a href="/menu" className="btn btn-gold hover-target">See Full Menu</a>
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
          <span className="quote-icon">&ldquo;</span>
          <div className="carousel-container">
            {[
              { text: '&ldquo;Excellent management and the taste of the food is very delicious.&rdquo;', author: 'Suraj Gawande', event: 'Satisfied Customer' },
              { text: '&ldquo;Their Chicken Biryani is absolutely fantastic. Highly recommended!&rdquo;', author: 'Local Reviewer', event: 'Birthday Party' },
              { text: '&ldquo;The staff is very polite and well-behaved. Very professional.&rdquo;', author: 'Verified Review', event: 'Wedding Reception' },
              { text: '&ldquo;With a 4.8-star rating, Delight Caterers remains Nagpur&apos;s top choice.&rdquo;', author: 'Justdial Highlights', event: 'Community Favorite' },
            ].map((t, i) => (
              <div key={i} className={`testimonial-slide ${currentSlide === i ? 'active' : ''}`}>
                <p className="testimonial-text" dangerouslySetInnerHTML={{ __html: t.text }}></p>
                <p className="testimonial-author">{t.author}</p>
                <p className="testimonial-event">{t.event}</p>
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
