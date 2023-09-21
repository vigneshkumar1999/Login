### Basic User Login System
    Developing API calls for login, regitser new user, update users details,retrieve details of users,inactive the status of particular user(soft delete).


### Database:MySql
    Generating random of 50,000 users data with java code and insert that data into users table in login database.


### Sequelize
    Sequelize is a Node.js-based Object Relational Mapper that makes it easy to work with MySQL databases.It helps to create table in database and connect nodejs with database.
    
    FUNCTIONS:
      1.sequelize.authenticate() - help to make connection with database
      2.sequelize.sync() - help to create table in database
      Both are promise based function

### User Model       
      sequelize.define()-helps to create model

      COLUMNS:
        id(primary key),name,mailid,password,role,status

### Role based authentication using JWT
      Using JWT APIs are authenticated in this User Login System. 
      It is Role based Authentication for 'user' 'Admin'
      Some APIs are accessed only by user or only by others or both can access 

      Package:jsonwebtoken

      Funtion: 
          jwt.sign(payload,secretkey)--To generate jwt 
          jwt.verify(token,secretkey,callback)--To verify jwt

      Middleware:authToken(role)

### Event Emitter
      Using event emitter ,details of events has been stored in logs.txt file while calling an API.
      Whenever response is send back to client the event emitter will emit an event named 'listener' with appropriate message.

### API calls
  ### Get
      1.get all users details (only admin can access)
      2.get particular user details by name(both admin and user can access)
      3.get count of active users
      
        Since password is not encrypted I added a logic like one user cannot access details of other users.This is done by checking name from jwt token and req params.If it is admin then admin can access any users details by providing the name.
  ### Post
      1.AddUser(both can access)

        Should give all the details to add user.Name and Mailid both should be unique else user cannot able to register
      2.Login(both can access)

        Should give valid mail id then only it checks password and status of that user to allow for login. 
  ### Put
      1.Update Mailid
      2.Update Password

        Both APIs are same.In request body it must have password or mailid to update 
        Only user can access this API though admin access particular user details admin can able to modify details of user.Only user can able to update.
  ### Put(Alter status-soft delete)
      1.Inactive user Status(only admin can access)

        Should provide existing mailid or name .Once it find that particular user it change the status of that user and change.Once the user state is inactive that user cannot able to login eventhough user gives valid credentials.
      