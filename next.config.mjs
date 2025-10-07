/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        optimizePackageImports: ["@chakra-ui/react"]
    },
    async rewrites() {
        return [
            {
                source: '/drop/9745/pretrillions',
                destination: '/drop/9745/0x4633B5f2F84C5506AE3979d1eeB5E58C912CFA5B',
            },
            {
                source: '/collection/9745/pretrillions',
                destination: '/collection/9745/0x4633B5f2F84C5506AE3979d1eeB5E58C912CFA5B',
            },
        ];
    },
};

export default nextConfig;
