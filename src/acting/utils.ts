export const downloadBlob = (content:string, fileName:string='') => {
  const blob = new Blob([content]);
  if ('download' in document.createElement('a')) {
    // 非IE下载
    const elink = document.createElement('a');
    elink.download = fileName;
    elink.style.display = 'none';
    elink.href = URL.createObjectURL(blob);
    document.body.appendChild(elink);
    elink.click();
    URL.revokeObjectURL(elink.href); // 释放URL 对象
    document.body.removeChild(elink);
  } else {
    // IE10+下载
    window.navigator.msSaveBlob(blob, fileName);
  }
};

export const get = (object:any, path:Array<string>|string, value?:any) => {
  try {
    const pathArray = Array.isArray(path)
      ? path
      : path.split('.').filter((key) => key);
    const pathArrayFlat = pathArray.flatMap((part) =>
      typeof part === 'string' ? part.split('.') : part
    );
    const checkValue = pathArrayFlat.reduce(
      (obj, key) => obj && obj[key],
      object
    );
    return checkValue === undefined ? value : checkValue;
  } catch (error) {
    return value;
  }
};
