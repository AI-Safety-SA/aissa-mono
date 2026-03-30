/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "survey-core",
    "survey-react-ui",
    "survey-creator-core",
    "survey-creator-react",
  ],
};

export default nextConfig;
