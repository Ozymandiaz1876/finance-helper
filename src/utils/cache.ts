import { sha1 } from 'object-hash';
export function requestToKey(req) {
  // build a custom object to use as part of the Redis key
  const reqDataToHash = {
    query: req.query,
    body: req.body,
  };

  // `${req.path}@...` to make it easier to find
  // keys on a Redis client
  return `${req.path}@${sha1(reqDataToHash)}`;
}
export function isRedisWorking(redisClient) {
  // verify wheter there is an active connection
  // to a Redis server or not
  return !!redisClient?.isOpen;
}
