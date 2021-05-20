import React, {useContext} from 'react'
import { Button } from '@material-ui/core';

import { SocketContext } from '../SocketContext';

const Notifications = () => {
    const { answerCall, call, callAccepted } = useContext(SocketContext);
    return (
        <>
            {call.isReceivingCall && !callAccepted && (
                 <div styles={{ display: 'flex', justifyContent: 'space-around'}}>
                     <h1>{call.name} is calling: </h1>
                     <Button variant="contained" color="inherit" onClick={answerCall} >
                        Answer
                     </Button>
                 </div>
            )}
        </>
    )
}

export default Notifications