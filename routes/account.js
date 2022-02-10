import express from 'express';

const router = express.Router();

//middleware
import { requireSignin} from '../middlewares';

// controllers
import {setUpPayments, getAccountStatus, currentAccount, accountLinkcards} from '../controllers/account';

router.post('/setup-payments',requireSignin, setUpPayments);
router.post('/get-account-status',requireSignin, getAccountStatus);
router.get('/current-account',requireSignin, currentAccount);

router.get('/account-linkcards',requireSignin, accountLinkcards);

module.exports = router;