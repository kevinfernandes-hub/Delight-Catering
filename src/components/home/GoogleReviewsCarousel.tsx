'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface GoogleReview {
  author: string;
  rating: number;
  text: string;
  date: string;
  authorImage?: string;
}

interface CarouselData {
  reviews: GoogleReview[];
  rating: number;
  totalReviews: number;
}

export default function GoogleReviewsCarousel({ businessId }: { businessId: string }) {
  const [data, setData] = useState<CarouselData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/reviews?businessId=${businessId}`);
        if (res.ok) {
          const json = await res.json();
          setData({
            reviews: json.reviews,
            rating: json.rating,
            totalReviews: json.totalReviews,
          });
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [businessId]);

  const nextSlide = () => {
    if (data) {
      setCurrentIndex((prev) => (prev + 1) % data.reviews.length);
    }
  };

  const prevSlide = () => {
    if (data) {
      setCurrentIndex((prev) => (prev - 1 + data.reviews.length) % data.reviews.length);
    }
  };

  if (isLoading) {
    return <div className="google-reviews-carousel">Loading reviews...</div>;
  }

  if (!data || data.reviews.length === 0) {
    return null;
  }

  const visibleReviews = data.reviews.slice(currentIndex, currentIndex + 3);

  return (
    <div className="google-reviews-container">
      {/* Google Business Info Section */}
      <div className="google-business-info">
        <div className="business-header">
          <div className="business-rating">
            <div className="rating-stars">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="star-icon">★</span>
              ))}
            </div>
            <span className="rating-number">{data.rating}</span>
          </div>
          <div className="business-meta">
            <h3>Delight Caterers</h3>
            <p>Based on {data.totalReviews} reviews</p>
            <p className="powered-by">Powered by <span className="google-text">Google</span></p>
          </div>
        </div>
        <a
          href="https://www.google.com/maps/place/?q=place_id:ChIJCarUqdTB1DsRmka62G97Kqw"
          target="_blank"
          rel="noopener noreferrer"
          className="review-button"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '6px' }}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          </svg>
          Review us on Google
        </a>
      </div>

      {/* Reviews Carousel */}
      <div className="google-reviews-carousel">
        <div className="reviews-carousel-wrapper">
          <button className="carousel-btn prev" onClick={prevSlide} aria-label="Previous reviews">
            ‹
          </button>

          <div className="reviews-grid">
            {visibleReviews.map((review, idx) => (
              <div key={idx} className="review-card">
                <div className="review-header">
                  {review.authorImage && (
                    <Image
                      src={review.authorImage}
                      alt={review.author}
                      width={40}
                      height={40}
                      className="reviewer-avatar"
                    />
                  )}
                  <div className="reviewer-info">
                    <h4>{review.author}</h4>
                    <p className="review-date">{review.date}</p>
                  </div>
                </div>

                <div className="review-stars">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`star ${i < review.rating ? 'filled' : 'empty'}`}
                    >
                      ⭐
                    </span>
                  ))}
                </div>

                <p className="review-text">{review.text}</p>
              </div>
            ))}
          </div>

          <button className="carousel-btn next" onClick={nextSlide} aria-label="Next reviews">
            ›
          </button>
        </div>

        <div className="carousel-dots">
          {data.reviews.map((_, idx) => (
            <button
              key={idx}
              className={`dot ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to review ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
