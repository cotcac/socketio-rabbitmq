var express = require('express');
var router = express.Router();

var amqp = require("amqplib");

module.exports = function (app) {

  return router.post('/users', async function (req, res, next) {
    const data = req.body;
    console.log("[X]",data);
    let requestId = data.session;
    let requestData = req.body;
    // connect to Rabbit MQ and create a channel
    let connection = await amqp.connect("amqp://localhost");
    let channel = await connection.createConfirmChannel();
    publishToChannel(channel, { routingKey: "request", exchangeName: "processing", data: { requestId, requestData } });
    listenForResults();

    res.json({ status: "async pending", id: requestId });

  })

  // utility function to publish messages to a channel
  function publishToChannel(channel, { routingKey, exchangeName, data }) {
    return new Promise((resolve, reject) => {
      channel.publish(exchangeName, routingKey, Buffer.from(JSON.stringify(data), 'utf-8'), { persistent: true }, function (err, ok) {
        if (err) {
          return reject(err);
        }
        console.log("[x] push to process");


        resolve();
      })
    });
  }

  async function listenForResults() {
    // connect to Rabbit MQ
    let connection = await amqp.connect("amqp://localhost");

    // create a channel and prefetch 1 message at a time
    let channel = await connection.createChannel();
    await channel.prefetch(1);

    // start consuming messages
    await consume({ connection, channel });
  }

  // consume messages from RabbitMQ
  function consume({ connection, channel }) {
    return new Promise((resolve, reject) => {
      channel.consume("processing.results", async function (msg) {
        // parse message
        let msgBody = msg.content.toString();
        let data = JSON.parse(msgBody);
        let requestId = data.requestId;
        let processingResults = data.processingResults;
        console.log("[x]Received a result message, requestId:", requestId, "processingResults:", processingResults);


        // acknowledge message as received
        await channel.ack(msg);
        // send notification to browsers
        app.io.sockets.emit(requestId + '_new message', "SUCESS");

      });

      // handle connection closed
      connection.on("close", (err) => {
        return reject(err);
      });

      // handle errors
      connection.on("error", (err) => {
        return reject(err);
      });
    });
  }
}
