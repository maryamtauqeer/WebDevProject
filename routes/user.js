const express = require('express');
const router = express.Router();
const mongoose= require('mongoose');
const bcrypt= require ('bcrypt');  
const jwt=require('jsonwebtoken');
const checkAuth=require('../middleware/check-auth');
const createError = require('http-errors')
const {authSchema}=require('../helpers/validation_schema')
const { AccessToken, verifyAccessToken, RefreshToken, verifyRefreshToken } = require('../helpers/jwt_helper')

//TOKENS
// accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2M2U4YzIwN2E2MGUxYTI3ZjUyZDFhMzgiLCJpYXQiOjE2NzYxOTg0MDcsImV4cCI6MTY3NjIwMjAwNywiYXVkIjoiNjNlOGMyMDdhNjBlMWEyN2Y1MmQxYTM4IiwiaXNzIjoibWFyeWFtc3BhZ2UuY29tIn0.vOqTzxa_oduna_1dS4fAHkHizPfthcv3o_SjSI8D5fQ
// refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2M2U4YzIwN2E2MGUxYTI3ZjUyZDFhMzgiLCJpYXQiOjE2NzYxOTg0MDcsImV4cCI6MTY3ODc5MDQwNywiYXVkIjoiNjNlOGMyMDdhNjBlMWEyN2Y1MmQxYTM4IiwiaXNzIjoibWFyeWFtc3BhZ2UuY29tIn0.gs2SJF1to7Xu5T-XZ4Yt0yYvsj5MbxvT42GPyKnLapo

const User = require('../models/user');

router.get('/', verifyAccessToken, (req, res, next) => {
    User.find()
    .exec()
    .then(docs =>{
        console.log(docs);
        res.status(200).json(docs);
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error:err
        });
    });
});

// router.post('/', checkAuth, (req, res, next) => {
//     const user = new User({
//         _id: new mongoose.Types.ObjectId(),
//         name: req.body.name,
//         email: req.body.email,
//         password: req.body.password,
//         age: req.body.age
//     });
//     user
//         .save()
//         .then(result =>{
//             console.log(result);
//             res.status(201).json({
//                 message: 'Handling POST requests to /user',
//                 createdUser: user
//             });
//         })
//         .catch(err => {
//             console.log(err);
//             res.status(500).json({
//                 error:err
//             });
//         })
// });


router.get('/:userID', (req, res, next) =>{
    const id=req.params.userID;
    User.findById(id)
        .exec()
        .then(doc =>{
            console.log("From database",doc);
            if (doc){
                res.status(200).json(doc);
            } else{
                res.status(404).json({message: 'No valid entry found for provided ID'});
            }
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({error: err});
        });
});

router.put('/:userId', verifyAccessToken, (req, res, next) =>{
    const id=req.params.userId;
    const updateOps={};
    for (const ops of req.body){
        updateOps[ops.propName]=ops.value;
    }
    User.update({_id:id}, { $set: updateOps})
    .exec()
    .then(result =>{
        console.log(result);
        res.status(200).json(result);
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({
            error:err
        });
    });
});

router.delete("/:userId", verifyAccessToken, (req, res, next) =>{
    User.remove({_id:req.params.userId})
    .exec()
    .then(result =>{
        res.status(200).json({
            message:"User deleted"
        });
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});


//assg 2

router.post('/signup', async(req, res, next)=>{
    try{
        const result=await authSchema.validateAsync(req.body)
        
        const doesExist=await User.findOne({email:result.email})
        if (doesExist)
            throw createError.Conflict(`${result.email} is already been registered`)
        
        const user= new User({
            _id: new mongoose.Types.ObjectId(),
            name:result.name,
            email:result.email,
            password:result.password,
            age:result.age
            
        })
        const savedUser=await user.save()
        const accessToken = await AccessToken(savedUser.id)
        const refreshToken = await RefreshToken(savedUser.id)
        res.send({savedUser, accessToken, refreshToken})
    } catch (error){
        if (error.isJoi === true) error.status = 422
        next(error)
    }
})

router.post('/login', async (req, res, next) => {
    try {
        const result = await authSchema.validateAsync(req.body)
        const user = await User.findOne({ email: result.email })

        if (!user) throw createError.NotFound('User not registered')

        const isMatch = await user.isValidPassword(result.password)
        if (!isMatch) throw createError.Unauthorized('Username/password is invalid')

        const accessToken = await AccessToken(user.id)
        const refreshToken = await RefreshToken(user.id)
        res.send({ accessToken, refreshToken })

    } catch (error) {
        if (error.isJoi === true)
            return next(createError.BadRequest("Invalid Username/Password"))
        next(error)
    }
})

router.post('/refresh-token', async (req, res, next) => {
    try {
        const { refreshToken } = req.body
        if (!refreshToken) throw createError.BadRequest()
        const userId = await verifyRefreshToken(refreshToken)

        const accessToken = await AccessToken(userId)
        // const refToken = await RefreshToken(userId)
        // res.send({ accessToken: accessToken, refreshToken: refToken })
        res.send({ accessToken: accessToken})

    } catch (error) {
        next(error)

    }
})
module.exports = router;


//extra functions

// router.post('/signup', (req, res, next) => {
//     User.find({email:req.body.email})
//         .exec()
//         .then(user =>{
//             if (user.length>=1){
//                 return res.status(409).json({
//                     message: 'Mail exists'
//                 });
//             } else{
//                 bcrypt.hash(req.body.password, 10, (err, hash)=>{
//                     if (err){
//                         return res.status(500).json({
//                             error:err
//                         });
//                     } else{
//                         const user = new User({
//                         _id: new mongoose.Types.ObjectId(),
//                         name: req.body.name,
//                         email: req.body.email,
//                         password:hash,
//                         age: req.body.age
//                         });
//                         user.save()
//                             .then(result=>{
//                                 console.log(result);
//                                 res.status(201).json({
//                                     message:'User created successfully'
//                                 });
//                             })
//                             .catch(err => {
//                                 console.log(err);
//                                 res.status(500).json({
//                                     error:err
//                                 });
//                             });
//                         }
//                 });
//             }
//         })
    
// });

// router.post("/login", (req, res, next) =>{
//     User.find({email: req.body.email})
//         .exec()
//         .then(user =>{
//             //incorrect email
//             if (user.length<1){
//                 return res.status(401).json({
//                     message: 'Authentication failed'
//                 });
//             }
//             bcrypt.compare(req.body.password, user[0].password, (err, result)=>{
//                 //error if comparison generally fails
//                 if (err){
//                     return res.status(401).json({
//                         message:'Authentication failed'
//                     });
//                 }
//                 if (result){
//                     const token = jwt.sign(
//                         {
//                         email: user[0].email,
//                         userId:user[0]._id
//                     },
//                     process.env.JWT_KEY,
//                     {
//                         expiresIn:"1h"
//                     }
            
//                 );
//                     return res.status(200).json({
//                         message:'Authentication successsful',
//                         token: token
//                     });
//                 }
//                 //incorrect password
//                 res.status(401).json({
//                     message:'Authentication failed'
//                 });
//             });
//         })
//         .catch(err=>{
//             console.log(err);
//             res.status(500).json({
//                 error:err
//             });
//         });
// });


