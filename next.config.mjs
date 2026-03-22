/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.scdn.co' },
      { protocol: 'https', hostname: '*.scdn.co' },
      { protocol: 'https', hostname: 'i1.sndcdn.com' },
      { protocol: 'https', hostname: '*.audius.co' },
      { protocol: 'https', hostname: 'audius.co' },
      { protocol: 'https', hostname: '*.mainnet.audiusindex.org' },
      { protocol: 'https', hostname: '*.audius.prod.dhh.wtf' },
      { protocol: 'https', hostname: 'is1-ssl.mzstatic.com' },
      { protocol: 'https', hostname: '*.mzstatic.com' },
    ],
  },
}

export default nextConfig
