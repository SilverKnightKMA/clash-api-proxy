const express = require('express');
const morgan = require("morgan");
const { createProxyMiddleware } = require('http-proxy-middleware');
const { login, getKeys, revokeKey, createKey, getCookie, getIP } = require('./utils');

const app = express();

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";
const API_SERVICE_URL = process.env.API_SERVICE_URL || "https://api.clashofclans.com/v1";
const DOMAIN = process.env.DOMAIN || "http://localhost:5000";
let ApiKey = null;

app.use(morgan('dev'));

async function generateApiKey() {
    try {
        const { email, password, game } = {
            email: process.env.EMAIL,
            password: process.env.PASSWORD,
            game: process.env.GAME || 'clashofclans'
        };

        if (!email || !password) {
            throw new Error('EMAIL and PASSWORD environment variables are required');
        }

        const whitelist = [];
        const baseUrl = `https://developer.${game}.com/api`;

        const loginResponse = await login({ baseUrl, email, password });
        if (loginResponse?.error) {
            throw new Error(loginResponse.error || 'Login failed');
        }

        const cookie = await getCookie(loginResponse);
        const savedKeys = await getKeys({ baseUrl, cookie });
        if (!Array.isArray(savedKeys)) {
            throw new Error('Unexpected response from getKeys');
        }

        const ip = await getIP();
        const keyWithSameIP = savedKeys.find(key => key.cidrRanges.includes(ip));

        let validApiKey;
        if (keyWithSameIP) {
            validApiKey = keyWithSameIP;
        } else {
            if (savedKeys.length === 10) {
                const keyToRevoke = savedKeys.find(key => !whitelist.includes(key.name));
                console.log('Revoking key:', keyToRevoke);
                await revokeKey({ baseUrl, cookie, keyToRevoke });
            }

            const newKey = await createKey({ baseUrl, cookie, ips: [ip] });
            if (newKey?.error) {
                throw new Error(newKey.error || 'Failed to create new key');
            }
            validApiKey = newKey.key;
        }

        return {
            name: validApiKey.name,
            description: validApiKey.description,
            ipRange: validApiKey.cidrRanges,
            key: validApiKey.key
        };
    } catch (error) {
        console.error('Error in generateApiKey:', error);
        throw error;
    }
}

// Endpoint info
app.get('/info', (req, res) => {
    res.send(`The Clash of Clans API provides near real time access to game related data. ${DOMAIN}/clash_api/players/%2390CL0CYC8 or ${DOMAIN}/update_api`);
});

// Endpoint update_api
app.get('/update_api', async (req, res) => {
    try {
        const result = await generateApiKey();
        ApiKey = result.key;
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// updateApiKey call generateApiKey
async function updateApiKey() {
    try {
        console.log('Getting API key');
        const result = await generateApiKey();
        if (result.key) {
            ApiKey = result.key;
            console.log('API Key updated:', ApiKey);
            return true;
        }
        console.error('Failed to update API key: No key returned');
        return false;
    } catch (error) {
        console.error('Error in updateApiKey:', error);
        return false;
    }
}

// Middleware
const clashAPIMiddleware = async (req, res, next) => {
    try {
        if (!ApiKey) {
            const updateSuccess = await updateApiKey();
            if (!updateSuccess) {
                return res.status(500).json({ error: 'Failed to update API key' });
            }
        }
        req.headers.authorization = `Bearer ${ApiKey}`;
        next();
    } catch (error) {
        console.error('Error in clashAPIMiddleware:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Proxy Middleware
const proxyMiddleware = createProxyMiddleware({
    target: API_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/clash_api': '' },
    onProxyRes: async (proxyRes, req, res) => {
        if (proxyRes.statusCode === 403) {
            const updateSuccess = await updateApiKey();
        } else {
            console.log('Proxy request completed');
        }
    },
});

app.use('/clash_api', clashAPIMiddleware, proxyMiddleware);

app.listen(PORT, HOST, () => {
    console.log(`Starting Proxy at ${HOST}:${PORT}`);
});