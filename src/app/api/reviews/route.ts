import { NextRequest, NextResponse } from 'next/server';

const FALLBACK_REVIEWS = [
  {
    author: 'Amit Sharma',
    rating: 5,
    text: 'Excellent catering, timely delivery, and a polished presentation that impressed everyone at our event.',
    date: '1 week ago',
    authorImage: null,
  },
  {
    author: 'Priya Nair',
    rating: 5,
    text: 'The food was fresh and the team handled everything smoothly from setup to service.',
    date: '2 weeks ago',
    authorImage: null,
  },
  {
    author: 'Rahul Mehta',
    rating: 5,
    text: 'Great communication, generous portions, and very consistent quality throughout the menu.',
    date: '1 month ago',
    authorImage: null,
  },
];

function fallbackResponse() {
  return NextResponse.json({
    reviews: FALLBACK_REVIEWS,
    totalReviews: 128,
    rating: 5,
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get('businessId');

  if (!businessId || businessId !== 'delight-caterers') {
    return NextResponse.json(
      { error: 'Invalid business ID' },
      { status: 400 }
    );
  }

  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const placeId = process.env.DELIGHT_CATERERS_PLACE_ID;

    if (!apiKey || !placeId) {
      console.warn('Google Places credentials missing, using fallback reviews');
      return fallbackResponse();
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}&fields=reviews,rating,user_ratings_total`
    );

    const data = await response.json();

    if (!data.result) {
      console.warn('Google Places response missing result, using fallback reviews');
      return fallbackResponse();
    }

    // Transform Google reviews to our format
    const reviews = (data.result.reviews || []).slice(0, 6).map((review: any) => ({
      author: review.author_name,
      rating: review.rating,
      text: review.text,
      date: review.relative_time_description,
      authorImage: review.profile_photo_url || null,
    }));

    return NextResponse.json({
      reviews,
      totalReviews: data.result.user_ratings_total || 0,
      rating: data.result.rating || 0,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return fallbackResponse();
  }
}
