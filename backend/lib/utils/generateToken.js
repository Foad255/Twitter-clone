// jsonwebtoken to create JSON Web Token    
import jwt from 'jsonwebtoken'


const generateTokenAndSetCookie =  (userId, res) => {
  // generate a token carry information (userId)  and its sign is secret (JWT_SECRET) available for like 15 days  (expiresIn: '15d')
const token = jwt.sign({userId}, process.env.JWT_SECRET, {
  expiresIn: '15d'
})
  // token = something like that
  // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9. Header specifice algorithm  eyJ1c2VySWQiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNjA2OTMzOTAyLCJleHAiOjE2MDc4MjkzMDJ9. userId and other information like (ex:'15')
  // SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c. using the secret key create a Signature


// cookie(nameOfCookie, valueOfCookie (token)
res.cookie('jwt', token, {
  maxAge: 15*24*60*60*1000 ,// milla second
  httpOnly: true, // prevent XSS attacks cross-site scripting attacks
  sameSite: 'strict', // CSRF attack cross-site requiest forgery attacks
  secure: process.env.NODE_ENV !== 'development', // secure will be true only in production
})
}

export default generateTokenAndSetCookie



    //  I don't want to verify the username and password with every request 


// sessions : state-based, carry a session ID   , server-side control and state

// tokens : stateless means that server doesn't need to store a session infromation,  carry minimal data like userId, scalability and distributed system

// JWT:   carry self-contained payloads 