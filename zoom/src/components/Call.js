import React from 'react';
import {View, Dimensions, StyleSheet, ScrollView} from 'react-native';
import {mediaDevices, RTCView} from 'react-native-webrtc';

import {connect} from 'react-redux';
import {joinRoom} from './src/store/actions/videoActions';
const {width, height} = Dimensions.get('window');

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
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
          this.props.joinRoom(stream);
        })
        .catch((error) => {
          // Log error
        });
    });
  }
  render() {
    const {streams} = this.props.video;
    console.log(streams, streams.length);

    return (
      <View style={styles.screen}>
        <View style={styles.screenTop}>
          {this.props.video.myStream ? (
            <RTCView
              streamURL={this.props.video.myStream.toURL()}
              style={{width: 200, height: 100}}
            />
          ) : null}
        </View>
        <View style={styles.screenBottom}>
          <ScrollView horizontal style={{padding: 10}}>
            <>
              <>
                {[1].map((_, index) => (
                  <View key={index} style={styles.item}>
                    {/* <RTCView
                      streamURL={this.props.video.myStream.toURL()}
                      style={{width: 200, height: 100}}
                    /> */}
                  </View>
                ))}
              </>
            </>
            <>
              <View style={styles.lastItem}></View>
            </>
          </ScrollView>
        </View>
      </View>
    );
  }
}
const mapStateToProps = ({video}) => ({
  video,
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'flex-start',
    padding: 10,
  },
  screenTop: {
    flex: 1,
    justifyContent: 'center',
    height: 150,
    borderColor: 'yellow',
    borderWidth: 4,
  },
  screenBottom: {
    flex: 1,
    backgroundColor: 'black',
  },
  item: {
    width: 250,
    backgroundColor: 'red',
    borderWidth: 1,
    borderColor: '#fff',
    marginRight: 10,
    padding: 5,
  },
  lastItem: {
    width: 170,
    backgroundColor: 'blue',
    borderWidth: 1,
    borderColor: '#fff',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default connect(mapStateToProps, {joinRoom})(App);
