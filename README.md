# create-model

> based on dva

> 根据 api 生成 model

### Demo

📙 [create-model-demo](https://github.com/zlinggnilz/create-model-demo)

### api 文件

```js
// ----- api 文件 ----- //
// 简易, 默认为 get 请求
export const demoTest = {
  url: '/api/test',
};

// 全部属性
export const demoSidApi = {
  default: {}, // 存在 state 中的默认值, 若无 default, 将不在 state 中保存数据
  method: 'post', // 默认为 get
  url: '/api/getDetail/{sid}', // url 上有需要替换的参数
  payload: null, // 请求时需携带的默认参数
  promise: false, // effects 是否返回promise, 默认 false
  handleValue: (data, payload) => {
    // 在 state 中保存处理后的数据
    let newData = data;
    // 处理data, 返回处理后的数据
    return newData;
  },
  dataKey: '', // 默认直接保存返回的 data, 如果只需要保存 data["list"], 则为 dataKey:"list", 与 handleValue 不可同时使用
  error: false, // 请求出错时, 是否在 state 中保存错误布尔值, 在原本名称后加 'Error', 如该请求出错时, state 中将保存 demoSidApiError: true
};
```

### config 设置 request

```js
// 需提供 request
// 在最外层 或 所有请求之前设置 request
// 考虑到请求拦截都写的各不相同, 没有将 request 一起封装
// 若有更好的想法, 欢迎提出
import { config } from 'create-model';
import service from '../request';

config({ request: service });
```

> **重要**  
> **request 请求后，返回结果需包含 `data`，如 `{ data:{ userId:'111'}, code:0 }`，`createModel` 将保存 `data` 到 `state`。需要在 response 拦截器中处理好。**

### model 文件

```js
// ----- models/demo.js ----- //
import { createModel } from 'create-model';
import * as apis from '@/api/demo';

// ----- model中需要自定义的内容 ----- //
const defaultModel = {
  /*
    ...
  */
}
export default { namespace: 'demo', ...createModel(apis, defaultModel) };


// ----- 不需要自定义内容, 全部由 api 生成 ----- //
export default { namespace: 'demo', ...createModel(apis) };
```

### 组件使用

```js
// ----- 组件文件中使用 ----- //
// URL 替换参数示例
dispatch({
  type: 'common/demoSidApi',
  payload: {
    _replace: { sid: '123' }, // 替换 url 上的 sid, 接口为 /api/getDetail/{sid}
    _data: { status: 1 }, // 给接口使用的, 没有写在 _data 中的其他数据, 会与 _data 中的一起提交给请求
    _params: { type: 1 }, // 给接口使用的，如果需要在 url 后面拼接參數
  },
});

// 如果不需要执行 replace, 可以直接将入参写在 payload 里

// 基础示例
dispatch({
  type: 'common/demoTest',
  payload: { status: 1 }, // 没有写在 _data 中的数据也会提交给请求
});

// 返回Promise
dispatch({
  type: 'common/demoPromise',
  payload: { status: 1 },
}).then((data) => {
  console.log(data);
});
```
