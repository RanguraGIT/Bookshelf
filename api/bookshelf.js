'use strict'

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const dotenv = require('dotenv')

const api = async () => {
    dotenv.config()

    const username = process.env.MONGO_USERNAME
    const password = process.env.MONGO_PASSWORD
    const cluster = process.env.MONGO_CLUSTER

    const path = `mongodb+srv://${username}:${password}@${cluster}.mongodb.net/?retryWrites=true&w=majority`
    return MongoClient.connect(path, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: { version: ServerApiVersion.v1 } })
}

const bookCreate = (book) => {
    return new Promise(async (resolve, reject) => {
        let client, db, response

        console.log('Client is connecting to MongoDB Atlas bookshelf database..')

        try {
            client = await api()
            db = client.db('bookshelf')
            response = await db.collection('books').insertOne(book)

            console.log('Client has connected to MongoDB Atlas and inserted a book into the bookshelf database..')
            
            resolve(response.insertedId.toString())
        } catch (error) {
            reject(error)
        } finally {
            client.close()
        }

        console.log('Client has disconnected from MongoDB Atlas bookshelf database..')
    })
}

const bookUpdate = (id, book) => {
    return new Promise(async (resolve, reject) => {
        let client, db, response

        console.log('Client is connecting to MongoDB Atlas bookshelf database..')

        try {
            client = await api()
            db = client.db('bookshelf')
            response = await db.collection('books').updateOne({ _id: new ObjectId(id) }, { $set: book })
            
            console.log('Client has connected to MongoDB Atlas and updated a book in the bookshelf database..')

            resolve(response.matchedCount === 0 ? false : true)
        } catch (error) {
            reject(error)
        } finally {
            client.close()
        }

        console.log('Client has disconnected from MongoDB Atlas bookshelf database..')
    })
}

const bookDelete = (id) => {
    return new Promise(async (resolve, reject) => {
        let client, db, deleted

        console.log('Client is connecting to MongoDB Atlas bookshelf database..')

        try {
            client = await api()
            db = client.db('bookshelf')
            deleted = await db.collection('books').deleteOne({ _id: new ObjectId(id) })
            
            console.log('Client has connected to MongoDB Atlas and deleted a book from the bookshelf database..')

            resolve(deleted.deletedCount === 0 ? false : true)
        } catch (error) {
            reject(error)
        } finally {
            client.close()
        }

        console.log('Client has disconnected from MongoDB Atlas bookshelf database..')
    })
}

const bookRead = (id) => {
    return new Promise(async (resolve, reject) => {
        let client, db, book

        console.log('Client is connecting to MongoDB Atlas bookshelf database..')

        try {
            client = await api()
            db = client.db('bookshelf')
            book = await db.collection('books').findOne({ _id: new ObjectId(id) })

            if (book) {
                const updatedBook = {...book, id: book._id};
                delete updatedBook._id;
                resolve(updatedBook);
            }

            console.log('Client has connected to MongoDB Atlas and read a book from the bookshelf database..')

            resolve(book)
        } catch (error) {
            reject(error)
        } finally {
            client.close()
        }

        console.log('Client has disconnected from MongoDB Atlas bookshelf database..')
    })
}

const bookList = (filter = {}) => {
    return new Promise(async (resolve, reject) => {
        let client, db, books;

        console.log('Client is connecting to MongoDB Atlas bookshelf database..')

        try {
            client = await api();
            db = client.db('bookshelf');
            books = await db.collection('books').find(filter).toArray();
            
            const customIdBooks = books.map(book => {
                return {
                    id: book._id.toString(),
                    name: book.name,
                    publisher: book.publisher
                };
            });

            console.log('Client has connected to MongoDB Atlas and read all books from the bookshelf database..')

            resolve(customIdBooks)
        } catch (error) {
            reject(error);
        } finally {
            client.close();
        }

        console.log('Client has disconnected from MongoDB Atlas bookshelf database..')
    });
}

module.exports = {
    bookCreate,
    bookUpdate,
    bookDelete,
    bookRead,
    bookList
}