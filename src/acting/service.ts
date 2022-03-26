import { stringify } from 'qs';
import { defaultConfig } from './config';
import { downloadBlob } from './utils';

interface replaceType {
  [key: string]: string | number;
}

const getUrl = (url: String, params?: Object, replace?: replaceType) => {
  if (replace) {
    url = url.replace(/(\{)(.*?)(\})/g, function(match) {
      const matchContent = match.slice(1, match.length - 1);
      if (replace.hasOwnProperty(matchContent)) {
        return String(replace[matchContent]);
      }
      return '';
    });
  }

  if (params) {
    return `${url}?${stringify(params)}`;
  }

  return url;
};

export async function get(method = 'get', apiUrl: string, payload: any) {
  const { params, replace, data, ...rest } = payload || {};
  const url = getUrl(apiUrl, undefined, replace);
  return defaultConfig.request(url, {
    method,
    params: { ...(params || data), ...rest },
  });
}

export async function post(method = 'post', apiUrl: string, payload: any) {
  const { params, replace, data, ...rest } = payload || {};
  const url = getUrl(apiUrl, params, replace);
  return defaultConfig.request(url, { method, data: { ...data, ...rest } });
}

export async function http({ api, payload }: any) {
  const p = api.payload ? { ...api.payload, ...payload } : payload;
  if (api.method === 'post' || api.method === 'put') {
    return post(api.method, api.url, p);
  }
  return get(api.method, api.url, p);
}

// export async function uploadImport(data) {
//   return config.request(imageUploadUrl, {
//     method: 'post',
//     data,
//     headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//   });
// }

export async function httpBlob({ api, payload }: any) {
  const { params, replace, data, ...rest } = payload || {};
  const url = getUrl(api.url, params, replace);
  return defaultConfig
    .request(url, {
      method: api.method || 'get',
      data: { ...data, ...rest },
      responseType: 'blob',
    })
    .then((blob: any) => {
      const { fileName } = api;
      const name = typeof fileName === 'function' ? fileName() : fileName;
      downloadBlob(blob, name);
    });
}
