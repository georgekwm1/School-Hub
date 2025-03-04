import { createStore, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';
import { composeWithDevTools } from '@redux-devtools/extension';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { createTransform } from 'redux-persist-immutable';
import { fromJS } from 'immutable';
import toastMiddleware from './middlewares/toastMiddleware';
import rootReducer from './rootReducer';

const storeEnhancer = composeWithDevTools(
  applyMiddleware(thunk, toastMiddleware)
);

const immutableTransform = createTransform(
  (inboundState) => inboundState,
  (outboundState) => fromJS(outboundState)
);

const persistConfig = {
  key: 'root',
  storage,
  transforms: [immutableTransform],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);
const store = createStore(persistedReducer, storeEnhancer);
const persistor = persistStore(store);

export { store, persistor };
