const allowedOrigins = [
  'http://localhost:4000',
  'http://localhost:3001', // ✅ Fixed typo
  'https://ycc-sage.vercel.app/',
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // ✅ Allow credentials (cookies, authorization headers)
};

export default corsOptions;
