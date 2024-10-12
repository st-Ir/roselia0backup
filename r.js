const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 2005;

app.use(cors()); // Mengizinkan CORS

// Data
const songs = [
    { title: 'Serenity', artist: 'Ambient Vibes', src: 'https://example.com/serenity.mp3', cover: 'http://cdn.sazumi.moe/f/sv-PSAW1.webp', releaseDate: '2023-05-15', description: 'A journey through tranquil soundscapes.' },
    { title: 'Energetic Beats', artist: 'Roselia', src: 'https://example.com/energetic-beats.mp3', cover: 'http://cdn.sazumi.moe/f/sv-PSAW1.webp', releaseDate: '2022-11-30', description: 'High-energy tracks to get you moving.' },
    { title: 'Acoustic Dreams', artist: 'Strings & Wood', src: 'https://example.com/acoustic-dreams.mp3', cover: 'http://cdn.sazumi.moe/f/sv-PSAW1.webp', releaseDate: '2021-08-22', description: 'Intimate acoustic arrangements.' },
    { title: 'Serenity', artist: 'Ambient Vibes', src: 'https://example.com/serenity.mp3', cover: 'http://cdn.sazumi.moe/f/sv-PSAW1.webp', releaseDate: '2023-05-15', description: 'A journey through tranquil soundscapes.' },
    { title: 'Energetic Beats', artist: 'Roselia', src: 'https://example.com/energetic-beats.mp3', cover: 'http://cdn.sazumi.moe/f/sv-PSAW1.webp', releaseDate: '2022-11-30', description: 'High-energy tracks to get you moving.' },
    { title: 'Acoustic Dreams', artist: 'Strings & Wood', src: 'https://example.com/acoustic-dreams.mp3', cover: 'http://cdn.sazumi.moe/f/sv-PSAW1.webp', releaseDate: '2021-08-22', description: 'Intimate acoustic arrangements.' },
    { title: 'Serenity', artist: 'Ambient Vibes', src: 'https://example.com/serenity.mp3', cover: 'http://cdn.sazumi.moe/f/sv-PSAW1.webp', releaseDate: '2023-05-15', description: 'A journey through tranquil soundscapes.' },
    { title: 'Energetic Beats', artist: 'Roselia', src: 'https://example.com/energetic-beats.mp3', cover: 'http://cdn.sazumi.moe/f/sv-PSAW1.webp', releaseDate: '2022-11-30', description: 'High-energy tracks to get you moving.' },
    { title: 'Acoustic Dreams', artist: 'Strings & Wood', src: 'https://example.com/acoustic-dreams.mp3', cover: 'http://cdn.sazumi.moe/f/sv-PSAW1.webp', releaseDate: '2021-08-22', description: 'Intimate acoustic arrangements.' },
    { title: 'Serenity', artist: 'Ambient Vibes', src: 'https://example.com/serenity.mp3', cover: 'http://cdn.sazumi.moe/f/sv-PSAW1.webp', releaseDate: '2023-05-15', description: 'A journey through tranquil soundscapes.' },
    { title: 'Energetic Beats', artist: 'Roselia', src: 'https://example.com/energetic-beats.mp3', cover: 'http://cdn.sazumi.moe/f/sv-PSAW1.webp', releaseDate: '2022-11-30', description: 'High-energy tracks to get you moving.' },
    { title: 'Acoustic Dreams', artist: 'Strings & Wood', src: 'https://example.com/acoustic-dreams.mp3', cover: 'http://cdn.sazumi.moe/f/sv-PSAW1.webp', releaseDate: '2021-08-22', description: 'Intimate acoustic arrangements.' },
];
  
const albums = [
    { title: 'Album 1', cover: 'http://cdn.sazumi.moe/f/sv-PSAW1.webp', releaseDate: '2020-01-01', description: 'Album pertama' },
    { title: 'Album 2', cover: 'http://cdn.sazumi.moe/f/sv-PSAW1.webp', releaseDate: '2021-01-01', description: 'Album kedua' },
    { title: 'Album 3', cover: 'http://cdn.sazumi.moe/f/sv-PSAW1.webp', releaseDate: '2022-01-01', description: 'Album ketiga' },
    { title: 'Album 4', cover: 'http://cdn.sazumi.moe/f/sv-PSAW1.webp', releaseDate: '2023-01-01', description: 'Album keempat' },
    { title: 'Album 5', cover: 'http://cdn.sazumi.moe/f/sv-PSAW1.webp', releaseDate: '2024-01-01', description: 'Album kelima' },
    { title: 'Album 1', cover: 'http://cdn.sazumi.moe/f/sv-PSAW1.webp', releaseDate: '2020-01-01', description: 'Album pertama' },
    { title: 'Album 2', cover: 'http://cdn.sazumi.moe/f/sv-PSAW1.webp', releaseDate: '2021-01-01', description: 'Album kedua' },
    { title: 'Album 3', cover: 'http://cdn.sazumi.moe/f/sv-PSAW1.webp', releaseDate: '2022-01-01', description: 'Album ketiga' },
    { title: 'Album 4', cover: 'http://cdn.sazumi.moe/f/sv-PSAW1.webp', releaseDate: '2023-01-01', description: 'Album keempat' },
    { title: 'Album 5', cover: 'http://cdn.sazumi.moe/f/sv-PSAW1.webp', releaseDate: '2024-01-01', description: 'Album kelima' },
];
  
