import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import combinedReducers from './reducers/combinedReducers';

export default function configureStore() {

 return createStore(
  combinedReducers, 
  
  compose(
    applyMiddleware(thunk),
    window.devToolsExtension ? window.devToolsExtension() : f => f
  )

 );
}


