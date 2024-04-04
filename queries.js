const Pool = require("pg").Pool;
const fs = require('fs');

// psql -h database-1.c5s6qcsqog3y.us-east-2.rds.amazonaws.com -p 5432 -U postgres -d postgres

const pool = new Pool({
    user: "postgres",
    host: "database-1.c5s6qcsqog3y.us-east-2.rds.amazonaws.com",
    database: "contacts",
    password: "nebulabros",
    port: 5432, 
    ssl: { 
        rejectUnauthorized: true, 
        ca: fs.readFileSync('us-east-2-bundle.pem').toString()
    }
});

const getContacts = (request, response) => {
    pool.query("SELECT * FROM people", (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
};

const addContact = (req, res) => {
    try {
        const { name, email_address, age } = req.body;

        pool.query(
            `INSERT INTO people (name, email_address, age) VALUES ($1, $2, $3) RETURNING *;`,
            [name, email_address, age],
            ((error, results) => {
                if (error) {
                    console.log(error, '<--- error here')
                    throw error;
                }
                console.log(results, "<--- result!")
                res.status(200).json(results.rows)
            })
        );
    } catch (error) {
        throw error;
    }
}

const deleteContact = (request, response) => {
    const id = parseInt(request.params.id);
    pool.query(`DELETE FROM people WHERE id = ${id}`, (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
};

const getContact = (request, response) => {
    const { id } = request.body;
    console.log(id)
    pool.query("SELECT * FROM people WHERE id=$1", [id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
        return results.rows
    });
};

const updateContact = (req, res) => {
    let { name, email_address, age, id } = req.body;
    // Use a promise to request the existing data - we need a promise or else everything will happen in the wrong order
    let myPromise = new Promise(function (resolve, reject) {
        pool.query("SELECT * FROM people WHERE id=$1", [id], (error, results) => {
            if (error) {
                throw error;
            } else if (res) {
                // if an item doesn't have given data, set it with the existing data 
                name = name !== undefined ? name : results.rows.name;
                email_address = email_address !== undefined ? email_address : results.rows.email_address;
                age = age !== undefined ? age : results.rows.age;
                // We then resolve the promise
                resolve(results.rows)
                return results.rows
            } else {
                reject()
            }
        })
    });
    // `.then()` and update the data
    myPromise.then(() => {
        try {
            pool.query(
                `UPDATE people 
              SET name=$1, email_address=$2, age=$3 
              WHERE id = $4;`,
                [name, email_address, age, id],
                (error, results) => {
                    if (error) {
                        console.log(error, '<--- error here')
                        throw error;
                    }
                    console.log(results, "<--- result!")
                    res.status(200).json(results.rows)
                }
            );
        } catch (error) {
            throw error;
        }
    })
};

module.exports = {
    getContacts,
    addContact,
    getContact,
    deleteContact,
    updateContact
}