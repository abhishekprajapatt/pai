import type { NextConfig } from 'next';

const configuredApiOrigin = (() => {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!apiBaseUrl) return '';

  try {
    const parsedUrl = new URL(apiBaseUrl);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
      ? parsedUrl.origin
      : '';
  } catch {
    return '';
  }
})();

const nextConfig: NextConfig = {
  output: 'standalone',
  productionBrowserSourceMaps: false,
  async headers() {
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const contentSecurityPolicy = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ''} https://accounts.google.com https://*.google.com https://apis.google.com https://www.gstatic.com https://checkout.razorpay.com`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://res.cloudinary.com https://*.supabase.co https://*.firebasestorage.app https://firebasestorage.googleapis.com https://lh3.googleusercontent.com https://www.google.com https://icons.duckduckgo.com",
      "font-src 'self' data:",
      `connect-src ${[
        "'self'",
        configuredApiOrigin,
        ...(isDevelopment ? ['ws://localhost:*', 'ws://127.0.0.1:*'] : []),
        'https://checkout.razorpay.com',
        'https://api.razorpay.com',
        'https://accounts.google.com',
        'https://*.google.com',
        'https://identitytoolkit.googleapis.com',
        'https://securetoken.googleapis.com',
        'https://apis.google.com',
        'https://*.supabase.co',
        'https://*.googleapis.com',
        'https://*.firebaseio.com',
        'wss://*.firebaseio.com',
        'https://*.firebasestorage.app',
        'https://firebasestorage.googleapis.com',
      ]
        .filter(Boolean)
        .join(' ')}`,
      "frame-src 'self' https://checkout.razorpay.com https://api.razorpay.com https://www.google.com https://*.firebaseapp.com",
      "media-src 'self' blob:",
      "worker-src 'self' blob:",
    ].join('; ');

    const securityHeaders = [
      { key: 'Content-Security-Policy', value: contentSecurityPolicy },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), payment=(self)',
      },
    ];

    if (process.env.NODE_ENV === 'production') {
      securityHeaders.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains',
      });
    }

    return [{ source: '/(.*)', headers: securityHeaders }];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.firebasestorage.app',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/v0/b/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
