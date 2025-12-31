import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Get dynamic data from query params
    const title = searchParams.get('title') || 'Awesome Gemini Prompts';
    const description = searchParams.get('description') || 'The ultimate collection of 1,000+ optimized prompts for Gemini & Nano.';
    const tags = searchParams.get('tags')?.split(',') || ['AI', 'Gemini', 'Prompts'];
    
    // Truncate description if too long
    const shortDesc = description.length > 100 ? description.slice(0, 100) + '...' : description;

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000000',
            backgroundImage: 'radial-gradient(circle at 25px 25px, #222 2%, transparent 0%), radial-gradient(circle at 75px 75px, #222 2%, transparent 0%)',
            backgroundSize: '100px 100px',
            color: 'white',
            fontFamily: 'sans-serif',
            padding: '40px 80px',
            position: 'relative',
          }}
        >
          {/* Background Glow */}
          <div 
             style={{
               position: 'absolute',
               top: '-20%',
               left: '20%',
               width: '600px',
               height: '600px',
               background: 'linear-gradient(180deg, rgba(59,130,246,0.15), rgba(147,51,234,0.15))',
               filter: 'blur(120px)',
               borderRadius: '50%',
               zIndex: 0,
             }}
          />

          {/* Content Container */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10,  textAlign: 'center' }}>
            
            {/* Logo / Brand */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px', gap: '12px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#fff' }} />
              <div style={{ fontSize: 24, fontWeight: 300, color: '#a1a1aa', letterSpacing: '2px' }}>AWESOME GEMINI PROMPTS</div>
            </div>

            {/* Title */}
            <div
              style={{
                fontSize: 72,
                fontWeight: 800,
                background: 'linear-gradient(to bottom right, #fff, #a1a1aa)',
                backgroundClip: 'text',
                color: 'transparent',
                lineHeight: 1.1,
                marginBottom: '24px',
                maxWidth: '900px',
              }}
            >
              {title}
            </div>

            {/* Description */}
            <div style={{ fontSize: 32, color: '#71717a', maxWidth: '800px', lineHeight: 1.4, marginBottom: '60px' }}>
              {shortDesc}
            </div>

            {/* Tags */}
            <div style={{ display: 'flex', gap: '16px' }}>
              {tags.slice(0, 3).map((tag) => (
                <div
                  key={tag}
                  style={{
                    padding: '8px 24px',
                    borderRadius: '999px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    fontSize: 20,
                    color: '#e4e4e7',
                    background: 'rgba(255,255,255,0.05)',
                  }}
                >
                  #{tag}
                </div>
              ))}
            </div>
          </div>
          
          {/* Footer Decoration */}
          <div style={{ position: 'absolute', bottom: 40, fontSize: 18, color: '#3f3f46' }}>
             gemini-prompts.vercel.app
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
