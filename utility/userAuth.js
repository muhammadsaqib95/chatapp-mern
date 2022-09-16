const jwt = require('jsonwebtoken');

const userAuth = (req, res, next) => {
    try {
        const token = req.header("x-auth-token");
        if (!token) return res.status(401).json({ msg: "No authentication token, authorization denied." });

        const verified = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
        if (!verified) return res.status(401).json({ msg: "Token verification failed, authorization denied." });
        console.log(verified);
        req.user = verified;
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = userAuth;