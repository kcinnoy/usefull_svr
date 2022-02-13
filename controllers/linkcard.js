import User from '../models/user';
import { hashPassword, comparePassword } from '../utils/auth';
import jwt from 'jsonwebtoken';
import AWS from 'aws-sdk';
import { nanoid } from 'nanoid';
import Linkcard from '../models/linkcard';
import slugify from 'slugify';
import {readFileSync} from 'fs';

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
            Key: image.Key
        };
        //send remove request
        S3.deleteObject(params, (err, data) => {
            if (err) {
                console.log(err);
                res.sendStatus(400);
            }
            res.send({ ok: true });
        });
    } catch (err) {
        console.log(err);
    }
};

export const createLinkcard = async (req, res) => {
    // console.log("CREATE LINKCARD", req.body);
    // return;
    try {
        const alreadyExist = await Linkcard.findOne({
            slug: slugify(req.body.name.toLowerCase())
        });
        if (alreadyExist) return res.status(400).send('Title is taken');

        const linkcard = await new Linkcard({
            slug: slugify(req.body.name),
            account: req.user._id,
            ...req.body
        }).save();

        res.json(linkcard);
    } catch (err) {
        console.log(err);
        return res.status(400).send('Linkcard create failed. Try again.');
    }
};

export const read = async (req, res) => {
    try {
        const linkcard = await Linkcard.findOne({ slug: req.params.slug })
            .populate('account', '_id name')
            .exec();
        res.json(linkcard);
    } catch (err) {
        console.log(err);
        return res.status(400).send('Linkcard create failed. Try again.');
    }
};

export const uploadVideo = async (req, res) => {
    try{
        //console.log('req.user.id', req.user._id);
        //console.log('req.params.accountId', req.params.accountId);
        if(req.user._id != req.params.accountId) {
            return res.status(400).send('Unauthorized');
        }

        const {video} =  req.files;
        if (!video) return res.status(400).send('No video');
        //console.log(video);

        //video params
        const params = {
            Bucket: 'usefull-bucket',
            Key: `${nanoid()}.${video.type.split('/')[1]}`,
            Body: readFileSync(video.path),
            ACL: 'public-read',
            //ContentEncoding: 'base64',
            ContentType: video.type
        };

        S3.upload(params, (err, data) => {
            if (err) {
                console.log(err);
                res.sendStatus(400);
            }
            console.log(data)
            res.send(data)
        });

    } catch (err) {
        console.log(err)
    }
}


export const removeVideo = async (req, res) => {
    try{
        
        if(req.user._id != req.params.accountId) {
            return res.status(400).send('Unauthorized');
        }

        const {Bucket, Key} =  req.body;
        // console.log(video);
        // return;
        //if (!video) return res.status(400).send('No video');
        //console.log(video);

        //video params
        const params = {
            Bucket,
            Key,
        };

        S3.deleteObject(params, (err, data) => {
            if (err) {
                console.log(err);
                res.sendStatus(400);
            }
            console.log(data)
            res.send({ok: true})
        });

    } catch (err) {
        console.log(err)
    }
}