const joi =require('@hapi/joi')

const authSchema=joi.object({
    name:joi.string(),
    email: joi.string().email().lowercase().required(),
    password: joi.string().min(6).required(),
    age:joi.number()
})

module.exports={ authSchema}