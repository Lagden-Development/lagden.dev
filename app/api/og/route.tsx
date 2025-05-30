import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const title = searchParams.get('title') || 'Lagden Development';
    const description =
      searchParams.get('description') ||
      'A small development group passionate about open-source.';
    const type = searchParams.get('type') || 'website';
    let imageUrl = searchParams.get('image');
    const occupation = searchParams.get('occupation');
    const location = searchParams.get('location');

    // Fix image URL if it starts with // (protocol-relative URL)
    if (imageUrl && imageUrl.startsWith('//')) {
      imageUrl = `https:${imageUrl}`;
    }

    // Log for debugging
    console.log('OG Image params:', {
      title,
      description,
      type,
      imageUrl,
      occupation,
      location,
    });

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#000000',
            backgroundImage:
              'radial-gradient(circle at 25% 25%, #4c1d95 0%, transparent 50%), radial-gradient(circle at 75% 75%, #7c3aed 0%, transparent 50%)',
            padding: '60px',
          }}
        >
          {/* Grid pattern */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
              opacity: 0.3,
            }}
          />

          {/* Left side - Text content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              flex: 1,
              paddingRight: imageUrl ? '40px' : '0',
              alignItems: imageUrl ? 'flex-start' : 'center',
              textAlign: imageUrl ? 'left' : 'center',
              width: imageUrl ? '60%' : '100%',
            }}
          >
            {/* Logo/Icon for default view */}
            {!imageUrl && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '120px',
                  height: '120px',
                  backgroundColor: 'rgba(124, 58, 237, 0.2)',
                  borderRadius: '24px',
                  marginBottom: '48px',
                  border: '2px solid rgba(124, 58, 237, 0.3)',
                }}
              >
                <div
                  style={{
                    color: '#a855f7',
                    fontSize: '48px',
                    fontWeight: 'bold',
                  }}
                >
                  LD
                </div>
              </div>
            )}

            {/* Title */}
            <div
              style={{
                fontSize:
                  type === 'person'
                    ? '56px'
                    : type === 'project'
                      ? '48px'
                      : '64px',
                fontWeight: 'bold',
                color: '#ffffff',
                marginBottom: '24px',
                lineHeight: 1.1,
                maxWidth: imageUrl ? '100%' : '80%',
              }}
            >
              {title}
            </div>

            {/* Occupation and Location for people */}
            {type === 'person' && (occupation || location) && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  marginBottom: '24px',
                }}
              >
                {occupation && (
                  <div
                    style={{
                      fontSize: '24px',
                      color: '#a855f7',
                      fontWeight: '500',
                    }}
                  >
                    {occupation}
                  </div>
                )}
                {location && (
                  <div
                    style={{
                      fontSize: '20px',
                      color: '#9ca3af',
                    }}
                  >
                    📍 {location}
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div
              style={{
                fontSize: '24px',
                color: '#d1d5db',
                lineHeight: 1.4,
                maxWidth: imageUrl ? '100%' : '70%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {description}
            </div>
          </div>

          {/* Right side - Image */}
          {imageUrl && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '400px',
                height: '400px',
                borderRadius: type === 'person' ? '200px' : '24px',
                overflow: 'hidden',
                flexShrink: 0,
                border: '4px solid rgba(124, 58, 237, 0.3)',
                boxShadow: '0 0 40px rgba(124, 58, 237, 0.4)',
              }}
            >
              <img
                src={imageUrl}
                alt={title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
          )}

          {/* Type badge */}
          {type !== 'website' && (
            <div
              style={{
                position: 'absolute',
                top: '40px',
                right: '40px',
                backgroundColor: 'rgba(124, 58, 237, 0.2)',
                color: '#a855f7',
                padding: '12px 24px',
                borderRadius: '24px',
                fontSize: '18px',
                fontWeight: '600',
                textTransform: 'uppercase',
                border: '1px solid rgba(124, 58, 237, 0.3)',
              }}
            >
              {type}
            </div>
          )}

          {/* Brand */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              left: '40px',
              color: '#6b7280',
              fontSize: '20px',
              fontWeight: '500',
            }}
          >
            lagden.dev
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
