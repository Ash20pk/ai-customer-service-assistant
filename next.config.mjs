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
};

export default nextConfig;
