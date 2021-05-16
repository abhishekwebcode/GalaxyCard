/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import React, {useEffect, useState} from 'react';
import {Button, StyleSheet, Text, View,Image} from 'react-native';
import {Camera, useCameraDevices} from 'react-native-vision-camera';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

const Stack = createStackNavigator();
const RNFS = require('react-native-fs');
const App = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="FirstScreen" component={CameraComponent}/>
                <Stack.Screen name="SecondScreen" component={ResultComponent}/>
            </Stack.Navigator>
        </NavigationContainer>
    );
};



const CameraComponentStyles = StyleSheet.create({
    screen: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#5A9BD4',
    },
    cameraElement: {
        width: '100%',
        height: '80%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#B8D2EC',
    },
    captureElement: {
        width: '100%',
        height: '20%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#B8D2EC',
    },
    imageElement: {width:'100%',height:'100%',alignItems:'center',justifyContent:'center',backgroundColor: '#B8D2EC',}
});

class CameraComponent extends React.Component {
    constructor(props) {
        super(props);
        this.navigation=props.navigation;

        console.log(`INPUT`,Object.keys(props));
        this.camera = React.createRef();
        this.device = null;
        this.state = {
            noDevice:false,
            permissionGranted:null,
            devicesAvailable:null,
            cameraReady:false,
            disAllowCapture:true,
        };
    }


    checkPermission() {
        Camera.getCameraPermissionStatus().then(async () => {
            const permission = await Camera.requestCameraPermission();
            console.log({permission})
            if (permission === 'authorized') {
                this.setState({
                    permissionGranted:true,
                });
            } else {
                this.setState({
                    permissionGranted:false,
                });
                console.log(`DENIED`);
            }
        });
    }

    componentDidMount() {
    }

    getDevices() {
        Camera.getAvailableCameraDevices().then(devices=>{
            console.log(`GET DEVICES`,devices);
            if (devices.length===0) {
                return this.setState({noDevice:true});
            }
            this.device=devices[0];
            this.setState({
                devicesAvailable:true
            })
        });
    }

    async takePhoto() {
        if (this.disAllowCapture===true) return;
        const photo = await this.camera.current.takePhoto({flash: 'off'});
        this.navigation.navigate("SecondScreen",{photoObject:photo});
    }

    cameraStarted() {
        this.setState({disAllowCapture:false})
        console.log(`started`)
    }

    render() {
        if (this.state.permissionGranted===null) {
            this.checkPermission();
        }
        if (this.state.permissionGranted===false) {
            return <Text>Please Grant Camera Permission</Text>
        }
        if (this.state.devicesAvailable===null) {
            this.getDevices();
        }
        if (this.state.noDevice===true) {
            return <Text>No CameraAPI2 Devices (You may use android emulator)</Text>
        }
        if (this.state.devicesAvailable===true) {
            return (<View style={CameraComponentStyles.screen}>
                <Camera
                    style={CameraComponentStyles.cameraElement}
                    device={this.device}
                    isActive={true}
                    onInitialized={()=>this.cameraStarted()}
                    ref={this.camera}
                />
                <Button style={CameraComponentStyles.captureElement}  title="Capture Face"
                    onPress={()=>this.takePhoto()}
                >

                </Button>
            </View>)
        }
        console.log(this)
        return <Text>Loading...</Text>
    }
}

class ResultComponent extends React.Component {

    async handleFaceDetection(componentThis) {
        const base64 = await RNFS.readFile(this.photoPath,'base64');
        componentThis.setState({uploading:true})
        try {
            console.log(`SENDING REQ`)
            const url = `http://54.82.125.49:8080/aws`
            //const url = `http://localhost:8080/aws`
            const result = await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fileName: this.fileName,
                    imageData: base64,
                    key: '8Hh7sqGcb7UvQ2nj',
                })
            });
            const resultJson = await result.json();
            if (resultJson.success===false) {
                throw new Error('SERVER ERROR');
            }
            const newState = {finished:true};
            const base64Output = resultJson.outputImage;
            newState.base64NewURI = `data:image/jpg;base64,${base64Output}`;
            componentThis.setState(newState);

            // DEBUG
        } catch(e) {
            console.error(e);
            componentThis.setState({gotError: true})
        }
    }
    render() {
        if (this.state.gotError===true) {
            return (<View style={CameraComponentStyles.screen}>
                <Image source={{uri:this.photoPath}}
                       style={CameraComponentStyles.cameraElement}
                >
                </Image>
                <Text style={CameraComponentStyles.captureElement}>
                    There was an error detecting only 1 face, showing original image
                </Text>
            </View>)
        }
        if (this.state.finished===true) {
            return <Image source={{uri:this.state.base64NewURI}}
                    style={CameraComponentStyles.imageElement}
                >
            </Image>
        }
        if (this.state.uploading===true) {
            return <Text styles={CameraComponentStyles.screen}>Detecting....</Text>
        }
        return <Text>Detecting Faces and Loading....</Text>
    }
    constructor(props) {
        super(props);
        this.navigation=props.navigation;
        this.route=props.route;
        this.photoObject = this.route.params.photoObject;
        console.log(this.photoObject);
        this.photoPath = 'file://'+this.photoObject.path;
        this.fileName = this.photoObject.path.split('/').pop();
        this.state={
            intial:true,
            uploading:false,
            finished:false,
            gotError:false,
            base64NewURI:null,
        };
        this.handleFaceDetection(this).then(()=>{
            this.setState({});
        });
    }

}


export default App;
