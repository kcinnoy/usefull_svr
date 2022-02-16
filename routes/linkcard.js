import express from 'express';
import formidable from 'express-formidable';

const router = express.Router();

//middleware
import { requireSignin, isServiceOwner} from '../middlewares';

// controllers
import {uploadImage, removeImage, createLinkcard, read, uploadVideo, removeVideo, addShowcase, editLinkcard} from '../controllers/linkcard'

router.post('/linkcard/upload-image', uploadImage);
router.post('/linkcard/remove-image', removeImage);
// course
router.post('/linkcard', requireSignin, isServiceOwner, createLinkcard);
router.put('/linkcard/:slug/', requireSignin, editLinkcard);

router.get('/linkcard/:slug', read);
router.post('/linkcard/video-upload/:accountId', requireSignin, formidable(), uploadVideo);
router.post('/linkcard/video-remove/:accountId', requireSignin, removeVideo);

router.post('/linkcard/showcase/:slug/:accountId', requireSignin, addShowcase);

module.exports = router;