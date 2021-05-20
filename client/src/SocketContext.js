import React, { createContext, useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';

const SocketContext = createContext();

const socket = io('https://wolf-of-mafia.herokuapp.com/');
 
const ContextProvider = ({ children }) => {
    const [stream, setStream] = useState(null);
    const [me, setMe] = useState("");
    const [call, setCall] = useState({});
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [name, setName] = useState("");

    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();

    useEffect(() => {
        //when page loads asks user to use their video and audio
        navigator.mediaDevices.getUserMedia({ video: true, audio: true})
            .then((currentStream) => {
                setStream(currentStream);

                myVideo.current.srcObject = currentStream;
            })
        //.on means we are listening for a specific acction
        // this case we are listening for the me action
        socket.on('me', (id) => setMe(id));

        socket.on("calluser", ({from, name: callerName, signal}) => {
            console.log("signal iss: ", signal)
            setCall({isReceivingCall: true, from, name: callerName, signal: signal});
        });
    }, []);

    const answerCall = () => {
        setCallAccepted(true);

        const peer = new Peer({ initiator: false, trickle: false, stream});

        peer.on("signal", (data) => {
            socket.emit('answercall', {signal: data, to: call.from })
        });

        peer.on('stream', (currentStream) => {
          userVideo.current.srcObject = currentStream;  
        });

        console.log('call.signal is:  ', call.signal)
        peer.signal(call.signal);

        connectionRef.current = peer; 
        
    };

    const callUser = (id) => {
        const peer = new Peer({ initiator: true, trickle: false, stream});

        peer.on("signal", (data) => {
            socket.emit('calluser', {userToCall:id, signalData: data, from: me, name })
        });

        peer.on('stream', (currentStream) => {
          userVideo.current.srcObject = currentStream;  
        });

        socket.on('callaccepted', (signal) => {
            setCallAccepted(true);
            peer.signal(signal);
        });
        connectionRef.current = peer; 
    };

    const leaveCall = () => {
        setCallEnded(true);

        connectionRef.current.destroy();

        window.location.reload();
    };

    return(
        // if you pass anything in the value= , you can use it in all of your components
        <SocketContext.Provider value={{call, callAccepted,myVideo,userVideo,stream,name,setName,callEnded,me,callUser,leaveCall,answerCall,
        }}>
            {children}
        </SocketContext.Provider>
    )
}

export {SocketContext, ContextProvider}