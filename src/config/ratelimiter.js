const {createClient} = require('redis')
const client  = createClient()
client.connect()

client.on('connect',() => console.log('redis connected'))

const ratelimiter = async (req, res, next) =>{
    try {
        
   
const ip = req.ip === "::1" ? "127.0.0.1" : req.ip;    console.log("ip", ip)
    let now  = Date.now()
    const WindowSize = 60 * 1000
    const maxRequest = 5

   let timestamp = JSON.parse(await client.get(ip)) || []
    timestamp = timestamp.filter((tp)=>{
       return now - tp < WindowSize
    })
    if(timestamp.length >= maxRequest){
        return res.json({
            message: "Too Many request" 
        })
    }

    timestamp.push(now)

    await client.set(ip, JSON.stringify(timestamp),{
        EX:50
    }),
    
    next()
     } catch (error) {
       console.log(error) 
    }
}

module.exports = ratelimiter