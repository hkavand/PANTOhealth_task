const amqp = require('amqplib');

async function sendMessage() {
  const connection = await amqp.connect('amqp://guest:guest@127.0.0.1:5672');
  const channel = await connection.createChannel();

  const exchange = 'xray_exchange';
  const routingKey = 'xray_data';

  await channel.assertExchange(exchange, 'direct', { durable: true });

  const message = {
    deviceId: '66bb584d4ae73e488c30a072',
    data: [
      [762, [51.339764, 12.339223833333334, 1.2038]],
      [1766, [51.33977733333333, 12.339211833333334, 1.531604]],
    ],
    time: 1735683480000,
  };

  channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)));
  console.log('Message sent');

  setTimeout(() => {
    connection.close();
    process.exit(0);
  }, 500);
}

sendMessage().catch(console.error);
