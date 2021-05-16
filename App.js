/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import React, {useEffect, useState} from 'react';
import {Button, StyleSheet, Text, View,} from 'react-native';
import {Camera, useCameraDevices} from 'react-native-vision-camera';


import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

const Stack = createStackNavigator();

const App = () => {

    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Home" component={HomeScreen}/>
                <Stack.Screen name="Result" component={showResult}/>
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
});

class CameraComponent extends React.Component {
    constructor(props) {
        super(props);
        this.camera = React.createRef();
        this.device = null;
        this.state = {
            noDevice:false,
            permissionGranted:null,
            devicesAvailable:null,
            cameraReady:false,
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
        console.log(`TAKING`);
        const photo = await this.camera.current.takePhoto({flash: 'on'});
        console.log(photo.path)
    }

    cameraStarted() {
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


export default CameraComponent;

const takenPhoto = {"height": 480, "isRawPhoto": false, "metadata": {"Orientation": 6, "{Exif}": {"ApertureValue": 0, "BrightnessValue": 0, "ColorSpace": 65535, "DateTimeDigitized": "2021:05:16 11:20:34", "DateTimeOriginal": null, "ExifVersion": "0210", "ExposureBiasValue": 0, "ExposureMode": 0, "ExposureProgram": 0, "ExposureTime": 0.01, "FNumber": 2.8, "Flash": 0, "FocalLenIn35mmFilm": 0, "FocalLength": 5, "ISOSpeedRatings": [Array], "LensMake": null, "LensModel": null, "LensSpecification": [Array], "MeteringMode": 0, "OffsetTime": null, "OffsetTimeDigitized": null, "OffsetTimeOriginal": null, "PixelXDimension": 640, "PixelYDimension": 480, "SceneType": 1, "SensingMethod": 1, "ShutterSpeedValue": 0, "SubjectArea": [Array], "SubsecTimeDigitized": "0", "SubsecTimeOriginal": "0", "WhiteBalance": 0}, "{TIFF}": {"DateTime": "2021:05:16 11:20:34", "Make": "Google", "Model": "sdk_gphone_x86", "ResolutionUnit": 2, "Software": null, "XResolution": 72, "YResolution": 72}}, "path": "/data/user/0/com.galaxycard/cache/mrousavy4579955857631926306.jpg", "width": 640}