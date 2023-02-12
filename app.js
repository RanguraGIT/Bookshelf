'use strict'

const http = require('http')
const bookshelf = require('./api/bookshelf')
const dotenv = require('dotenv')

dotenv.config()
const port = process.env.PORT

const server = http.createServer( async (request, response) => {
    const { method, url } = request

    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.setHeader('X-Powered-By', 'NodeJS');

    if (method === 'GET' && url === '/') {
        response.statusCode = 200
        response.write('connection oke!')
        response.end()
        return;
    }

    // Create all code green
    if (method === 'POST' && url === '/books') {
        let body = []

        request.on('data', (chunk) => {
            body.push(chunk)
        }).on('end', async () => {
            body = Buffer.concat(body).toString()
            const { name, year, author, summary, publisher, pageCount, readPage, reading } = JSON.parse(body)

            if (!name) {
                response.statusCode = 400
                response.write(
                    JSON.stringify({
                        status: "fail",
                        message: 'Gagal menambahkan buku. Mohon isi nama buku'
                    })
                )
                response.end()
                return;
            }

            if(!pageCount) {
                response.statusCode = 400
                response.write(
                    JSON.stringify({
                        status: "fail",
                        message: "Gagal menambahkan buku. pageCount tidak boleh kosong"
                    })
                )
                response.end()
                return;
            }

            if (readPage > pageCount) {
                response.statusCode = 400
                response.write(
                    JSON.stringify({
                        status: "fail",
                        message: "Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount"
                    })
                )
                response.end()
                return;
            }

            if (!reading === 'true' || !reading === 'false') {
                reading = false
            }

            const bookBody = {
                name: name,
                year: year ? year : 'tidak diketahui',
                author: author ? author : 'tidak diketahui',
                summary: summary ? summary : 'tidak diketahui',
                publisher: publisher ? publisher : 'tidak diketahui',
                pageCount: pageCount,
                readPage: readPage ? readPage : 0,
                finished: pageCount === readPage ? true : false,
                reading: reading,
                insertedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }

            const bookData = await bookshelf.bookCreate(bookBody)
            if(bookData) {
                response.statusCode = 201
                response.write(
                    JSON.stringify({
                        status: "success",
                        message: "Buku berhasil ditambahkan",
                        data: {
                            bookId: bookData
                        }
                    })
                )
                response.end()
            }else{
                response.statusCode = 500
                response.write(
                    JSON.stringify({
                        status: "error",
                        message: "Buku gagal ditambahkan"
                    })
                )
                response.end()
            }
        })
        return;
    }

    // Update all code green
    if (method === 'PUT' && url.startsWith('/books/')) {
        const bookId = url.split('/')[2]

        if(!validationID(bookId)) {
            response.statusCode = 404
            response.write(
                JSON.stringify({
                    status: "fail",
                    message: "Gagal memperbarui buku. Id tidak ditemukan"
                })
            )
            response.end()
            return;
        }

        let body = []

        request.on('data', (chunk) => {
            body.push(chunk)
        }).on('end', async () => {
            body = Buffer.concat(body).toString()
            const { name, year, author, summary, publisher, pageCount, readPage, reading } = JSON.parse(body)

            if (!name) {
                response.statusCode = 400
                response.write(
                    JSON.stringify({
                        status: "fail",
                        message: 'Gagal memperbarui buku. Mohon isi nama buku'
                    })
                )
                response.end()
                return;
            }

            if(!pageCount) {
                response.statusCode = 400
                response.write(
                    JSON.stringify({
                        status: "fail",
                        message: "Gagal memperbarui buku. pageCount tidak boleh kosong"
                    })
                )
                response.end()
                return;
            }

            if (readPage > pageCount) {
                response.statusCode = 400
                response.write(
                    JSON.stringify({
                        status: "fail",
                        message: "Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount"
                    })
                )
                response.end()
                return;
            }

            if (!reading === 'true' || !reading === 'false') {
                reading = false
            }

            const bookBody = {
                name: name,
                year: year ? year : 'tidak diketahui',
                author: author ? author : 'tidak diketahui',
                summary: summary ? summary : 'tidak diketahui',
                publisher: publisher ? publisher : 'tidak diketahui',
                pageCount: pageCount,
                readPage: readPage ? readPage : 0,
                finished: pageCount === readPage ? true : false,
                reading: reading,
                updatedAt: new Date().toISOString()
            }

            const bookData = await bookshelf.bookUpdate(bookId, bookBody)
            if(bookData) {
                response.statusCode = 200
                response.write(
                    JSON.stringify({
                        status: "success",
                        message: "Buku berhasil diperbarui"
                    })
                )
                response.end()
            }else{
                response.statusCode = 404
                response.write(
                    JSON.stringify({
                        status: "fail",
                        message: "Gagal memperbarui buku. Id tidak ditemukan"
                    })
                )
                response.end()
            }
        })
        return;
    }

    // Delete all code green
    if (method === 'DELETE' && url.startsWith('/books/')) {
        const bookId = url.split('/')[2]

        if(!validationID(bookId)) {
            response.statusCode = 404
            response.write(
                JSON.stringify({
                    status: "fail",
                    message: "Buku gagal dihapus. Id tidak ditemukan"
                })
            )
            response.end()
            return;
        }

        const bookData = await bookshelf.bookDelete(bookId)
        if(bookData) {
            response.statusCode = 200
            response.write(
                JSON.stringify({
                    status: "success",
                    message: "Buku berhasil dihapus"
                })
            )
            response.end()
        }else{
            response.statusCode = 404
            response.write(
                JSON.stringify({
                    status: "fail",
                    message: "Buku gagal dihapus. Id tidak ditemukan"
                })
            )
            response.end()
        }
        return;
    }

    // Detail all code green
    if (method === 'GET' && url.startsWith('/books/')) {
        const bookId = url.split('/')[2]

        if(!validationID(bookId)) {
            response.statusCode = 404
            response.write(
                JSON.stringify({
                    status: "fail",
                    message: "Buku tidak ditemukan"
                })
            )
            response.end()
            return;
        }

        const bookData = await bookshelf.bookRead(bookId)
        if(bookData) {
            response.statusCode = 200
            response.write(
                JSON.stringify({
                    status: "success",
                    data: {
                        book: bookData
                    }
                })
            )
            response.end()
        }else{
            response.statusCode = 404
            response.write(
                JSON.stringify({
                    status: "fail",
                    message: "Buku tidak ditemukan"
                })
            )
            response.end()
        }
        return;
    }

    // List all code green
    if (method === 'GET' && url.startsWith('/books')) {
        const query = new URL(request.url, `http://localhost:${port}`).searchParams;
        const name = query.get('name');
        const reading = query.get('reading');
        const finished = query.get('finished');
        
        const filter = {};
        if (name) {
            filter.name = new RegExp(name, 'i');
        }
        if (reading) {
            filter.reading = reading === '1';
        }
        if (finished) {
            filter.finished = finished === '1';
        }
        
        const bookData = await bookshelf.bookList(filter);
        
        response.statusCode = 200;
        response.write(
            JSON.stringify({
                status: 'success',
                data: {
                    books: bookData,
                },
            }),
        );
        response.end();
        return;
    }
      

    response.statusCode = 404
    response.write(
        JSON.stringify({
            status: "fail",
            message: "Halaman tidak ditemukan"
        })
    )
    response.end()
})

const validationID = (id) => {
    if (typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id)) {
      return true;
    }
  
    if (typeof id === 'number' || id instanceof Number) {
      return true;
    }
  
    return false;
}

server.listen(port, () => {
    console.log(`Server started on port ${port}`)
})