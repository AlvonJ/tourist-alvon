const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.enable('trust proxy');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARE
// Implement CORS
app.use(cors());
// Access-Control-Allow-Origin
app.options('*', cors());

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Set  security HTTP Headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
   app.use(morgan('dev'));
}

// Limit requests from same IP
const limiter = rateLimit({
   max: 100,
   windowMs: 60 * 60 * 1000,
   message: 'Too many requests from this IP, please try again in an hour!',
});

app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
   hpp({
      whitelist: [
         'duration',
         'ratingsQuantity',
         'ratingsAverage',
         'maxGroupSize',
         'difficulty',
         'price',
      ],
   })
);

app.use(compression());

// Test middleware
app.use((req, res, next) => {
   req.requestTime = new Date().toISOString();
   // console.log(req.cookies);
   next();
});

// app.get(`/`, (req, res) => {
//    res.status(200).json({
//       message: 'Hello from the server side!',
//       app: 'natours',
//    });
// });

// app.post('/', (req, res) => {
//    res.send('You can post to this endpoint...');
// });

// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch(`/api/v1/tours/:id`, updateTour);
// app.delete(`/api/v1/tours/:id`, deleteTour);

// 3) ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// Catch unhandled routes (MIDDLEWARE)
app.all('*', (req, res, next) => {
   // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
   // err.status = 'failed';
   // err.statusCode = 404;

   next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
