import get from 'lodash.get';
import * as services from './service';
import type { EffectsMapObject, ReducersMapObjectWithEnhancer } from 'dva';

type Method = 'get' | 'post' | 'delete' | 'put';

export interface ApiItem {
  default?: any;
  method?: Method;
  url: string;
  type?: string;
  payload?: any;
  promise?: boolean;
  handleValue?: Function;
  dataKey?: string;
  error?: boolean;
}

export interface ApisType {
  [key: string]: ApiItem;
}

export interface CreateModelType {
  state?: any;
  reducers?: ReducersMapObjectWithEnhancer;
  effects?: EffectsMapObject;
  // subscriptions?: SubscriptionsMapObject,
}

export function createModel(
  apis: ApisType,
  defaultModel: any = {},
): CreateModelType {
  const defaultState = get(defaultModel, 'state') || {};
  const defulatEffects: EffectsMapObject = get(defaultModel, 'effects') || {};
  const defaultReducer = get(defaultModel, 'reducers') || {};

  Object.keys(apis).forEach((key) => {
    const item = apis[key];
    const hasDefault = item.hasOwnProperty('default');
    if (hasDefault) {
      defaultState[key] = item.default;
    }
    defulatEffects[key] = function* ({ payload }, { put, select, call }): any {
      if (item.error) {
        yield put({
          type: 'save',
          payload: { [key + 'Error']: false },
        });
      }
      try {
        if (item.type === 'blob') {
          yield call(services.httpBlob, { api: item, payload });
        } else {
          const { data } = yield call(services.http, { api: item, payload });

          let d = data;

          const handleV = item.handleValue;
          if (handleV && typeof handleV === 'function') {
            if (
              Object.prototype.toString.call(handleV) ===
              '[object GeneratorFunction]'
            ) {
              d = yield handleV(data, payload);
            } else {
              d = handleV(data, payload);
            }
          } else if (item.dataKey) {
            d = get(d, item.dataKey);
          }
          if (hasDefault) {
            yield put({
              type: 'save',
              payload: { [key]: d },
            });
          }
          if (item.promise) {
            return Promise.resolve(d);
          }
        }
      } catch (error) {
        console.log(`🚀 MODEL effects: 【${key}】 ~ error`, error);
        if (item.error) {
          yield put({
            type: 'save',
            payload: { [key + 'Error']: true },
          });
        }
        if (item.promise) {
          return Promise.reject(error);
        }
      }
    };
  });

  return {
    // namespace: name,
    state: { ...defaultState },
    effects: defulatEffects,
    reducers: {
      ...defaultReducer,
      save(state: any, action: any) {
        return {
          ...state,
          ...action.payload,
        };
      },
      clear(state: any, { payload }: any) {
        const values = Array.isArray(payload)
          ? payload.reduce((total, item) => {
              if (defaultState.hasOwnProperty(item)) {
                total[item] = defaultState[item];
              } else {
                console.error('请确认 api 中定义了', item);
              }
              return total;
            }, {})
          : { [payload]: defaultState[payload] };
        return {
          ...state,
          ...values,
        };
      },
    },
  };
}
