const { expressjwt: jwt } = require("express-jwt");
const api = process.env.API_URL;
//for version greater than 7.0
function authJwt(){
    const secret = process.env.secret;
    return jwt({
        secret,
        algorithms : ['HS256'],
        isRevoked : isRevoked,
    }).unless({
        path : [
            {url: /\/api\/v1\/products(.*)/ , methods: ['GET', 'OPTIONS'] },
            {url: /\/api\/v1\/categories(.*)/ , methods: ['GET', 'OPTIONS'] },
            {url: /\/api\/v1\/users\/login(.*)/, methods:['POST']},
            {url: /\/api\/v1\/users\/register(.*)/, methods:['POST']},
        ]
    })
}

async function isRevoked(req, payload,done)
{
    if(!payload.isBusinessUser){
        done(null,true)
    }

    done();
}
module.exports = authJwt;