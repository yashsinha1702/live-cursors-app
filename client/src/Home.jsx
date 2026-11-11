import { useEffect,useRef } from 'react'
import useWebSocketModule from 'react-use-websocket'
const useWebSocket = useWebSocketModule.default ?? useWebSocketModule
import throttle from 'lodash.throttle'


import { Cursor } from './components/Cursor'


const renderCursors=users=>{
    return Object.keys(users).map(uuid=>{
        const user=users[uuid]

        return(
            <Cursor key={uuid} point={[user.state.x,user.state.y]}/>
        )
    })
}

const renderUsersList = users=>{
    return(
        <u1>
            {Object.keys(users).map(uuid=>{
                return <li key={uuid}>{JSON.stringify(users[uuid])}</li>
            })}
        </u1>
    )
}

export function Home({username}){


    const ws_url='ws://127.0.0.1:8000'
    const {sendJsonMessage,lastJsonMessage}=useWebSocket(ws_url,{
        queryParams:{username}
    })

    const THROTTLE=50
    const sendJsonMessageThrottled=useRef(throttle(sendJsonMessage,THROTTLE))

    useEffect(() =>{

        sendJsonMessage({
            x:0,
            y:0
        })
        const onMove=e=>{
            
            sendJsonMessageThrottled.current({
                x: e.clientX,
                y: e.clientY
            })
        }
        window.addEventListener("mousemove",onMove)
        return () => window.removeEventListener("mousemove",onMove)
    },[])

    if(lastJsonMessage){
        return<>
            {renderCursors(lastJsonMessage)}
            {renderUsersList(lastJsonMessage)}
        </>
    }
    return <h1> Hello, {username} </h1>
}