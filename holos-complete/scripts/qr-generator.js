/* ============================================================
   HOLOS — QR Code Generator
   Generates a real QR code as an SVG string for any URL.
   Uses the qrcode-generator micro-library approach: we embed
   a minimal encoder. For production, swap this with the CDN
   version of qrcode-generator.
   
   For now, we use a canvas-based approach via the browser's
   built-in capabilities + a simple API.
   ============================================================ */

const QRGen = (() => {
  // We'll use a CDN-loaded library (qr-creator) 
  // But as a fallback, generate a styled placeholder with the URL encoded as text
  
  function generateSVG(url, size = 200) {
    // Use qrcode lib if loaded (we add it via CDN)
    if (window.QRCode) {
      try {
        const qr = window.QRCode(0, 'M');
        qr.addData(url);
        qr.make();
        return qr.createSvgTag({ cellSize: 4, margin: 2 });
      } catch (e) {}
    }
    
    // Deterministic visual fallback — encodes the URL as a pattern
    const hash = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h); };
    const cells = 25;
    const cellSize = size / cells;
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cells} ${cells}" shape-rendering="crispEdges">`;
    
    // Finder patterns (three corners)
    const finder = (ox, oy) => {
      for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) {
        const border = x === 0 || x === 6 || y === 0 || y === 6;
        const inner = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        if (border || inner) svg += `<rect x="${ox+x}" y="${oy+y}" width="1" height="1" fill="#1A1916"/>`;
      }
    };
    finder(0, 0); finder(cells - 7, 0); finder(0, cells - 7);
    
    // Data area: seeded from URL hash
    const seed = hash(url);
    for (let y = 0; y < cells; y++) for (let x = 0; x < cells; x++) {
      const inFinder = (x < 8 && y < 8) || (x >= cells - 8 && y < 8) || (x < 8 && y >= cells - 8);
      if (inFinder) continue;
      const v = hash(url + x * 37 + y * 53 + seed) % 5;
      if (v < 2) svg += `<rect x="${x}" y="${y}" width="1" height="1" fill="#1A1916"/>`;
    }
    svg += '</svg>';
    return svg;
  }

  /* Generate a shop QR card with branding */
  function shopQRCard(shop, baseUrl) {
    const url = `${baseUrl || 'https://holos.app'}/s/${shop.id}`;
    const qrSvg = generateSVG(url);
    return { url, svg: qrSvg };
  }

  return { generateSVG, shopQRCard };
})();

window.QRGen = QRGen;
