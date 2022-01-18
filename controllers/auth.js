import User from '../models/user';
import { hashPassword, comparePassword } from '../utils/auth';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        //validation
        if (!username) return res.status(400).send("Valid Username required");
        if (!password || password.length < 6) {
            return res.status(400).send("Valid Password required (minimum 6 characters)");
        }
        let distinctUser = await User.findOne({email}).exec();
        if (!!!distinctUser === false) return res.status(400).send('Email is taken')
        //if (distinctUser) return res.status(400).send("Email is taken")

        const hashedPassword = await hashPassword(password);

        const user = new User ({
            username,
            email, 
            password: hashedPassword
        }); 
        await user.save();
        // console.log('saved user', user);
        return res.json({ok:true})
    } catch (err) {
        console.log(err);
        return res.status(400).send('Error. Try again');
    }
};




export const login = async (req, res) => { 
    try{
        //console.log(req.body);
        const {email, password} = req.body

        //check if db has user with req email
        const user = await User.findOne({email}).exec();
        if (!user) return res.status(400).send("No user found")

        // check password
        const match = await comparePassword(password, user.password);

        //create jwt
        const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET, {
            expiresIn:'7d'
        });

        //return user and token to client but exclude hashed password
        user.password = undefined;
        // send token in cookie
        res.cookie('token', token, {
            httpOnly: true,
            //secure: true, // only on https
        });
        //send user as json response
        res.json(user);

    }catch (err) {
        console.log(err);
        return res.status(400).send("Error. Try again.")
    }

};