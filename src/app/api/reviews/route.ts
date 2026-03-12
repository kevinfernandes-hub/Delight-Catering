import { NextRequest, NextResponse } from 'next/server';

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
      return NextResponse.json(
        { error: 'API credentials not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}&fields=reviews,rating,user_ratings_total`
    );

    const data = await response.json();

    if (!data.result) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
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
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
