import { EachMessagePayload, Kafka } from 'kafkajs';

export class KafkaService {
  private kafka: Kafka;
  private consumer: any;
  private producer: any;
  private handlers: { [topic: string]: (message: EachMessagePayload) => Promise<void> };
  private clientId: string;
  private brokers: string[];

  /**
   * Initializes a new instance of the KafkaService class.
   *
   *  This constructor sets up the Kafka client, consumer, and producer with the provided configuration.
   *
   * @param {string} clientId - The client ID to use for the Kafka connection
   * @param {string[]} brokers - The list of Kafka brokers to connect to
   * @param {string} groupeId - The group ID to use for the Kafka consumer
   * @return {void} No return value
   */
  constructor(clientId = 'finance-service', brokers = ['localhost:9092'], groupeId = 'finance-group') {
    this.clientId = clientId;
    this.brokers = brokers;
    this.kafka = new Kafka({
      clientId: this.clientId,
      brokers: this.brokers,
    });
    this.consumer = this.kafka.consumer({ groupId: groupeId });
    this.producer = this.kafka.producer();
    this.handlers = {};
  }

  async produceMessage(topic: string, message: object) {
    await this.producer.connect();
    await this.producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
    await this.producer.disconnect();
  }

  /**
   * Registers a handler for a specific topic.
   *
   *  This function stores the provided handler in the handlers object, associated with the specified topic.
   *
   * @param {string} topic - The topic for which the handler is being registered
   * @param {(message: EachMessagePayload) => Promise<void>} handler - The handler function to be called when a message is received for the topic
   * @return {void} No return value
   */
  public registerHandler(topic: string, handler: (message: EachMessagePayload) => Promise<void>) {
    this.handlers[topic] = handler;
  }

  /**
   * Consumes messages from the specified topics.
   *
   *  This function connects to the Kafka consumer, subscribes to the specified topics,
   *  and runs the consumer to start receiving messages.
   *
   *  For each message received, it checks if a handler is registered for the topic.
   *  If a handler is found, it calls the handler with the message payload.
   *  If no handler is found, it logs a warning message.
   *
   * @param {string[]} topics - An array of topic names to consume messages from
   * @return {Promise<void>} A promise that resolves when the consumer is running
   */
  public async consumeMessages(topics: string[]) {
    await this.consumer.connect();

    for (const topic of topics) {
      await this.consumer.subscribe({ topic, fromBeginning: true });
    }

    await this.consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        const { topic } = payload;
        if (this.handlers[topic]) {
          await this.handlers[topic](payload);
        } else {
          console.warn(`No handler registered for topic: ${topic}`);
        }
      },
    });
  }
}
