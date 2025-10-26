import mysql from 'mysql2';
import fs from 'fs'; // 用于读取本地 JSON 文件
import fetch from 'node-fetch'; // 用于动态读取JSON数据

// 连接数据库
const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root', // XAMPP 默认用户
    password: '', // XAMPP 默认密码为空，或根据您的设置修改
    database: 'mobile_post_office'
});

// 动态读取JSON数据
const response = await fetch('https://portal.csdi.gov.hk/geoportal/rest/api/dataset/download/hkpo_rcd_1638773566771_76062?lang=en&format=json');
const jsonData = await response.json();

// 连接数据库
conn.connect((err) => {
    if (err) {
        console.log('DB connection error');
        console.log(err);
        return;
    }
    console.log('DB connected');

    // 清空表以重新插入
    conn.query("TRUNCATE TABLE mobile_post_offices", (err) => {
        if (err) {
            console.log('TRUNCATE error');
            console.log(err);
            conn.end();
            return;
        }
        console.log('Table truncated');

        // 读取 JSON 文件
        const rawData = fs.readFileSync('mobile-office.json', 'utf8');
        const jsonData = JSON.parse(rawData);
        const records = jsonData.data;
        const lastUpdateDate = jsonData.lastUpdateDate; // 可选，插入每个记录或单独处理

        // 循环插入每个记录
        records.forEach((record) => {
            conn.query(
                "INSERT INTO mobile_post_offices (mobile_code, location_tc, location_sc, location_en, address_tc, address_sc, address_en, name_tc, name_sc, name_en, district_tc, district_sc, district_en, latitude, longitude, open_hour, close_hour, day_of_week_code, seq, last_update_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [
                    record.mobileCode,
                    record.locationTC,
                    record.locationSC,
                    record.locationEN,
                    record.addressTC,
                    record.addressSC,
                    record.addressEN,
                    record.nameTC,
                    record.nameSC,
                    record.nameEN,
                    record.districtTC,
                    record.districtSC,
                    record.districtEN,
                    parseFloat(record.latitude),
                    parseFloat(record.longitude),
                    record.openHour,
                    record.closeHour,
                    record.dayOfWeekCode,
                    record.seq,
                    lastUpdateDate // 如果每个记录都需要，可重复插入；否则可移除此字段
                ],
                (err, results) => {
                    if (err) {
                        console.log('SQL execution error');
                        console.log(err);
                    } else {
                        console.log('Record inserted successfully');
                    }
                }
            );
        });

        // 关闭连接
        conn.end();
    });
});