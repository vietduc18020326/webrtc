import {ADD_STREAM, MY_STREAM, ADD_REMOTE_STREAM} from '../actions/type';

const initialState = {
  myStream: null,
  streams: [],
};

export default (state = initialState, {type, payload}) => {
  switch (type) {
    case MY_STREAM:
      return {
        ...state,
        myStream: payload,
      };
    case ADD_STREAM:
      return {
        ...state,
        streams: [...state.streams, payload],
      };
    default:
      return state;
  }
};
