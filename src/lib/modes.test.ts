import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decodeFrame, buildIdentFrame } from './modes.ts';

// Reference frames from "The 1090 MHz Riddle" (J. Sun).
test('identification frame', () => {
  const f = decodeFrame('8D4840D6202CC371C32CE0576098');
  assert.equal(f.df, 17);
  assert.equal(f.icao, '4840D6');
  assert.equal(f.typeCode, 4);
  assert.equal(f.callsign, 'KLM1023');
  assert.ok(f.crcOk);
  assert.equal(f.crcComputed, f.crcReceived);
});

test('airborne position altitude', () => {
  const f = decodeFrame('8D40621D58C382D690C8AC2863A7');
  assert.equal(f.typeCode, 11);
  assert.equal(f.icao, '40621D');
  assert.equal(f.altitudeFt, 38000);
  assert.ok(f.crcOk);
});

test('airborne velocity', () => {
  const f = decodeFrame('8D485020994409940838175B284F');
  assert.equal(f.typeCode, 19);
  assert.equal(f.icao, '485020');
  assert.equal(Math.round(f.speedKt!), 159);
  assert.equal(f.headingDeg!.toFixed(1), '182.9');
  assert.equal(f.verticalRateFpm, -832);
  assert.ok(f.crcOk);
});

test('a flipped bit fails the CRC', () => {
  const f = decodeFrame('8D4840D6202CC371C32CE0576099');
  assert.equal(f.crcOk, false);
  assert.notEqual(f.crcComputed, f.crcReceived);
});

test('bad input is rejected', () => {
  assert.equal(decodeFrame('ZZ').valid, false);
  assert.equal(decodeFrame('').valid, false);
  assert.equal(decodeFrame('8D4840D6202CC371C32CE057609').valid, false);
});

test('non ADS-B downlink formats are reported, not decoded', () => {
  const f = decodeFrame('5D4840D6202CC371C32CE0576098');
  assert.equal(f.df, 11);
  assert.ok(f.error);
});

test('built identification frame round-trips', () => {
  const hex = buildIdentFrame('4B1234', 'TEST01');
  const f = decodeFrame(hex);
  assert.equal(f.icao, '4B1234');
  assert.equal(f.callsign, 'TEST01');
  assert.ok(f.crcOk);
});
