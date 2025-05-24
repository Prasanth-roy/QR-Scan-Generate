const express = require('express');
const QRCode = require('qrcode');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.post('/generate-qr', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }
  try {
    const qrImage = await QRCode.toDataURL(url, {
      width: 256,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' }
    });
    const base64Data = qrImage.replace(/^data:image\/png;base64,/, '');
    res.json({ qrImage: base64Data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});