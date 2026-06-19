const getUrlsToTry = () => {
  const urls = [];
  if (process.env.REACT_APP_BACKEND_URL) {
    urls.push(process.env.REACT_APP_BACKEND_URL);
  }
  if (!urls.includes('http://localhost:4000')) {
    urls.push('http://localhost:4000');
  }
  if (!urls.includes('http://localhost:4001')) {
    urls.push('http://localhost:4001');
  }
  return urls;
};

let resolvedBackendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';

export const getBackendUrl = () => resolvedBackendUrl;

const tryFetch = async (url, options) => {
  console.log(`[API CHECKPOINT] Fetching: ${url}`);
  const response = await fetch(url, options);
  if (!response.ok) {
    console.error(`[API CHECKPOINT] Fetch failed for ${url} with status: ${response.status}`);
    throw new Error(`Network response was not ok: ${response.status}`);
  }
  console.log(`[API CHECKPOINT] Fetch succeeded for: ${url}`);
  return response;
};

export const apiFetch = async (path, options = {}) => {
  const urls = getUrlsToTry();
  let lastError;

  console.log(`[API CHECKPOINT] Resolving backend URL for path "${path}". Trying sources:`, urls);

  for (const baseUrl of urls) {
    const url = `${baseUrl}${path}`;
    try {
      const response = await tryFetch(url, options);
      if (resolvedBackendUrl !== baseUrl) {
        console.log(`[API CHECKPOINT] Switching active backend URL from "${resolvedBackendUrl}" to "${baseUrl}"`);
        resolvedBackendUrl = baseUrl;
      }
      return response;
    } catch (error) {
      console.warn(`[API CHECKPOINT] Failed to connect to backend at "${baseUrl}":`, error.message);
      lastError = error;
    }
  }
  console.error(`[API CHECKPOINT] All backend connection options failed! Last error:`, lastError);
  throw lastError;
};

export const backendImageUrl = (imagePath) => {
  if (!imagePath) {
    return '';
  }
  if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
    return imagePath;
  }
  const resolvedUrl = `${getBackendUrl()}${imagePath}`;
  console.log(`[IMAGE CHECKPOINT] Resolving image path "${imagePath}" to "${resolvedUrl}"`);
  return resolvedUrl;
};
