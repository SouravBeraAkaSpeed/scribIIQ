/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
        return [
          {
            source: '/api/auth/:slug*',
            destination: 'http://localhost:3002/api/auth/:slug*', // Update with your Node.js API URL
            permanent: false,
          },
          {
            source: '/api/sanity/signUp',
            destination: 'http://localhost:3002/api/sanity/signUp', // Update with your Node.js API URL
            permanent: false,
          },
          {
            source: '/api/liveblocks-auth',
            destination: 'http://localhost:3002/api/liveblocks-auth', // Update with your Node.js API URL
            permanent: false,
          }
        ];
      }
};

export default nextConfig;
