import express from 'express';
import formidable from 'express-formidable';

const router = express.Router();

//middleware
import { requireSignin, isServiceOwner} from '../middlewares';

// controllers
import {uploadImage, removeImage, createLinkcard, read, uploadVideo} from '../controllers/linkcard'

router.post('/linkcard/upload-image', uploadImage);
router.post('/linkcard/remove-image', removeImage);
// course
router.post('/linkcard', requireSignin, isServiceOwner, createLinkcard);
router.get('/linkcard/:slug', read);
router.post('/linkcard/video-upload', requireSignin, formidable(), uploadVideo);

module.exports = router;