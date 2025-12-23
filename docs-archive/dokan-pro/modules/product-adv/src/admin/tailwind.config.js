import baseConfig from '../../../../base-tailwind.config';

/** @type {import('tailwindcss').Config} */
const updatedConfig = {
    ...baseConfig,
    content: [ './modules/product-adv/src/admin/**/*.{jsx,ts,tsx}' ],
};

export default updatedConfig;
