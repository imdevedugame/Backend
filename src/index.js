import express from 'express';
import configRoutes from './routes/configRoutes.js';
import komentarRoutes from './routes/komentarRoutes.js';
import usersRoutes from './routes/usersRoutes.js';
import adminRoutes from './routes/adminRouter.js'; 
import authRoutes from './routes/authRoutes.js';
import likeRoutes from './routes/likeRoutes.js'; // Import route untuk like
import userauthRoutes from './routes/userauthRoutes.js'; // Import route untuk userauth
import bookmarkRoutes from './routes/bookmarkRoutes.js';
import cors from 'cors';

const app = express();

app.use(express.json());

const corsOptions = {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

app.use('/api', configRoutes);
app.use('/api', komentarRoutes);
app.use('/api', usersRoutes);
app.use('/api', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', likeRoutes); // Tambahkan route like di sini
app.use('/api', userauthRoutes); // Tambahkan route userauth di sini
app.use('/api', bookmarkRoutes);
const port = 5000;
app.listen(port, () => {
    console.log(`Server ${port} dapat rokok 2 batang`);
});
