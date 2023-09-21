const sequelize=require('../main')
const DataTypes=require('sequelize')

const User=sequelize.define("users",{
    id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        primaryKey: true,
        autoIncrement: true,
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false,
        validate: {
            is: {
                args: /^[a-zA-Z\s]+$/,
                msg: "Name must contain only alphabetic characters and spaces."
            }
        }
    },
    mailid:{
        type:DataTypes.STRING,
        allowNull:false,
        validate: {
            isEmail: {
                args: true,
                msg: "Invalid email address format."
            }
        }
    },
    password:{
        type:DataTypes.STRING,
        allowNull:false,
        validate: {
            len: {
                args: [1],
                msg: "Password cannot be empty"
            }
        }
    },
    role:{
        type:DataTypes.STRING,
        allowNull:false,
        defaultValue: "user"
    },
    status:{
        type:DataTypes.BOOLEAN,
        allowNull:false,
        validate: {
            isIn: {
                args: [[true, false]],
                msg: "Status must be either true or false"
            }
        }
    }
})

sequelize.sync()
.then(()=>{
    console.log('User table created')
})
.catch((err)=>{
    console.error('Error: ',err.message)
})

module.exports=User;