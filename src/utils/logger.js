import winston from 'winston';
import __dirname from './index.js';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'coderhouse-backend' },
    transports: [
        new winston.transports.File({ 
            filename: `${__dirname}/../logs/error.log`, 
            level: 'error' 
        }),
        new winston.transports.File({ 
            filename: `${__dirname}/../logs/combined.log` 
        })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

export default logger;
