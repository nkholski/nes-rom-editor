import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import combinedReducers from './reducers/combinedReducers';

export default function configureStore() {
 return createStore(
  combinedReducers,
   applyMiddleware(thunk)
     // && window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
 );
}