const videos = [
    { title: 'Nature Wonders', src: 'https://example.com/video1.mp4', thumbnail: 'http://cdn.sazumi.moe/f/sv-PSAW1.webp' },
    { title: 'City Life', src: 'https://example.com/video2.mp4', thumbnail: 'http://cdn.sazumi.moe/f/sv-PSAW1.webp' },
    { title: 'Space Exploration', src: 'https://example.com/video3.mp4', thumbnail: 'http://cdn.sazumi.moe/f/sv-PSAW1.webp' },
    { title: 'Nature Wonders', src: 'https://example.com/video1.mp4', thumbnail: 'http://cdn.sazumi.moe/f/sv-PSAW1.webp' },
    { title: 'City Life', src: 'https://example.com/video2.mp4', thumbnail: 'http://cdn.sazumi.moe/f/sv-PSAW1.webp' },
    { title: 'Space Exploration', src: 'https://example.com/video3.mp4', thumbnail: 'http://cdn.sazumi.moe/f/sv-PSAW1.webp' },
    { title: 'Nature Wonders', src: 'https://example.com/video1.mp4', thumbnail: 'http://cdn.sazumi.moe/f/sv-PSAW1.webp' },
    { title: 'City Life', src: 'https://example.com/video2.mp4', thumbnail: 'http://cdn.sazumi.moe/f/sv-PSAW1.webp' },
    { title: 'Space Exploration', src: 'https://example.com/video3.mp4', thumbnail: 'http://cdn.sazumi.moe/f/sv-PSAW1.webp' },
    { title: 'Nature Wonders', src: 'https://example.com/video1.mp4', thumbnail: 'http://cdn.sazumi.moe/f/sv-PSAW1.webp' },
    { title: 'City Life', src: 'https://example.com/video2.mp4', thumbnail: 'http://cdn.sazumi.moe/f/sv-PSAW1.webp' },
    { title: 'Space Exploration', src: 'https://example.com/video3.mp4', thumbnail: 'http://cdn.sazumi.moe/f/sv-PSAW1.webp' },
];
  
