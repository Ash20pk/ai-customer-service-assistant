// For browser-safe encryption/decryption
export function encrypt(text: string): string {
  try {
    // Use encodeURIComponent to handle special characters before base64 encoding
    return btoa(encodeURIComponent(text));
  } catch (error) {
    console.error('Encryption error:', error);
    throw error;
  }
}

export function decrypt(text: string): string {
  try {
    // Decode base64 and then decode URI component
    return decodeURIComponent(atob(text));
  } catch (error) {
    console.error('Decryption error:', error);
    throw error;
  }
}

// For server-side encryption (if needed)
export function serverEncrypt(text: string): string {
  if (typeof window === 'undefined') {
    const crypto = require('crypto');
    const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '';
    const iv = crypto.randomBytes(16);
    const key = crypto.createHash('sha256')
      .update(String(ENCRYPTION_KEY))
      .digest('base64')
      .slice(0, 32);
    
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  }
  return btoa(encodeURIComponent(text));
}

export function serverDecrypt(text: string): string {
  if (typeof window === 'undefined') {
    const crypto = require('crypto');
    const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '';
    const [ivHex, encryptedHex] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const key = crypto.createHash('sha256')
      .update(String(ENCRYPTION_KEY))
      .digest('base64')
      .slice(0, 32);
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString('utf8');
  }
  return decodeURIComponent(atob(text));
} 