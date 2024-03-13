const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer')
const cors = require('cors')
const {User,Class} = require('./schema.js')
const mongoose = require('mongoose')

const app = express()
app.use(bodyParser.json({limit:'50mb'}))
app.use(bodyParser.urlencoded({limit:'50mb'},{ extended: false }));
app.use(cors())

const storage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null,'uploads/')
    },
    filename: (req,file,cb)=>{
        console.log(req.params.cid+file.originalname)
        cb(null,req.params.cid+file.originalname)
    }
})

const upload = multer({storage})


app.post('/create-task/:cid',upload.single('file'),async(req,res)=>{
    try {
        console.log(req.file,req.body)
        if (req.file){
            const data = await Class.findById(req.params.cid)
            data.tasks.push({
                'title':req.body.title,
                'desc':req.body.description,
                'file':req.params.cid+req.file.originalname
            })
            await data.updateOne(data)
            res.status(200).json({
                "status":"sucess",
                "message":"Task created successfully."
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
        console.log("hello folks",req.body)
        const x = await User.create({
            "name":req.body.name,
            "password":req.body.password,
            "email":req.body.email
        })
        console.log(x)
        res.status(200).json({
            "status":"success",
            "message":"user created sucessfully"
        })
    }catch(e){
        console.log(e)
        res.status(500).json({
            "status":"error",
            "message":"user not created",
            "error":e
        })
    }
})

app.post('/create-class',async(req,res)=>{
    try {
        const data = await Class.find()
        const dat = data.map(e=>e.joinCode)
        const cls = await Class.create({
            "title":req.body.title,
            "description":req.body.description,
            "joinCode":createJoinCode(dat)
        })
        console.log(cls._id)
        res.status(200).json({
            "status":"success",
            "message":"Class created sucessfully"
        })
    } catch (error) {
        res.status(200).json({
            "status":"failed",
            "message":"Class was not created"
        })
    }
})

app.get('/join-class/:uid/:tid',async(req,res)=>{
    try{
        const user = await User.findById(uid)
        const cls = await Class.findOne({"joinCode":tid})
        if(cls){
            const join = user
            const clJoin = cls
            join.joined.push(clJoin.id)
            clJoin.members.push(uid)
            join.push(tid)
            await user.updateOne({
                join
            })
            await cls.updateOne(clJoin)

            res.status(200).json({
                "status":"success",
                "message":"Class joined"
            })
        }
        else{
            res.status(404).json({
                "status":"fail",
                "message":"Class not found with the given class code"
            })
        }
    }catch(e){

    }
})

app.get('/get-user',async(req,res)=>{
    try {
        const data = await User.find()
        res.status(200).json(data)
    } catch (error) {
        console.log(e)
        res.status(500).json({
            "status":"error",
            "message":"user not fetched",
            "error":e
        })
    }
})
app.listen(5256,async()=>{
    console.log("listening at 5256...")
    try{
        await mongoose.connect("mongodb+srv://dharun:Dharun2005@dharun.wqnlpqo.mongodb.net/TaskifyDB?retryWrites=true&w=majority&appName=dharun")
        console.log("connected to db")
    }catch(e){
        console.log(e)
        console.log("coundn't establish connection....")
    }
        
})

// const conToDB = async() =>{
//     try{
//         await mongoose.connect("mongodb+srv://dharun:Dharun2005@dharun.wqnlpqo.mongodb.net/TaskifyDB?retryWrites=true&w=majority&appName=dharun")
//         console.log("connected to db")
//         app.listen(5256,()=>{console.log("listening at 5256...")})
//     }catch(e){
//         console.log(e)
//         console.log("coundn't establish connection....")
//     }
// }

// conToDB()