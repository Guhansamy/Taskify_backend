const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer')
const cors = require('cors')
const {User,Class} = require('./schema.js')
const mongoose = require('mongoose')

const app = express()
app.use(bodyParser.json({limit:'50mb'}))
app.use(bodyParser.urlencoded({limit:'50mb'},{ extended: false }));
app.use(cors)

const storage = multer.diskStorage({
        destination:(req,file,cb)=>{
            cb(null,'uploads/')
        },
        filename:(req,file,cb)=>{
            cb(null,file.originalname)
        }
    }
)

const upload = multer({storage}).single('file')

app.post('/create-task',upload,async(req,res)=>{
    try {
        if (res.file){
            res.status(200).json({
                "status":"sucess",
                "message":"Task created successfully."
            })
            await Class.create({
                'title':req.body.title,
                'desc':''
            })
        }else{
            res.status(500).json({
                "status":"failiure",
                "message":"Task failed successfully."
            })
        }
    } catch (error) {
        
    }
})

app.post('/sign-up',async(req,res)=>{
    try{
        await User.create({
            name:req.body.name,
            passowrd:req.body.password,
            email:req.body.email
        })
        res.status(200).json({
            "status":"success",
            "message":"user created sucessfully"
        })
    }catch(e){
        res.status(500).json({
            "status":"error",
            "message":"user not created",
            "error":e
        })
    }
})

const conToDB = async() =>{
    try{
        await mongoose.connect("mongodb+srv://dharun:Dharun2005@dharun.wqnlpqo.mongodb.net/TaskifyDB?retryWrites=true&w=majority&appName=dharun")
        console.log("connected to db")
        app.listen(8000,()=>{console.log("listening at 8000...")})
    }catch(e){
        console.log(e)
        console.log("coundn't establish connection....")
    }
}

conToDB()