import { AES, enc } from 'crypto-js';

const secretKey =
  '8a055661caad72a0f4eb95a3e3a9c23fe6a2cfbce9913fecb10443b9b4f979b5';

const encryptData = data => {
  const encryptedData = AES.encrypt(data, secretKey).toString();
  return encryptedData;
};

// Decrypt data
export const decryptData = encryptedData => {
  const decryptedData = AES.decrypt(encryptedData, secretKey).toString(
    enc.Utf8,
  );
  return decryptedData;
};

export const setSecureSessionData = (key, value) => {
  const encryptedValue = encryptData(value);
  sessionStorage.setItem(key, encryptedValue);
};

export const getSecureSessionData = key => {
  const encryptedValue = sessionStorage.getItem(key);
  encryptedValue;
  if (encryptedValue) {
    const decryptedValue = decryptData(encryptedValue);
    return decryptedValue;
  }
  return null;
};
