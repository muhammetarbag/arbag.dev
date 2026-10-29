// Mode-S / ADS-B (DF17/18) frame decoding. Pure functions, no DOM.

const CRC_GENERATOR = 0xfff409;
const CALLSIGN_CHARSET = '#ABCDEFGHIJKLMNOPQRSTUVWXYZ#####_###############0123456789######';

export interface ModeSFrame {
  valid: boolean;
  error?: string;
  df: number;
  ca: number;
  icao: string;
  typeCode: number;
  callsign?: string;
  altitudeFt?: number;
  speedKt?: number;
  headingDeg?: number;
  verticalRateFpm?: number;
  crcReceived: number;
  crcComputed: number;
  crcOk: boolean;
}

export function hexToBits(hex: string): number[] | null {
  if (!/^[0-9A-Fa-f]{28}$/.test(hex)) return null;
  const bits: number[] = [];
  for (const ch of hex) {
    const n = parseInt(ch, 16);
    for (let i = 3; i >= 0; i--) bits.push((n >> i) & 1);
  }
  return bits;
}

// Remainder of bits(x) divided by the Mode-S generator polynomial.
function remainder(bits: number[]): number {
  let rem = 0;
  for (const bit of bits) {
    const carry = (rem >>> 23) & 1;
    rem = ((rem << 1) | bit) & 0xffffff;
    if (carry) rem ^= CRC_GENERATOR;
  }
  return rem;
}

// Parity field a frame must carry: remainder of the 88 data bits followed by 24 zero bits.
export function parityFor(dataBits: number[]): number {
  return remainder([...dataBits.slice(0, 88), ...new Array(24).fill(0)]);
}

// 1-based inclusive bit range of the 112-bit message, read as an unsigned integer.
function field(bits: number[], from: number, to: number): number {
  let v = 0;
  for (let i = from - 1; i < to; i++) v = v * 2 + bits[i];
  return v;
}

export function decodeFrame(hex: string): ModeSFrame {
  const bits = hexToBits(hex.trim());
  const empty: ModeSFrame = {
    valid: false, df: 0, ca: 0, icao: '', typeCode: 0,
    crcReceived: 0, crcComputed: 0, crcOk: false,
  };
  if (!bits) return { ...empty, error: '28 onaltılık (hex) karakter gerekli' };

  const df = field(bits, 1, 5);
  const ca = field(bits, 6, 8);
  const icao = field(bits, 9, 32).toString(16).toUpperCase().padStart(6, '0');
  const typeCode = field(bits, 33, 37);
  const crcReceived = field(bits, 89, 112);
  const crcComputed = parityFor(bits);
  const frame: ModeSFrame = {
    valid: true, df, ca, icao, typeCode, crcReceived, crcComputed,
    crcOk: remainder(bits) === 0,
  };

  if (df !== 17 && df !== 18) {
    return { ...frame, error: `DF ${df}: bu araç yalnızca DF17/18 (ADS-B) çözer` };
  }

  if (typeCode >= 1 && typeCode <= 4) {
    let cs = '';
    for (let i = 0; i < 8; i++) cs += CALLSIGN_CHARSET[field(bits, 41 + i * 6, 46 + i * 6)];
    frame.callsign = cs.replace(/#/g, '').replace(/_/g, ' ').trim();
  } else if ((typeCode >= 9 && typeCode <= 18) || (typeCode >= 20 && typeCode <= 22)) {
    const code = field(bits, 41, 52);
    if ((code >> 4) & 1) {
      const n = ((code & 0xfe0) >> 1) | (code & 0xf);
      frame.altitudeFt = n * 25 - 1000;
    }
  } else if (typeCode === 19) {
    const subtype = field(bits, 38, 40);
    if (subtype === 1 || subtype === 2) {
      const vewRaw = field(bits, 47, 56);
      const vnsRaw = field(bits, 58, 67);
      if (vewRaw !== 0 && vnsRaw !== 0) {
        const scale = subtype === 2 ? 4 : 1;
        const vew = (vewRaw - 1) * scale * (field(bits, 46, 46) ? -1 : 1);
        const vns = (vnsRaw - 1) * scale * (field(bits, 57, 57) ? -1 : 1);
        frame.speedKt = Math.hypot(vew, vns);
        frame.headingDeg = ((Math.atan2(vew, vns) * 180) / Math.PI + 360) % 360;
      }
      const vrRaw = field(bits, 70, 78);
      if (vrRaw !== 0) {
        frame.verticalRateFpm = (vrRaw - 1) * 64 * (field(bits, 69, 69) ? -1 : 1);
      }
    }
  }
  return frame;
}

// Build a valid DF17 identification frame (TC4) for a callsign; used for self-made examples.
export function buildIdentFrame(icaoHex: string, callsign: string, category = 0): string {
  const bits: number[] = [];
  const push = (v: number, n: number) => { for (let i = n - 1; i >= 0; i--) bits.push((v >> i) & 1); };
  push(17, 5);
  push(5, 3);
  push(parseInt(icaoHex, 16), 24);
  push(4, 5);
  push(category, 3);
  for (const ch of callsign.toUpperCase().padEnd(8, ' ').slice(0, 8)) {
    const idx = ch === ' ' ? CALLSIGN_CHARSET.indexOf('_') : CALLSIGN_CHARSET.indexOf(ch);
    if (idx < 0) throw new Error(`callsign character not encodable: ${ch}`);
    push(idx, 6);
  }
  push(parityFor(bits), 24);
  let hex = '';
  for (let i = 0; i < 112; i += 4) hex += field(bits, i + 1, i + 4).toString(16);
  return hex.toUpperCase();
}
