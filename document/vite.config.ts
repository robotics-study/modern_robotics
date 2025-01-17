import {defineConfig} from 'vite';


export default defineConfig(({mode}) => {
    return {
        base: mode === 'production' ? '/modern_robotics' : '/',
        server: {
            host: true,
            port: 3000
        }
    }
});
