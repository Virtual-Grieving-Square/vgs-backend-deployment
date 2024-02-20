import dotenv from 'dotenv';
dotenv.config(); 

interface Config {
    DB_CONNECTION_STRING: string;
    PORT: number;
}

const config: Config = {
    DB_CONNECTION_STRING: process.env.DB_CONNECTION_STRING || '',
    PORT: parseInt(process.env.PORT || '3000', 10),
};

export default config;