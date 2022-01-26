import User from '../models/user';
import queryString from 'query-string';
//import stripe from 'stripe';
const stripe = require('stripe')(process.env.STRIPE_SECRET);



export const setUpPayments = async (req,res) => {

    try {
        // find user from db
        const user = User.findById(req.user._id).exec();
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
            //user.save();
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