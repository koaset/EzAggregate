# EzAggregate
Lightweight application that aims to aggregate data from different sources and expose it through an API.
At the moment supports data input from RabbitMQ and http API.

The main use for this is to make it easy to expose an aggregation data to other applications, chiefly as a POC.

For example:
Let's say you have a backend system producing an event each time a user makes a purchase on the site, and you want to show a widget with the latest purchases customers have made, then you can use this application to set up an API returning the latest purchases required by the widget.

### How to:
1. Configure database connection and data data outputs/inputs in config.json
2. Make sure database is running.
3. Run command 'node src/main.js' in root folder.
4. Open http://localhost:8080/swagger/ in a browser to see API documentation.
