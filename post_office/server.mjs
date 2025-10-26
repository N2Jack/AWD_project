import express from 'express';
import mysql from 'mysql2';

const server = express();
server.use(express.json());

const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mobile_post_office'
});

// GET: 按区检索
server.get('/mobilepost',
    function (request, response) {
        console.log('GET /mobilepost', 'Get records by district');
        const district = request.query.district;
        if (!district) {
            response.status(400).send(JSON.stringify({ success: false, err_code: '1001', err_msg: 'Missing district parameter' }));
            response.end();
            return;
        }
        conn.connect((err) => {
            if (err) {
                response.status(500).send(JSON.stringify({ success: false, err_code: '1000', err_msg: 'DB connection error' }));
                console.log(err);
                response.end();
                return;
            }
        });
        console.log('DB connected');
        conn.query(
            "SELECT * FROM mobile_post_offices WHERE district_en = ?",
            [district],
            (err, results) => {
                if (err) {
                    response.status(500).send(JSON.stringify({ success: false, err_code: '1002', err_msg: 'SQL execution error' }));
                    console.log(err);
                    response.end();
                    return;
                } else {
                    console.log('SQL successful');
                    response.send(JSON.stringify({ success: true, result: results, message: `${results.length} records retrieved` }));
                    response.end();
                }
            }
        );
    }
);

// GET: 单条记录
server.get('/mobilepost/:id',
    function (request, response) {
        console.log('GET /mobilepost/:id', 'Get record by ID');
        const id = request.params.id;
        conn.connect((err) => { });
        conn.query(
            "SELECT * FROM mobile_post_offices WHERE id = ?",
            [id],
            (err, results) => {
                if (err || results.length === 0) {
                    response.status(404).send(JSON.stringify({ success: false, err_code: '1003', err_msg: 'Record not found' }));
                    response.end();
                    return;
                } else {
                    response.send(JSON.stringify({ success: true, result: results[0] }));
                    response.end();
                }
            }
        );
    }
);

// POST: 创建记录
server.post('/mobilepost',
    function (request, response) {
        console.log('POST /mobilepost', 'Create new record');
        const { mobile_code, location_en, district_en } = request.body;
        if (!mobile_code || !location_en) {
            response.status(400).send(JSON.stringify({ success: false, err_code: '1004', err_msg: 'Missing required fields' }));
            response.end();
            return;
        }
        conn.connect((err) => { });
        conn.query(
            "INSERT INTO mobile_post_offices (mobile_code, location_en, district_en) VALUES (?, ?, ?)",
            [mobile_code, location_en, district_en],
            (err, results) => {
                if (err) {
                    response.status(500).send(JSON.stringify({ success: false, err_code: '1002', err_msg: 'SQL execution error' }));
                    console.log(err);
                    response.end();
                    return;
                } else {
                    console.log('SQL successful');
                    response.send(JSON.stringify({ success: true, message: 'New record created', id: results.insertId }));
                    response.end();
                }
            }
        );
    }
);

// PUT: 更新记录
server.put('/mobilepost/:id',
    function (request, response) {
        console.log('PUT /mobilepost/:id', 'Update record');
        const id = request.params.id;
        const { location_en } = request.body;
        conn.connect((err) => { });
        conn.query(
            "UPDATE mobile_post_offices SET location_en = ? WHERE id = ?",
            [location_en, id],
            (err, results) => {
                if (err || results.affectedRows === 0) {
                    response.status(404).send(JSON.stringify({ success: false, err_code: '1003', err_msg: 'Record not found or update failed' }));
                    response.end();
                    return;
                } else {
                    response.send(JSON.stringify({ success: true, message: 'Record updated' }));
                    response.end();
                }
            }
        );
    }
);

// DELETE: 删除记录
server.delete('/mobilepost/:id',
    function (request, response) {
        console.log('DELETE /mobilepost/:id', 'Delete record');
        const id = request.params.id;
        conn.connect((err) => { });
        conn.query(
            "DELETE FROM mobile_post_offices WHERE id = ?",
            [id],
            (err, results) => {
                if (err || results.affectedRows === 0) {
                    response.status(404).send(JSON.stringify({ success: false, err_code: '1003', err_msg: 'Record not found' }));
                    response.end();
                    return;
                } else {
                    response.send(JSON.stringify({ success: true, message: 'Record deleted' }));
                    response.end();
                }
            }
        );
    }
);

server.listen(8888, function () {
    console.log("Server started on port 8888");
});
