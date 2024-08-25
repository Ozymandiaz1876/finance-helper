import { Kafka, EachMessagePayload } from 'kafkajs';
import { Service } from 'typedi';

@Service()
export class KafkaConsumer {
  private kafka: Kafka;
  private consumer: any;
  private handlers: { [topic: string]: (message: EachMessagePayload) => Promise<void> };
  private clientId: string;
  private brokers: string[];

  constructor(clientId = 'finance-service', brokers = ['localhost:9092'], groupeId = 'finance-group') {
    this.clientId = clientId;
    this.brokers = brokers;
    this.kafka = new Kafka({
      clientId: this.clientId,
      brokers: this.brokers,
    });
    this.consumer = this.kafka.consumer({ groupId: groupeId });
    this.handlers = {};
  }

  // Register a handler for a specific topic
  public registerHandler(topic: string, handler: (message: EachMessagePayload) => Promise<void>) {
    this.handlers[topic] = handler;
  }

  // Generic method to consume messages
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
