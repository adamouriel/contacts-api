const db = require('./queries.js');
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3030;

// Middleware needs to go first
app.use(cors());
app.use(express.json());

app.get('/', (request, response) => { response.json({ info: 'Node.js, Express and Postgres API' }) })

app.get('/contacts', db.getContacts);
app.get('/contact', db.getContact);
app.post('/contacts', db.addContact);
app.delete("/contact/:id", db.deleteContact);
app.put('/contacts', db.updateContact);

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})

