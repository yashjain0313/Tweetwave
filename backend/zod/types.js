const zod = require('zod');

const userSignUpSchema = zod.object({
  fullname: zod.string(),
  username: zod.string(),
  password: zod.string().min(6),
  email: zod.string().email(),
});

const userSignInSchema = zod.object({
  username: zod.string(),
  password: zod.string().min(6),
});

module.exports =  userSignUpSchema;
module.exports =  userSignInSchema;