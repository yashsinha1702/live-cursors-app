const http = require('http')
const {WebSocketServer} = require('ws')
const server= http.createServer()
const url=require('url')
const wsServer=new WebSocketServer({server:server})
const port =8000
const uuidv4=require('uuid').v4


const connections={}

const users={}

const broadcast= () => {
    Object.keys(connections).forEach(uuid=> {
        const connection=connections[uuid]
        const message=JSON.stringify(users)
        connection.send(message)
    })
}

const handleMessage=(bytes,uuid) => {
    const message= JSON.parse(bytes.toString())
    console.log(message)

    const user=users[uuid]

    user.state=message

    broadcast()

    console.log(`${user.username} updated their state to ${JSON.stringify(user.state)}` )
}

const handleClose= uuid => {

    console.log(`${users[uuid].username} disconnected`)
    delete connections[uuid]
    delete users[uuid]

    broadcast()
}

wsServer.on("connection", (connection,request) =>{
    const {username} = url.parse(request.url,true).query
    const uuid=uuidv4()
    console.log(username)
    console.log(uuid)
    connections[uuid]=connection
    
    users[uuid]={
        username:username,
        state:{
            x:0,
            y:0
        }
    }

    connection.on("message", message=> handleMessage(message,uuid))
    connection.on("close", ()=> handleClose(uuid))

})
server.listen(port , () => {
    console.log(`Web socket server is running on port ${port}`)
})