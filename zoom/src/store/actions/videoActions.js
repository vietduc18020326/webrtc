import IO from 'socket.io-client';
import Peer from 'react-native-peerjs';

import {ADD_STREAM, MY_STREAM, ADD_REMOTE_STREAM} from './type';

export const API_URI = `http://192.168.0.101:5000`;

//* Socket config *//
export const socket = IO(`${API_URI}`, {
  forceNew: true,
});
socket.on('connection', () => console.log('Connected client'));

const peerSever = new Peer(undefined, {
  host: '192.168.0.101',
  secure: false,
  path: '/mypeer',
});
peerSever.on('error', console.log);

export const joinRoom = (stream) => async (dispatch) => {
  const roomID = 'scnadjvcnjad3cdvsv';
  dispatch({type: MY_STREAM, payload: stream});
  peerSever.on('open', (userId) => {
    socket.emit('join-room', {userId, roomID});
  });
  socket.on('user-connected', (userId) => {
    connectToNewUser(userId, stream, dispatch);
  });
  peerSever.on('call', (call) => {
    call.answer(stream);
    call.on('stream', (stream) => {
      dispatch({type: ADD_STREAM, payload: stream});
    });
  });
};

function connectToNewUser(userId, stream, dispatch) {
  const call = peerSever.call(userId, stream);
}
