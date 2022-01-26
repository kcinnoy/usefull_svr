import express from 'express';

const router = express.Router();

//middleware
import { requireSignin} from '../middlewares';

// controllers
import {setUpPayments} from '../controllers/payments';

router.post('/setup-payments',requireSignin, setUpPayments);


module.exports = router;