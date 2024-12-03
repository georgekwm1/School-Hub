import ImageKit from 'imagekit-javascript';
import { setError } from '../redux/actions/uiActionCreators';
import {DOMAIN} from './constants'

export const imagekit = new ImageKit({
  publicKey: 'public_tTc9vCi5O7L8WVAQquK6vQWNx08=',
  urlEndpoint: 'https://ik.imagekit.io/loayalsaid1/proLearningHub',
});

export const extractVideoId = (url) => {
  const regex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|embed|e|shorts|user)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

export function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date(Date.now() + new Date().getTimezoneOffset() * 60 * 1000);
  const diffInSeconds = Math.floor((now - date) / 1000);

  const SECONDS_IN_A_MINUTE = 60;
  const SECONDS_IN_AN_HOUR = 3600;
  const SECONDS_IN_A_DAY = 86400;
  const SECONDS_IN_A_MONTH = 2592000;

  if (diffInSeconds < SECONDS_IN_A_MINUTE) {
    return 'just now';
  } else if (diffInSeconds < SECONDS_IN_AN_HOUR) {
    const minutes = Math.floor(diffInSeconds / SECONDS_IN_A_MINUTE);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < SECONDS_IN_A_DAY) {
    const hours = Math.floor(diffInSeconds / SECONDS_IN_AN_HOUR);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < SECONDS_IN_A_MONTH) {
    const days = Math.floor(diffInSeconds / SECONDS_IN_A_DAY);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return date.toDateString();
  }
}

/**
 * This replaces the temp image URLs in a given content with the actual URLs after uploading to ImageKit.
 * @param {string} content - The content containing temp image URLs.
 * @param {Array<{file: File, fileUrl: string}>} files - An array of objects containing the file and the corresponding temp image URL.
 * @param {function} dispatch - The Redux dispatch function.
 * @returns {Promise<string>} - The content with all temp image URLs replaced with their actual URLs.
 */
export async function replaceTempImageUrls(content, files, dispatch) {
  let newContent = content;

  try {
    const uploadPromises = files.map(async ({ file, fileUrl }) => {
      const authParamsResponse = await fetch(`${DOMAIN}/auth/imagekit`);
      const authParams = await authParamsResponse.json();
      const uploadResponse = await imagekit.upload({
        file,
        fileName: `Discussion_reply_${Date.now()}`,
        ...authParams,
      });
      return { fileUrl, newUrl: uploadResponse.url };
    });

    const uploadResults = await Promise.all(uploadPromises);
    uploadResults.forEach(({ fileUrl, newUrl }) => {
      newContent = newContent.replace(fileUrl, newUrl);
    });
  } catch (error) {
    dispatch(setError('discussion', `Error uploading file: ${error.message}`));
  }

  return newContent;
}

export async function uploadFile(file, dispatch, name = '') {
  try {
    const authParamsResponse = await fetch(`${DOMAIN}/auth/imagekit`);
    const authParams = await authParamsResponse.json();
    const uploadResponse = await imagekit.upload({
      file,
      fileName: name ? name : `UploadedFile_${Date.now()}`,
      ...authParams,
    });
    return uploadResponse.url;
  } catch (error) {
    dispatch(setError('upload', `Error uploading file: ${error.message}`));
    return null;
  }
}

export const setToken = (type, token) => localStorage.setItem(type, token);
export const getToken = (type) => localStorage.getItem(type);
export const removeToken = (type) => localStorage.removeItem(type);
