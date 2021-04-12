import React, {useState, useEffect, useRef} from 'react';
import {Text, View, TextInput, Button, StyleSheet} from 'react-native';
import {mediaDevices, RTCView} from 'react-native-webrtc';
import io from 'socket.io-client';
import Peer from 'react-native-peerjs';

const socket = io('http://192.168.0.101:5000', {jsonp: false});
const VideoCall = (props) => {
  const [me, setMe] = useState('');
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState('');
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [idToCall, setIdToCall] = useState('');
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState('');
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    let isFront = true;
    mediaDevices.enumerateDevices().then((sourceInfos) => {
      console.log(sourceInfos);
      let videoSourceId;
      for (let i = 0; i < sourceInfos.length; i++) {
        const sourceInfo = sourceInfos[i];
        if (
          sourceInfo.kind == 'videoinput' &&
          sourceInfo.facing == (isFront ? 'front' : 'environment')
        ) {
          videoSourceId = sourceInfo.deviceId;
        }
      }
      mediaDevices
        .getUserMedia({
          audio: true,
          video: {
            width: 640,
            height: 480,
            frameRate: 30,
            facingMode: isFront ? 'user' : 'environment',
            deviceId: videoSourceId,
          },
        })
        .then((stream) => {
          console.log(stream);
          setStream(stream);
          myVideo.current.srcObject = stream;
        })
        .catch((error) => {
          // Log error
        });
    });

    socket.on('me', (id) => {
      setMe(id);
      console.log(me, 1);
    });

    socket.on('callUser', (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(data.signal);
    });
  }, []);

  const callUser = (id) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });
    peer.on('signal', (data) => {
      socket.emit('callUser', {
        userToCall: id,
        signalData: data,
        from: me,
        name: name,
      });
    });
    peer.on('stream', (stream) => {
      userVideo.current.srcObject = stream;
    });
    socket.on('callAccepted', (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });
    console.log(peer);
    console.log(me);
    console.log(1);

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });
    peer.on('signal', (data) => {
      socket.emit('answerCall', {signal: data, to: caller});
    });
    peer.on('stream', (stream) => {
      userVideo.current.srcObject = stream;
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();
  };

  const InputId = (text) => {
    setIdToCall(text);
  };

  return (
    <View>
      <View>
        <Text>Your video: {me}</Text>
        <RTCView
          streamURL={stream ? stream.toURL() : ''}
          style={styles.videos}
        />
      </View>
      <View>
        <TextInput placeholder="Input Id" onChangeText={InputId} />
        {callAccepted && !callEnded ? (
          <Button title="End Call" onPress={leaveCall} />
        ) : (
          <Button title="Call" onPress={() => callUser(idToCall)} />
        )}
      </View>
      {receivingCall && !callAccepted ? (
        <View>
          <Text>{name} is calling ...</Text>
          <Button title="Answer" onPress={answerCall} />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  videos: {
    width: 200,
    height: 150,
  },
});

export default VideoCall;
