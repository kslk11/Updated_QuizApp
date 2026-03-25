import jwt from "jsonwebtoken"

export const generateToken = (user) => {

    const payload = {
        id: user.id,
        role: user.role_id
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "24d"
    })

    return token
}