import User from '../models/user';
import queryString from 'query-string';
import { isBuffer } from 'util';
//import stripe from 'stripe';
const stripe = require('stripe')(process.env.STRIPE_SECRET);



export const setUpPayments = async (req,res) => {

    try {
        // find user from db
        let  user = await User.findById(req.user._id).exec();
        // create stripe_account only if user doesnt already have one 
        if(!user.stripe_account_id) {
            const account = await stripe.accounts.create({
                type: 'express',
                capabilities: {
                    card_payments: {requested: true},
                    transfers: {requested: true},
                },
            });
            console.log('account:', account.id);
            user.stripe_account_id = account.id;
            user.save();
        }
    
    let accountLink = await stripe.accountLinks.create({
        account: user.stripe_account_id,
        refresh_url: process.env.STRIPE_REDIRECT_URL,
        return_url: process.env.STRIPE_REDIRECT_URL,
        type: 'account_onboarding',
      });
        // pre-fill any info such as email and send response to the front end 
        accountLink = Object.assign(accountLink, {
            'stripe_user[email]': user.email,
        });
        // Send the account link as response to frontend
        res.send(`${accountLink.url}?${queryString.stringify(accountLink)}`); 
     } catch (err) {
        console.log('Setup payments error!', err)
     }   
};

export const getAccountStatus = async  (req,res) => {
    try {
        const user = await User.findById(req.user._id).exec();
   
        const stripeAccount = await stripe.accounts.retrieve(user.stripe_account_id);
        //const stripeAccount = await stripe.accounts.retrieve("acct_1KN3QdR31DQHCFFM");
        console.log('sa1:',stripeAccount)
        console.log('user:',user)
        console.log('user_sa1',user.stripe_account_id)
        console.log('user_email',user['email'])

        //console.log('stripe account:', stripeAccount);
        if(!stripeAccount.charges_enabled) {
            return res.status(401).send('Unauthorized');
        } else {
            
            const statusUpdated = await User.findByIdAndUpdate(
                user._id,
                {
                  stripe_seller: stripeAccount,
                  $addToSet: { role: "Service Owner" },
                },
                { new: true }
            ).select("-password")
            .exec();
            res.json(statusUpdated);
        }
    } catch (err) {
        console.log(err)
    }
}


export const currentAccount = async  (req,res) => {
    try { 
        let user = await User.findById(req.user._id).select("-password").exec();
        if (!user.role.includes('Service Owner')) {
            return res.status(403)
        } else {
            res.json({ok: trye});
        }
    } catch (err) {
        console.log(err)
    }
}