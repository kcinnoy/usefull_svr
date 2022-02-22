import express from 'express';
import formidable from 'express-formidable';

const router = express.Router();

//middleware
import { requireSignin, isServiceOwner } from '../middlewares';

// controllers
import {
    uploadImage,
    removeImage,
    createLinkcard,
    read,
    uploadVideo,
    removeVideo,
    addShowcase,
    removeShowcase,
    editLinkcard,
    updateShowcase,
    publishLinkcard,
    unpublishLinkcard,
    linkcards,
} from '../controllers/linkcard';

router.get('/linkcards', linkcards);

router.post('/linkcard/upload-image', uploadImage);
router.post('/linkcard/remove-image', removeImage);
// course
router.post('/linkcard', requireSignin, isServiceOwner, createLinkcard);
router.put('/linkcard/:slug/', requireSignin, editLinkcard);

router.get('/linkcard/:slug', read);
router.post('/linkcard/video-upload/:accountId', requireSignin, formidable(), uploadVideo);
router.post('/linkcard/video-remove/:accountId', requireSignin, removeVideo);

//publishing linkcards
router.put('/linkcard/publish/:linkcardId', requireSignin, publishLinkcard);
router.put('/linkcard/unpublish/:linkcardId', requireSignin, unpublishLinkcard)

router.post('/linkcard/showcase/:slug/:accountId', requireSignin, addShowcase);
router.put('/linkcard/showcase/:slug/:accountId', requireSignin, updateShowcase);
router.put('/linkcard/:slug/:showcaseId', requireSignin, removeShowcase);




module.exports = router;
