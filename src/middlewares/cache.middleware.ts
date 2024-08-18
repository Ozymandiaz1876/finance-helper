import { createClient } from 'redis';

export async function initializeRedisClient() {
  // read the Redis connection URL from the envs
  const redisHost = process.env.REDIS_HOST;
  const redisPort = +process.env.REDIS_PORT;

  // if no URL is provided, exit the process
  if (!(redisHost && redisPort)) return;
  try {
    //   create the Redis client object
    const redisClient = createClient({
      socket: {
        host: redisHost,
        port: redisPort,
      },
    });
    await redisClient.connect();
    console.log(`Connected to Redis successfully!`);
    redisClient.on('error', error => {
      console.error(`Redis client error:`, error);
    });
  } catch (err) {
    console.error(`Connection to Redis failed with error:`);
    console.error(err);
  }
}
