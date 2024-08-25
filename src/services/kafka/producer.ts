import { Kafka } from 'kafkajs';
import { Service } from 'typedi';

@Service()
export class KafkaProducer {
  private kafka: Kafka;
  private producer: any;
  private clientId: string;
  private brokers: string[];

  constructor(clientId = 'finance-service', brokers = ['localhost:9092']) {
    this.clientId = clientId;
    this.brokers = brokers;

    this.kafka = new Kafka({
      clientId: this.clientId,
      brokers: this.brokers,
    });
    this.producer = this.kafka.producer();
  }

  async produceMessage(topic: string, message: object) {
    await this.producer.connect();
    await this.producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
    await this.producer.disconnect();
  }
}
