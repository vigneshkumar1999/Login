const express=require('express')
const app=express();
const port=6004
const sequelize=require('./main')
const User=require('./model/user')

sequelize.authenticate().then(()=>{
    console.log('connected successfully')
})
.catch((err)=>{
    console.error('Error occurs: ',err.message)
})

app.use(express.json())

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

app.use('/api',require('./routes/api'))