const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

app.post('/api/download', async (req, res) => {
    const { platform, url } = req.body;

    try {
        let downloadLinks = [];

        switch (platform) {
            case 'instagram':
                downloadLinks = await handleInstagram(url);
                break;
            case 'tiktok':
                downloadLinks = await handleTikTok(url);
                break;
            case 'youtube':
                downloadLinks = await handleYouTube(url);
                break;
            default:
                return res.status(400).json({ message: 'Platform tidak didukung' });
        }

        if (downloadLinks.length === 0) {
            return res.status(404).json({ message: 'Video tidak ditemukan atau URL tidak valid' });
        }

        res.json({
            size: 'Unknown',
            links: downloadLinks
        });

    } catch (error) {
        res.status(500).json({ message: 'Gagal memproses permintaan' });
    }
});

// Instagram handler (contoh sederhana)
async function handleInstagram(url) {
    // NOTE: Instagram scraping terbatas karena proteksi
    // Gunakan API eksternal seperti instadownloader.co API
    return [{
        quality: 'HD',
        url: `https://api.instagramsave.com/download?url=${encodeURIComponent(url)}`
    }];
}

// TikTok handler
async function handleTikTok(url) {
    try {
        const response = await axios.get(`https://tikwm.com/api/?url=${url}`);
        const data = response.data.data;
        return [
            { quality: 'HD', url: data.play },
            { quality: 'Watermark', url: data.play_wm }
        ];
    } catch {
        return [];
    }
}

// YouTube handler (gunakan API eksternal)
async function handleYouTube(url) {
    return [{
        quality: '720p',
        url: `https://api.youtubedl.org/download?url=${encodeURIComponent(url)}`
    }];
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
