import sshpk from 'sshpk';
import * as jose from 'jose';

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
  // Will automatically detect the format the private key is in and parse it if it is able to
  const privateKey = sshpk.parsePrivateKey(key, 'auto', {
    filename: name,
    passphrase,
  });

  // Manually create the JWK to be imported -> exported if the key is provided with a curve and has 'parts'
  //@ts-expect-error k does exist in part
  if (privateKey.curve && privateKey.part.k) {
    //@ts-expect-error k does exist in part
    const seed = privateKey.part.k.data; // 32 bytes, the private key
    //@ts-expect-error A does exist in part
    const pubKey = privateKey.toPublic().part.A.data; // 32 bytes, the public key

    // base64url encode without padding
    function b64url(bytes) {
      return btoa(String.fromCharCode(...bytes))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    }

    const jwk = {
      kty: 'OKP',
      crv: 'Ed25519',
      d: b64url(seed),
      x: b64url(pubKey),
    } as jose.JWK;

    // @ts-expect-error the returned value is in JwkRsa format
    return jose.exportJWK(
      await jose.importJWK(jwk, 'EdDSA', { extractable: true })
    ) as JwkRsa;
  } else {
    let pemKey;

    try {
      // ECDSA- or Ed25519-based algorithm
      pemKey = await jose.importPKCS8(
        privateKey.toBuffer('pkcs8').toString('utf8'),
        'ES256',
        { extractable: true }
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      // RSA-based algorithm
      pemKey = await jose.importPKCS8(
        privateKey.toBuffer('pkcs8').toString('utf8'),
        'RS256',
        { extractable: true }
      );
    }

    //@ts-expect-error the returned value is in JwkRsa format
    return jose.exportJWK(pemKey) as JwkRsa;
  }
}
