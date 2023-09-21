const Sequelize=require('sequelize')
const sequelize=new Sequelize(
    'login',
    'root',
    'root',
    {
        host:'localhost',
        dialect:'mysql',
        define: {
            timestamps: false 
        }
    }
)
module.exports=sequelize;