const config=require('config')
const jwt=require('jsonwebtoken')

const {check,validationsResult}=require('express-validator')
const bcrypt=require('bcryptjs')
const User=require('../models/User')
const {Router}=require('express')
const app=express()
app.use('/api/auth',require('./routes/auth.routes'))
app.use(exoress.json({extended:true}))
const router=Router()

router.post('/register',
    [
        check('email','некорректный email').isEmail(),
        check('password','минимальная длина пароля 6 символов').isLength({min:6}),
    ],
    async (req,res)=>{
    try{
        const errors=validationsResult(req)
        if(errors.isEmpty()){
            return res.status(400).json({
                errors:errors.array(),
                message:"некорректные данные при регистрации"
            })
        }
        const {email,password}=req.body
        const candidate=await User.findOne({email})
        if(candidate){
            res.status(400).json({message:'такйо пользовоатель существует'})
        }
        const hashedPassword=await bcrypt.hase(password,12)
        const user = new User({email,password:hashedPassword}})
        await user.save()
        res.status(201).json({message:'пользователь создан'})
    }catch(e){
        res.status(500).json({message:'Что то пошло нетак попробуйте снова'})
    }
})
router.post('/login',
[
    check('email','некорректный email').normalizeEmail().isEmail(),
    check('password','минимальная длина пароля 6 символов').exists().isLength({min:6}),
],
async (req,res)=>{
try{
    const errors=validationsResult(req)
    if(errors.isEmpty()){
        return res.status(400).json({
            errors:errors.array(),
            message:"некорректные данные при входе в систему"
        })
    }
    const {email,password}=req.body
    const user=await  User.findOne({
        email
    })
    if(!user){
        return res.status(400).json({message:'пользователь не найден'})
    }
   const isMatch=await bcrypt.compare(password.user.password)
    if(!isMatch){
        return res.status(400).json({message:'неверный парооль попруоуйте снова'})
    }
    const token=jwt.sign(
        {userId:user.id},
        config.get('jwtSecret'),
        {expiresIn:'1h'}
    )
    res.json({token,userId:user.id})

}catch(e){
    res.status(500).json({message:'Что то пошло нетак попробуйте снова'})
}
})
module.exports=router