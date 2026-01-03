// src/lib/identity.ts
// Ed25519 identity management library for VUDO
// - Generate Ed25519 keypair using @noble/ed25519
// - Create on first visit
// - Store in localStorage (MVP, IndexedDB later)
// - Export public key as node ID (hex encoded)
// - Sign messages for auth

import * as ed from '@noble/ed25519';

const STORAGE_KEY = 'vudo_identity';

export interface Identity {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
  nodeId: string; // hex encoded public key
}

/**
 * Get existing identity from localStorage or create a new one.
 * Creates identity on first visit and persists it.
 */
export async function getOrCreateIdentity(): Promise<Identity> {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored) {
    try {
      const { publicKey, privateKey } = JSON.parse(stored);
      return {
        publicKey: new Uint8Array(publicKey),
        privateKey: new Uint8Array(privateKey),
        nodeId: bytesToHex(new Uint8Array(publicKey)),
      };
    } catch (error) {
      // If stored data is corrupted, generate new identity
      console.warn('Stored identity corrupted, generating new one');
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  // Generate new Ed25519 keypair
  const privateKey = ed.utils.randomSecretKey();
  const publicKey = await ed.getPublicKeyAsync(privateKey);

  // Store in localStorage (as arrays for JSON serialization)
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    publicKey: Array.from(publicKey),
    privateKey: Array.from(privateKey),
  }));

  return {
    publicKey,
    privateKey,
    nodeId: bytesToHex(publicKey),
  };
}

/**
 * Sign a message using Ed25519 private key.
 * Returns the signature as Uint8Array.
 */
export async function sign(message: Uint8Array, privateKey: Uint8Array): Promise<Uint8Array> {
  return ed.signAsync(message, privateKey);
}

/**
 * Sign a string message (convenience wrapper).
 * Encodes string as UTF-8 before signing.
 */
export async function signMessage(message: string, privateKey: Uint8Array): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  return sign(encoder.encode(message), privateKey);
}

/**
 * Verify a signature against a message and public key.
 */
export async function verify(
  signature: Uint8Array,
  message: Uint8Array,
  publicKey: Uint8Array
): Promise<boolean> {
  return ed.verifyAsync(signature, message, publicKey);
}

/**
 * Verify a string message signature (convenience wrapper).
 */
export async function verifyMessage(
  signature: Uint8Array,
  message: string,
  publicKey: Uint8Array
): Promise<boolean> {
  const encoder = new TextEncoder();
  return verify(signature, encoder.encode(message), publicKey);
}

/**
 * Clear stored identity (useful for testing or reset).
 */
export function clearIdentity(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Check if an identity exists in storage.
 */
export function hasIdentity(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

/**
 * Convert bytes to hex string.
 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Convert hex string to bytes.
 */
export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}
