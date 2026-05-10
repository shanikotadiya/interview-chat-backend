const {createClient} = require('redis')
const client  = createClient()
client.connect()

client.on('connect',() => console.log('redis connected'))

const ratelimiter = async (req, res, next) =>{
    try {
        
   
const ip = req.ip === "::1" ? "127.0.0.1" : req.ip;    console.log("ip", ip)
    let now  = Date.now()
    const WindowSize = 60
    const maxRequest = 5

   const count  = await client.incr(ip)
   if( count ===1 ){
    await client.expire(ip, WindowSize)
   }
    if(count >= maxRequest){
        return res.json({
            message: "Too Many request" 
        })
    }

    next()
     } catch (error) {
       console.log(error) 
    }
}

module.exports = ratelimiter