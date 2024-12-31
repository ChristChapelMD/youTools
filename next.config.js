/** @type {import('next').NextConfig} */
const nextConfig = {
    
    output: 'standalone',
        outputFileTracingIncludes: {
            '*': [
            'public/**/*',
            '.next/static/**/*',
            ],
        },

};

module.exports = nextConfig;
