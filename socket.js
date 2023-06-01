const { Socket } = require('socket.io')

const io = require('socket.io')(8000,{
    cors:{
        origin:'*',
        methods:['GET','POST']
    }
})

let users = []
const addUser = ((userId,userDetails,socketId)=>{
    const socketUser = users.some(user=>user.userId === userId)

    if(!socketUser){
        users.push({userId,userDetails,socketId})
    }
})

const removeUser = (socketid)=>{
    users = users.filter(user => user.socketId !== socketid)
}

const findFriend = (id)=>{
    return users.find(u=>u.userId === id)
}

io.on('connection',(socket)=>{
    console.log('User connected')
    socket.on('addUser',(userId,userDetails)=>{
        addUser(userId,userDetails,socket.id)
        io.emit('getUser',users)
    })

    socket.on('sendMessage',(data)=>{
        const user = findFriend(data.receiverId)
        if(user !== undefined){
            socket.to(user.socketId).emit('getMessage',{
                senderId:data.senderId,
                senderName:data.senderName,
                receiverId:data.receiverId,
                createdAt:data.time,
                senderId:data.senderId,
                message:{
                    text:data.message.text,
                    image:data.message.image
                },
            })
        }
    })

    socket.on('usertyping',(data)=>{
        console.log(data.message)
        const user = findFriend(data.receiverId)
        if(user !== undefined){
            socket.to(user.socketId).emit('typing',{
                senderId:data.senderId,
                receiverId:data.receiverId,
                message:data.message
            })
        }
    })

    socket.on('disconnect',()=>{
        removeUser(socket.id)
        io.emit('getUser',users)
    })
})