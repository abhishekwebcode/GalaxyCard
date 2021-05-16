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

function showResult({props, navigation}) {
    console.log(props, navigation);
    return <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <Text>Home Screen</Text>
        <Button onPress={() => navigation.push('Home')} title={"Home"}>
        </Button>
    </View>
}

function HomeScreen({navigation}) {
    const [isCameraGranted, setGranted] = useState(true);
    const [isDenied, setDenied] = useState(false);
    const [cameraDevices, setCameraDevices] = useState({});
    const [deviceId, setDeviceId] = useState(null);
    Camera.getAvailableCameraDevices().then(devices => {
        if (devices.length === 0) {
            return;
        }
        const deviceId = devices;
        setDeviceId(devices);
    });
    useEffect(() => {
        Camera.getCameraPermissionStatus().then(async () => {
            const permission = await Camera.requestCameraPermission();
            if (permission === 'authorized') {
                //setGranted(true);
            } else {
                console.log(`DENIED`)
                //setDenied(true);
            }
        });
    }, [setDenied, setGranted]);
    if (isDenied) {
        return (
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <Text>
                    Camera Permission Was Denied
                </Text>
            </View>
        );
    }
    if (deviceId !== null) {
        console.log(deviceId, `INSIDE REN`)
        return <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Camera
                style={StyleSheet.absoluteFill}
                device={deviceId[0]}
                isActive={true}
            />
        </View>
    }
    return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Text>Home Screen</Text>
            <Button onPress={() => navigation.push('Result',)} title={"Secondd"}>
            </Button>
        </View>
    );
}

const Stack = createStackNavigator();


const styles = StyleSheet.create({
    sectionContainer: {
        marginTop: 32,
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '600',
    },
    sectionDescription: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: '400',
    },
    highlight: {
        fontWeight: '700',
    },
});

class CameraComponent extends React.Component {
    constructor(props) {
        super(props);
        this.camera = React.createRef();
        this.device = null;
        this.state = {
            permissionGranted:false,
            devicesAvailable:false,
            cameraReady:false,
        };
    
    }

    
    checkPermission() {
        Camera.getCameraPermissionStatus().then(async () => {
            const permission = await Camera.requestCameraPermission();
            if (permission === 'authorized') {
                this.setState({
                    permissionGranted:true,
                });
            } else {
                console.log(`DENIED`)
            }
        });
    }

    componentDidMount() {
    }

    getDevices() {
        Camera.getAvailableCameraDevices().then(devices=>{
            console.log(`GET DEVICES`,devices);
            this.device=devices[0];
            this.setState({
                devicesAvailable:true
            })
        });
    }

    async takePhoto() {
        console.log(`TAKING`);
        const photo = await this.camera.current.takePhoto({flash: 'on'});
        console.log(photo)
    }

    cameraStarted() {
        console.log(`started`)
        return this.takePhoto();
    }

    render() {
        if (this.state.permissionGranted===false) {
            this.checkPermission();
            return <Text>Please Grant Camera Permission</Text>
        }
        if (this.state.devicesAvailable===false) {
            this.getDevices();
            return <Text>Fetching Devices</Text>
        }
        if (this.device) {
            return <Camera
                style={StyleSheet.absoluteFill}
                device={this.device}
                isActive={true}
                onInitialized={()=>this.cameraStarted()}
                ref={this.camera}
            />
        }
        return <Text>Unknown Error Occured</Text>
    }
}

function cameraTest() {
    const [isDenied, setDenied] = useState(false);

    
    if (isDenied) {
        return (
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <Text>
                    Camera Permission Was Denied
                </Text>
            </View>
        );
    }
}

export default CameraComponent;
