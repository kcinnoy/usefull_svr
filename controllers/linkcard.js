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

const S3 = new AWS.S3(awsConfig);

export const uploadImage = async (req, res) => {
    try {
        const { image } = req.body;
        if (!image) return res.status(400).send('No image found');

        const base64Data = new Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64');

        const type = image.split(';')[0].split('/')[1];

        // image params
        const params = {
            Bucket: 'usefull-bucket',
            Key: `${nanoid()}.${type}`,
            Body: base64Data,
            ACL: 'public-read',
            ContentEncoding: 'base64',
            ContentType: `image/${type}`
        };

        // upload to s3
        S3.upload(params, (err, data) => {
            if (err) {
                console.log(err);
                return res.sendStatus(400);
            }
            console.log(data);
            res.send(data);
        });
    } catch (err) {
        console.log(err);
    }
};



export const removeImage = async (req, res) => {
    try { 
        const { image } = req.body;
         // image params
         const params = {
            Bucket: image.Bucket,
            Key: image.Key,
        };
        //send remove request
        S3.deleteObject(params, (err, data) => {
            if (err) {
                console.log(err);
                res.sendStatus(400);
            }
            res.send({ok: true});
        });
    } catch (err) {
        console.log(err)
    }
};