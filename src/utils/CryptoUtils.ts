import { createHash, createPrivateKey } from 'crypto';

import sshpk from 'sshpk';

import { FrodoError } from '../ops/FrodoError';
import { JwkRsa } from '../ops/JoseOps';

export type FrodoCrypto = {
  /**
   * Parses a private key and returns it
   * Supported private key formats include:
   * - OpenSSH
   * - DNSSEC
   * - JWK
   * @param {string} key The private key
   * @param {string | undefined} passphrase The passphrase for the private key if it is encrypted
   * @param {string | undefined} name The name of the private key (i.e. the name of the file it came from, if applicable); used for error handling
   * @returns {JwkRsa} The private key as JWK
   */
  getPrivateKey(
    key: string,
    passphrase?: string,
    name?: string
  ): Promise<JwkRsa>;
};

export default (): FrodoCrypto => {
  return {
    getPrivateKey(
      key: string,
      passphrase?: string,
      name?: string
    ): Promise<JwkRsa> {
      return getPrivateKey({ key, passphrase, name });
    },
  };
};

/**
 * Parses a private key and returns it
 * Supported private key formats include:
 * - OpenSSH
 * - DNSSEC
 * - JWK
 * @param {string} key The private key
 * @param {string | undefined} passphrase The passphrase for the private key if it is encrypted
 * @param {string | undefined} name The name of the private key (i.e. the name of the file it came from, if applicable); used for error handling
 * @returns {JwkRsa} The unencrypted PKCS#8 PEM encoded private key
 */
export async function getPrivateKey({
  key,
  passphrase,
  name,
}: {
  key: string;
  passphrase?: string;
  name?: string;
}): Promise<JwkRsa> {
  if (!key) {
    throw new FrodoError(`Private key${name ? ` ${name}` : ''} not provided.`);
  }
  // Tries to return JWK
  try {
    // Checks to see if key is valid JSON
    return JSON.parse(key);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    /* Ignore error since private key may still be a supported format */
  }

  try {
    // Will automatically detect the format the private key is in and parse it if it is able to
    const privateKey = sshpk.parsePrivateKey(key, 'auto', {
      filename: name,
      passphrase,
    });

    let jwk;

    // Due to how sshpk is specifically parsing ed25519-based keys, the JWK needs to
    // be created manually and then passed to the 'createPrivateKey' function
    if (privateKey.type === 'ed25519') {
      const manualJwk = {
        kty: 'OKP',
        crv: 'Ed25519',
        // @ts-expect-error A does exist
        x: privateKey.toPublic().part.A.data.toString('base64url'),
        // @ts-expect-error k does exist
        d: privateKey.part.k.data.toString('base64url'),
      };
      jwk = createPrivateKey({ key: manualJwk, format: 'jwk' }).export({
        format: 'jwk',
      }) as JwkRsa;
    } else {
      jwk = createPrivateKey({
        key: privateKey.toString('pkcs8'),
      }).export({ format: 'jwk' }) as JwkRsa;
    }

    jwk.kid = generateThumbprint(jwk);

    console.log(jwk.kid);

    return jwk;
  } catch (error) {
    if (error.name === 'KeyEncryptedError') {
      throw new FrodoError(error.message);
    }

    throw new FrodoError(`Private key${name ? ` ${name}` : ''} not supported.`);
  }
}

/**
 * This generates a deterministic value for the kid property that is missing due to
 * the 'crypto' library not generating it
 * @param {JwkRsa} jwk The JWK
 * @returns {string} The kid value for the JWK
 */
function generateThumbprint(jwk) {
  let canonical;
  switch (jwk.kty) {
    case 'RSA':
      canonical = { e: jwk.e, kty: 'RSA', n: jwk.n };
      break;
    case 'EC':
      canonical = { crv: jwk.crv, kty: 'EC', x: jwk.x, y: jwk.y };
      break;
    case 'OKP':
      canonical = { crv: jwk.crv, kty: 'OKP', x: jwk.x };
      break;
    case 'oct':
      canonical = { k: jwk.k, kty: 'oct' };
      break;
    default:
      throw new Error(`Unsupported kty for thumbprint: ${jwk.kty}`);
  }
  // Members must be in lexicographic order with no whitespace — the literals above are already ordered
  const json = JSON.stringify(canonical);
  return createHash('sha256').update(json).digest('base64url');
}
