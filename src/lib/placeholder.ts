// Deterministic on-brand gradient "imagery" so the storefront looks
// intentional before real product photos exist. Swap ProductImage.url later.

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

const PAIRS: [string, string][] = [
  ["#0e0e10", "#c9a66b"],
  ["#0e0e10", "#48d6c2"],
  ["#161619", "#e3c895"],
  ["#0e0e10", "#8a8175"],
  ["#1d1d21", "#c9a66b"],
];

export function gradientPlaceholder(seed: string, label = ""): string {
  const h = hash(seed);
  const [a, b] = PAIRS[h % PAIRS.length];
  const angle = h % 360;
  const cx = 30 + (h % 40);
  const cy = 25 + ((h >> 3) % 40);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='1000' viewBox='0 0 800 1000'>
  <defs>
    <linearGradient id='g' gradientTransform='rotate(${angle} 0.5 0.5)'>
      <stop offset='0%' stop-color='${a}'/>
      <stop offset='100%' stop-color='${a}'/>
    </linearGradient>
    <radialGradient id='glow' cx='${cx}%' cy='${cy}%' r='65%'>
      <stop offset='0%' stop-color='${b}' stop-opacity='0.55'/>
      <stop offset='45%' stop-color='${b}' stop-opacity='0.12'/>
      <stop offset='100%' stop-color='${b}' stop-opacity='0'/>
    </radialGradient>
    <filter id='blur'><feGaussianBlur stdDeviation='14'/></filter>
  </defs>
  <rect width='800' height='1000' fill='url(#g)'/>
  <rect width='800' height='1000' fill='url(#glow)'/>
  <ellipse cx='${cx * 8}' cy='${cy * 10}' rx='150' ry='220' fill='${b}' opacity='0.10' filter='url(#blur)'/>
  <text x='400' y='520' font-family='Georgia, serif' font-size='190' fill='${b}' fill-opacity='0.16' text-anchor='middle' letter-spacing='8'>B</text>
  ${
    label
      ? `<text x='400' y='930' font-family='Georgia, serif' font-size='30' fill='#f4f0e9' fill-opacity='0.5' text-anchor='middle' letter-spacing='6'>${label}</text>`
      : ""
  }
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