const merchandiseCategories = [
    {
      category: 'Personil 1',
      items: [
        { name: "Serenity Tour T-Shirt", price: "$25", image: "http://cdn.sazumi.moe/f/sv-PSAW1.webp", description: "High-quality cotton t-shirt from the Serenity Tour." },
        { name: "Acoustic Dreams Vinyl", price: "$30", image: "http://cdn.sazumi.moe/f/sv-PSAW1.webp", description: "Limited edition vinyl of Acoustic Dreams album." },
        { name: "Energetic Beats Poster", price: "$15", image: "http://cdn.sazumi.moe/f/sv-PSAW1.webp", description: "Poster featuring artwork from the Energetic Beats album." },
        { name: "Ambient Vibes Hoodie", price: "$40", image: "http://cdn.sazumi.moe/f/sv-PSAW1.webp", description: "Comfortable hoodie with Ambient Vibes logo." },
        { name: "Roselia Cap", price: "$20", image: "http://cdn.sazumi.moe/f/sv-PSAW1.webp", description: "Stylish cap with Roselia branding." },
      ]
    },
    {
      category: 'Personil 2',
      items: [
        { name: "Strings & Wood Mug", price: "$10", image: "http://cdn.sazumi.moe/f/sv-PSAW1.webp", description: "Ceramic mug with Strings & Wood design." },
        { name: "Concert Ticket", price: "$50", image: "http://cdn.sazumi.moe/f/sv-PSAW1.webp", description: "Ticket for the upcoming concert." },
        { name: "Band Sticker Pack", price: "$5", image: "http://cdn.sazumi.moe/f/sv-PSAW1.webp", description: "Pack of stickers featuring band logos and artwork." },
        { name: "Tour Poster", price: "$10", image: "http://cdn.sazumi.moe/f/sv-PSAW1.webp", description: "Poster from the latest tour." },
        { name: "Band T-Shirt", price: "$25", image: "http://cdn.sazumi.moe/f/sv-PSAW1.webp", description: "T-shirt with band logo." },
      ]
    },
    {
      category: 'Personil 3',
      items: [
        { name: "Roselia Hoodie", price: "$40", image: "http://cdn.sazumi.moe/f/sv-PSAW1.webp", description: "Comfortable hoodie with Roselia logo." },
        { name: "Ambient Vibes Mug", price: "$10", image: "http://cdn.sazumi.moe/f/sv-PSAW1.webp", description: "Ceramic mug with Ambient Vibes design." },
        { name: "Strings & Wood Guitar Pick", price: "$5", image: "http://cdn.sazumi.moe/f/sv-PSAW1.webp", description: "Guitar pick with Strings & Wood logo." },
        { name: "Energetic Beats Phone Case", price: "$20", image: "http://cdn.sazumi.moe/f/sv-PSAW1.webp", description: "Phone case with Energetic Beats design." },
        { name: "Acoustic Dreams Journal", price: "$15", image: "http://cdn.sazumi.moe/f/sv-PSAW1.webp", description: "Journal with Acoustic Dreams cover." },
      ]
    },
    {
      category: 'Personil 4',
      items: [
        { name: "Serenity Tour Pin", price: "$5", image: "http://cdn.sazumi.moe/f/sv-PSAW1.webp", description: "Pin from the Serenity Tour." },
        { name: "Roselia Tote Bag", price: "$30", image: "http://cdn.sazumi.moe/f/sv-PSAW1.webp", description: "Tote bag with Roselia logo." },
        { name: "Ambient Vibes Candle", price: "$20", image: "http://cdn.sazumi.moe/f/sv-PSAW1.webp", description: "Candle with Ambient Vibes scent." },
        { name: "Strings & Wood Guitar Strap", price: "$25", image: "http://cdn.sazumi.moe/f/sv-PSAW1.webp", description: "Guitar strap with Strings & Wood design." },
        { name: "Energetic Beats Water Bottle", price: "$15", image: "http://cdn.sazumi.moe/f/sv-PSAW1.webp", description: "Water bottle with Energetic Beats logo." },
      ]
    },
    {
      category: 'Personil 5',
      items: [
        { name: "Acoustic Dreams Coasters", price: "$10", image: "http://cdn.sazumi.moe/f/sv-PSAW1.webp", description: "Set of coasters with Acoustic Dreams design." },
        { name: "Serenity Tour Sticker", price: "$5", image: "http://cdn.sazumi.moe/f/sv-PSAW1.webp", description: "Sticker from the Serenity Tour." },
        { name: "Roselia Keychain", price: "$8", image: "http://cdn.sazumi.moe/f/sv-PSAW1.webp", description: "Keychain with Roselia logo." },
        { name: "Ambient Vibes Poster", price: "$12", image: "http://cdn.sazumi.moe/f/sv-PSAW1.webp", description: "Poster with Ambient Vibes artwork." },
        { name: "Strings & Wood Cap", price: "$20", image: "http://cdn.sazumi.moe/f/sv-PSAW1.webp", description: "Cap with Strings & Wood logo." },
      ]
    },
];
    
const awards = [
    { name: "Best Startup", year: 2023, organization: "Tech Awards", icon: "🏆", description: "Awarded for our innovative approach to problem-solving." },
    { name: "Most Disruptive", year: 2022, organization: "Innovation Awards", icon: "🎶", description: "Recognized for our ability to challenge the status quo." },
    { name: "Fastest Growing", year: 2021, organization: "Growth Awards", icon: "🚀", description: "Honored for our rapid expansion and market dominance." },
    { name: "Best Employer", year: 2020, organization: "HR Awards", icon: "👔", description: "Recognized for our commitment to employee well-being." },
];
  

// Endpoint untuk mendapatkan data
app.get('/api/songs', (req, res) => {
  res.json(songs);
});

app.get('/api/albums', (req, res) => {
  res.json(albums);
});

app.get('/api/videos', (req, res) => {
  res.json(videos);
});

app.get('/api/merchandise', (req, res) => {
  res.json(merchandiseCategories);
});

app.get('/api/awards', (req, res) => {
  res.json(awards);
});

// Menjalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});