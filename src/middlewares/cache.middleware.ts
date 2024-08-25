import { isRedisWorking, requestToKey } from '@/utils/cache';
import { createClient } from 'redis';

export class cacheMiddleware {
  public redisClient;

  /**
   * Initializes a Redis client by reading the connection URL from the environment variables
   * and creating a Redis client object. If the connection URL is not provided, the function
   * exits early. If the Redis client is successfully connected, it logs a success message
   * and sets up an error event listener. If there is an error connecting to Redis, it logs an
   * error message and the error object.
   *
   * @return {Promise<void>} A promise that resolves when the Redis client is successfully
   * connected, or rejects with an error if there is an issue connecting.
   */
  async initializeRedisClient() {
    // read the Redis connection URL from the envs
    const redisHost = process.env.REDIS_HOST;
    const redisPort = +process.env.REDIS_PORT;

    // if no URL is provided, exit the process
    if (!(redisHost && redisPort)) return;
    try {
      //   create the Redis client object
      this.redisClient = createClient({
        socket: {
          host: redisHost,
          port: redisPort,
          reconnectStrategy: function (retries) {
            if (retries > 20) {
              console.log('Too many attempts to reconnect. Redis connection was terminated');
              return new Error('Too many retries.');
            } else {
              return retries * 500;
            }
          },
          connectTimeout: 10000,
        },
      });
      await this.redisClient.connect();
      console.log(`Connected to Redis successfully!`);
      this.redisClient.on('error', error => {
        console.error(`Redis client error:`, error);
      });
    } catch (err) {
      console.error(`Connection to Redis failed with error:`);
      console.error(err);
    }
  }

  /**
   * Writes data to the Redis cache.
   *
   * @param {string} key - The key to store the data under.
   * @param {*} data - The data to store in the Redis cache.
   * @param {*} options - Options for the Redis set operation.
   * @return {Promise<void>} A promise that resolves when the data is written to the Redis cache.
   */
  private async writeData(key, data, options) {
    if (isRedisWorking(this.redisClient)) {
      try {
        // write data to the Redis cache
        await this.redisClient.set(key, data, options);
        console.log(`Cached data for key=${key}`);
      } catch (e) {
        console.error(`Failed to cache data for key=${key}`, e);
      }
    }
  }

  /**
   * Retrieves data from the Redis cache.
   *
   * @param {string} key - The key to retrieve data from.
   * @return {*} The cached data, or undefined if not found.
   */
  private async readData(key) {
    let cachedValue = undefined;

    if (isRedisWorking(this.redisClient)) {
      // try to get the cached response from redis
      cachedValue = await this.redisClient.get(key);
      if (cachedValue) {
        console.log('returning from cache');
        return cachedValue;
      }
    }
  }

  /**
   * Enables caching for the given request.
   *
   * @param {object} options - Options for the caching middleware.
   * @param {number} options.EX - The expiration time for the cached data in seconds.
   * @return {function} A middleware function that handles caching for the given request.
   */
  public useCacheMiddleware(
    options = {
      EX: 21600, // 6h
    },
  ) {
    return async (req, res, next) => {
      if (isRedisWorking(this.redisClient)) {
        const key = requestToKey(req);
        // if there is some cached data, retrieve it and return it
        const cachedValue = await this.readData(key);
        if (cachedValue) {
          try {
            // if it is JSON data, then return it
            return res.json(JSON.parse(cachedValue));
          } catch {
            // if it is not JSON data, then return it
            return res.send(cachedValue);
          }
        } else {
          // override how res.send behaves
          // to introduce the caching logic
          const oldSend = res.send;
          res.send = data => {
            // set the function back to avoid the 'double-send' effect
            res.send = oldSend;

            // cache the response only if it is successful
            if (res.statusCode.toString().startsWith('2')) {
              this.writeData(key, data, options).then();
            }

            return res.send(data);
          };

          // continue to the controller function
          next();
        }
      } else {
        // proceed with no caching
        next();
      }
    };
  }
}
