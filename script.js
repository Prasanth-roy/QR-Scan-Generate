// Particle background
const particleCanvas = document.getElementById('particle-bg');
const ctx = particleCanvas.getContext('2d');
particleCanvas.width = window.innerWidth;
particleCanvas.height = window.innerHeight;

const particles = [];
for (let i = 0; i < 50; i++) {
  particles.push({
    x: Math.random() * particleCanvas.width,
    y: Math.random() * particleCanvas.height,
    size: Math.random() * 5 + 2,
    speedX: Math.random() * 0.5 - 0.25,
    speedY: Math.random() * 0.5 - 0.25
  });
}

function animateParticles() {
  ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fill();
    p.x += p.speedX;
    p.y += p.speedY;
    if (p.x < 0 || p.x > particleCanvas.width) p.speedX *= -1;
    if (p.y < 0 || p.y > particleCanvas.height) p.speedY *= -1;
  });
  requestAnimationFrame(animateParticles);
}
animateParticles();

// Core functionality
const splash = document.getElementById('splash');
const home = document.getElementById('home');
const scanner = document.getElementById('scanner');
const generator = document.getElementById('generator');
const video = document.getElementById('video');
const canvas = document.getElementById('qr-canvas');
const qrResult = document.getElementById('qr-result');
const qrInput = document.getElementById('qr-input');
const qrGenerated = document.getElementById('qr-generated');
const imageInput = document.getElementById('image-input');
const qrAction = document.getElementById('qr-action');
const qrStatus = document.getElementById('qr-status');

setTimeout(() => {
  splash.style.display = 'none';
  home.style.display = 'flex';
}, 2000);

function showScanner() {
  home.style.display = 'none';
  scanner.style.display = 'flex';
  startScanner();
}

function showGenerator() {
  home.style.display = 'none';
  generator.style.display = 'flex';
  qrStatus.textContent = '';
}

function backToHome() {
  scanner.style.display = 'none';
  generator.style.display = 'none';
  home.style.display = 'flex';
  stopScanner();
  qrAction.innerHTML = '';
  qrStatus.textContent = '';
}

let stream = null;
async function startScanner() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    video.srcObject = stream;
    video.play();
    scanQR();
  } catch (err) {
    qrResult.textContent = 'Error accessing camera: ' + err.message;
  }
}

function stopScanner() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
}

function scanQR() {
  if (!video.srcObject) return;
  const ctx = canvas.getContext('2d');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const code = jsQR(imageData.data, imageData.width, imageData.height);
  if (code) {
    processQRContent(code.data);
    stopScanner();
  } else {
    qrResult.textContent = 'Scanning...';
    requestAnimationFrame(scanQR);
  }
}

function openGallery() {
  imageInput.click();
}

imageInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const img = new Image();
  img.onload = () => {
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    if (code) {
      processQRContent(code.data);
      stopScanner();
    } else {
      qrResult.textContent = 'No QR code found in the image.';
      qrAction.innerHTML = '';
    }
  };
  img.src = URL.createObjectURL(file);
});

function processQRContent(data) {
  qrResult.textContent = `Result: ${data}`;
  qrAction.innerHTML = '';
  
  // Check if it's a phone number
  const phoneRegex = /^(tel:)?\+?\d{10,15}$/;
  if (data.startsWith('tel:') || phoneRegex.test(data)) {
    const phone = data.startsWith('tel:') ? data.replace('tel:', '') : data;
    qrResult.textContent = `Phone Number: ${phone}`;
    const callBtn = document.createElement('button');
    callBtn.className = 'action-btn';
    callBtn.textContent = 'Call';
    callBtn.onclick = () => window.open(`tel:${phone}`, '_self');
    qrAction.appendChild(callBtn);
    return;
  }
  
  // Check if it's a payment link
  const paymentRegex = /^(upi:\/\/|https?:\/\/(www\.)?(paypal\.me|paytm\.me|phonepe\.com|pay\.google\.com))/i;
  if (paymentRegex.test(data)) {
    qrResult.textContent = `Payment Link: ${data}`;
    const payBtn = document.createElement('button');
    payBtn.className = 'action-btn';
    payBtn.textContent = 'Pay';
    payBtn.onclick = () => window.open(data, '_blank');
    qrAction.appendChild(payBtn);
    return;
  }
  
  // Default case
  qrResult.textContent = `Content: ${data}`;
}

// Simulated backend for QR generation
async function processQRInput(url) {
  return new Promise((resolve, reject) => {
    // Validate URL
    const urlRegex = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+[/#?]?|localhost)(.*)$/;
    if (!url || !urlRegex.test(url)) {
      reject('Please enter a valid URL (e.g., https://example.com)');
      return;
    }
    // Simulate processing delay
    setTimeout(() => {
      resolve(url.startsWith('http') ? url : `https://${url}`);
    }, 1000);
  });
}

async function generateQR() {
  qrStatus.textContent = 'Generating QR code';
  qrStatus.className = 'status-message loading';
  qrGenerated.innerHTML = '';
  
  try {
    const url = await processQRInput(qrInput.value.trim());
    new QRCode(qrGenerated, {
      text: url,
      width: 256,
      height: 256,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });
    qrStatus.textContent = '';
    qrStatus.className = 'status-message';
  } catch (error) {
    qrStatus.textContent = error;
    qrStatus.className = 'status-message error';
  }
}

function downloadQR() {
  const qrCanvas = qrGenerated.querySelector('canvas');
  if (!qrCanvas) {
    qrStatus.textContent = 'Please generate a QR code first';
    qrStatus.className = 'status-message error';
    return;
  }
  const link = document.createElement('a');
  link.href = qrCanvas.toDataURL('image/png');
  link.download = 'qr-code.png';
  link.click();
}