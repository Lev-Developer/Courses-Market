const {body} = require('express-validator') 
const User = require('../models/user')

exports.registerValidators = [
    body('email')
        .isEmail()
        .withMessage('Enter your email correctly')
        .custom( async (value, {req}) => {
            try{
                const user = await User.findOne({ email : value })
                if (user) {
                    return Promise.reject('This email is already taken')
                }
            }catch (e) {
                console.log(e)
            }

        })
    .normalizeEmail(),
    body('password', 'Password must be at least 8 characters')
        .isLength({min: 1, max: 56})
        .trim(),
    body('confirm')
        .custom((value, {req}) => {
            if (value !== req.body.password) {
                throw new Error('Passwords must match')
            }
            return true
        })
        .trim(),
    body('name', 'Name  must be at least 3 characters')
    .isLength({min: 3, max: 56})
    .trim()
]


exports.courseValidators = [
    body('title')
        .isLength({min:3})
        .withMessage('Minimum length of the name is 3 characters')
        .trim(),
    body('price')
        .isNumeric()
        .withMessage('Enter correct price'),
    body('img', 'Enter the correct Url picture')
        .isURL()
]   