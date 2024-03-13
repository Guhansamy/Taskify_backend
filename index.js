const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer')
const cors = require('cors')
const fs = require('fs')
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

app.get('/file/:fname',(req,res)=>{
    console.log("in get file....")
    const fn = './uploads/'+req.params.fname
    console.log(fn)
    var rs = fs.createReadStream(fn)
    rs.pipe(res)
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

// app.post('/create-class',async(req,res)=>{
//     try {
//         const data = await Class.find()
//         const dat = data.map(e=>e.joinCode)
//         const cls = await Class.create({
//             "title":req.body.title,
//             "description":req.body.description,
//             "joinCode":createJoinCode(dat)
//         })
//         console.log(cls._id)
//         res.status(200).json({
//             "status":"success",
//             "message":"Class created sucessfully"
//         })
//     } catch (error) {
//         res.status(200).json({
//             "status":"failed",
//             "message":"Class was not created"
//         })
//     }
// })

app.post("/create-class/:uid", async (req, res) => {
    try {
        console.log("this is class", req.body);
        const data = await Class.find();
        const dat = data.map((e) => e.joinCode);

        const x = await Class.create({
            title: req.body.title,
            description: req.body.description,
            createdBy: req.params.uid,
            members: [],
            tasks: [],
            joinCode: createJoinCode(dat),
        });
        console.log("Uid", req.params.uid);
        const user = await User.findById(req.params.uid);
        console.log("user det", user);
        const use = user;
        use.created.push(x._id.toString().replace(/ObjectId\("(.*)"\)/, "$1"));
        console.log(use);
        await user.updateOne(use);
        console.log(user);
        res.status(200).json({
            status: "Success",
            message: "Successfull Class Created",
        });
    } catch (error) {
        res.status(500).json({
            status: "Failed",
            message: "Class not created",
            error: error,
        });
    }
});

app.get("/get-class/:id/:tas", async (req, res) => {
    try {
        console.log("in get class")
        const userfet = await User.findById(req.params.id)
        var data =[]
        const fet=async(id)=>{
            return await Class.findById(id)
        }
        if(req.params.tas==0){
            userfet.joined.forEach(element => {
                data.push(fet(element))
            });
        }else{
            userfet.created.forEach(element => {
                data.push(fet(element))
            });
        }
        // const data = await Class.find();
        res.status(200).json({"data":data});
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: "failed",
            message: "Class data not fetched",
            error: error,
        });
    }
});

const data = [58963, 87452, 98745];

function getRandomInt() {
    return Math.floor(Math.random() * 100000);
}

const createJoinCode = (data) => {
    const generatedValue = getRandomInt();

    const isDuplicate = data.some((element) => element === generatedValue);

    if (isDuplicate) {
        console.log("Duplicate value found. Regenerating...");
        return createJoinCode(data);
    } else {
        console.log("Unique join code created:", generatedValue);
        return generatedValue;
    }
};

const joinCode = createJoinCode(data);
console.log("The value is:", joinCode);

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