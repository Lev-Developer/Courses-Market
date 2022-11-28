const express = require('express')
const path = require('path')
const csrf = require('csurf')
const flash = require('connect-flash')
const Handlebars = require('handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access') 
const mongoose = require('mongoose')
const helmet = require('helmet')
const compression = require('compression')
const exphbs = require('express-handlebars')
const session = require('express-session')
const MongoStore = require('connect-mongodb-session')(session)
const homeRoutes = require('./routes/home')
const cardRoutes = require('./routes/card')
const addRoutes = require('./routes/add')
const ordersRoutes = require('./routes/orders')
const profileRoutes = require('./routes/profile')
const coursesRoutes = require('./routes/courses')
const authRoutes = require('./routes/auth')
const varMiddleware = require('./middleware/variables')
const userMiddleware = require('./middleware/user')
const errorHandler = require('./middleware/error')
const fileMiddleware = require('./middleware/file')
const keys = require('./keys')



const app = express() 
const hbs = exphbs.create({
    defaultLayout:'main',
    extreme:'hbs',
    handlebars: allowInsecurePrototypeAccess(Handlebars)
})

const store = new MongoStore({
    collection: 'session', 
    uri: keys.MONGODB_URL
})
 
//Регистрация модуля как движка HTML страниц
app.engine('hbs', exphbs({
    defaultLayout: 'main',
    extname: 'hbs',
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    helpers: require('./utils/hbs-helpers')
})) // Регистрация




app.set('view engine', 'hbs') // Использование
app.set('views', 'views') // 2. параметр это папка где хранятся шаблоны
 
//регистрация Routes
app.use(express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use(express.urlencoded({extended: true}))
app.use(session({
    secret: keys.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store
}))

app.use(fileMiddleware.single('avatar'))
app.use(csrf())
app.use(flash())
app.use(varMiddleware)
app.use(userMiddleware)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "img-src": ["'self'", "https:"],
            "script-src-elem": ["'self'", "https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js", "'unsafe-inline'"],
        },
    },
    crossOriginEmbedderPolicy: false
}));
app.use(compression())


app.use('/', homeRoutes)
app.use('/add', addRoutes)
app.use('/courses', coursesRoutes)
app.use('/card', cardRoutes)
app.use('/orders',ordersRoutes)
app.use('/auth', authRoutes)
app.use('/profile',profileRoutes)


app.use(errorHandler) 
 
//Установка порта и подключение к базе данных на сервере mongodb.net
const PORT = process.env.PORT || 5050
async function start() {
    try{
        await mongoose.connect(keys.MONGODB_URL, {
            useNewUrlParser:true
        })
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
        })
    }catch (e){
        console.log(e)
    }
}
 
start()


