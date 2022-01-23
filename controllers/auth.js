import User from '../models/user';
import { hashPassword, comparePassword } from '../utils/auth';
import jwt from 'jsonwebtoken';
import AWS from 'aws-sdk';
import { nanoid } from 'nanoid';

const awsConfig = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    apiVersion: process.env.AWS_ACCESS_KEY_ID
};

const SES = new AWS.SES(awsConfig);

export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        //validation
        if (!username) return res.status(400).send('Valid Username required');
        if (!password || password.length < 6) {
            return res.status(400).send('Valid Password required (minimum 6 characters)');
        }
        let distinctUser = await User.findOne({ email }).exec();
        if (!!!distinctUser === false) return res.status(400).send('Email is taken');
        //if (distinctUser) return res.status(400).send("Email is taken")

        const hashedPassword = await hashPassword(password);

        const user = new User({
            username,
            email,
            password: hashedPassword
        });
        await user.save();
        // console.log('saved user', user);
        return res.json({ ok: true });
    } catch (err) {
        console.log(err);
        return res.status(400).send('Error. Try again');
    }
};

export const login = async (req, res) => {
    try {
        //console.log(req.body);
        const { email, password } = req.body;

        //check if db has user with req email
        const user = await User.findOne({ email }).exec();
        if (!user) return res.status(400).send('No user found');

        // check password
        const match = await comparePassword(password, user.password);
        if (!match) return res.status(400).send('Error: Invalid Username or Password');


        //create jwt
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d'
        });

        //return user and token to client but exclude hashed password
        user.password = undefined;
        // send token in cookie
        res.cookie('token', token, {
            httpOnly: true
            //secure: true, // only on https
        });
        //send user as json response
        res.json(user);
    } catch (err) {
        console.log(err);
        return res.status(400).send('Error. Try again.');
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie('token');
        return res.json({ message: 'Signout success' });
    } catch (err) {
        console.log(err);
    }
};

export const currentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password')
            .exec();
        console.log('CURRENT_USER', user);
        return res.json({ ok: true });
    } catch (err) {
        console.log(err);
    }
};

export const sendTestEmail = async (req, res) => {
    // console.log('send email using SES');
    // res.json({ok: true})
    const params = {
        Source: process.env.EMAIL_FROM,
        Destination: {
            ToAddresses: [process.env.EMAIL_FROM]
        },
        ReplyToAddresses: [process.env.EMAIL_FROM],
        Message: {
            Body: {
                Html: {
                    Charset: 'UTF-8',
                    Data: `
                        <html>
                            <h1>Reset password link</h1>
                            <p>Please use the following link to reset your email</p>
                        </html>
                    `
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: ` Subject header placeholder`
            }
        }
    };
    const emailSent = SES.sendEmail(params).promise();

    emailSent
        .then(data => {
            console.log(data);
            res.json({ ok: true });
        })
        .catch(err => {
            console.log(err);
        });
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        console.log(email);

        const shortCode = nanoid(6).toUpperCase();
        const user = await User.findOneAndUpdate({ email }, { passwordResetCode: shortCode });
        if (!user) return res.status(400).send('User not found');

        //email params
        const params = {
            Source: process.env.EMAIL_FROM,
            Destination: {
                ToAddresses: [email]
            },
            //ReplyToAddresses: [process.env.EMAIL_FROM],
            Message: {
                Body: {
                    Html: {
                        Charset: 'UTF-8',
                        Data: `
                            <html>
                                <h1>Reset password</h1>
                                <p>Use this code reset your password /p>
                                <h2>${shortCode}</h2>
                                <i>u.com</i>
                            </html>
                        `
                    }
                },
                Subject: {
                    Charset: 'UTF-8',
                    Data: `Reset password`
                }
            }
        };
        const emailSent = SES.sendEmail(params).promise();
        emailSent
            .then(data => {
                console.log(data);
                res.json({ ok: true });
            })
            .catch(err => {
                console.log(err);
            });
    } catch (err) {
        console.log(err);
    }
};

export const resetPassword = async (req, res) => {

    const { email, resetCode, newPassword } = req.body;
        console.table({email, resetCode, newPassword});
        const hashedPassword = await hashPassword(newPassword);

        const user = User.findOneAndUpdate(
            {
                //find user with these credentials
                email: email,
                passwordResetCode: resetCode,
            },
            {
                //update these properties
                password: hashedPassword,
                passwordResetCode: '',
            }, 
            {new: true},
            (err, data) => {
                if (err || data === null) {
                    console.log("Invalid Reset code");
                    return res.status(400).send('Invalid Reset code');
                }else {
                    //console.log('updated model:', data)
                    res.json({ok:true})
                }
                    
            }
        )
};


