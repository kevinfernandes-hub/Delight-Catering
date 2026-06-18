import { NextRequest, NextResponse } from 'next/server';

const FALLBACK_REVIEWS = [
  {
    author: 'Himanshu K.',
    rating: 5,
    text: "Booked Delight Caterers for my sister's wedding and super delighted by their service and food quality. Definitely recommended. Kudos to Himanshu and his team.",
    date: '3 weeks ago',
    authorImage: null,
  },
  {
    author: 'Rajesh S.',
    rating: 5,
    text: 'Excellent food quality and service. The chicken biryani was outstanding and all guests loved it. Highly recommended for events in Nagpur.',
    date: '1 month ago',
    authorImage: null,
  },
  {
    author: 'Pranay D.',
    rating: 5,
    text: 'Systematic event management and very polite staff. Food taste was homely and prepared with hygiene. Best caterers in Nagpur for weddings.',
    date: '2 months ago',
    authorImage: null,
  },
  {
    author: 'Sneha W.',
    rating: 5,
    text: 'Taste and service is too good. We hired them for a birthday party and they did a fantastic job. Budget friendly catering with premium taste.',
    date: '2 weeks ago',
    authorImage: null,
  },
  {
    author: 'Amol Mandhare',
    rating: 5,
    text: 'Wonderful hospitality and yummy food. The cutlery and setup was very neat and professional. Will book again!',
    date: '1 month ago',
    authorImage: null,
  }
];

function fallbackResponse() {
  return NextResponse.json({
    reviews: FALLBACK_REVIEWS,
    totalReviews: 173,
    rating: 4.8,
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
