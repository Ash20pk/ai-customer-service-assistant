/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['metaschool.so'],
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'metaschool.so',
            pathname: '/**',
          },
        ],
    },
    env: {
        ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
    },
};

export default nextConfig;
