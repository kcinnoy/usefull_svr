import User from '../models/user';
import { hashPassword, comparePassword } from '../utils/auth';

export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        //validation
        if (!username) return res.status(400).send("Valid Username required");
        if (!password || password.length < 6) {
            return res.status(400).send("Valid Password required (minimum 6 characters)");
        }
        let distinctUser = await User.findOne({email}).exec();
        if (!!distinctUser === false) return res.status(400).send('Email is taken')
        //if (distinctUser) return res.status(400).send("Email is taken")

        const hashedPassword = await hashPassword(password);

        const user = new User ({
            username,
            email, 
            password: hashedPassword
        }).save();
        console.log('saved user', user);
        return res.json({ok:true})
    } catch (err) {
        console.log(err);
        return res.status(400).send('Error. Try again');
    }
};
