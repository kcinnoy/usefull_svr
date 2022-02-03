import express from 'express';

const router = express.Router();

//middleware
import { requireSignin} from '../middlewares';

// controllers
import {uploadImage, removeImage} from '../controllers/linkcard';

router.post('/linkcard/upload-image', uploadImage);
router.post('/linkcard/remove-image', removeImage);

module.exports = router;