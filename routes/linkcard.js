import express from 'express';

const router = express.Router();

//middleware
import { requireSignin} from '../middlewares';

// controllers
import {uploadImage} from '../controllers/linkcard';

router.post('/linkcard/upload-image', uploadImage);

module.exports = router;