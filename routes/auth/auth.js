const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult, Result } = require ('express-validator');
const router = express.Router();
const connection = require('../../config/bd');


const secretKey = 'kunciRahasiaYangSama';


router.post('/register',[
    body('username').notEmpty().withMessage('isi semua bidang'),
    body('password').notEmpty().withMessage('isi semua bidang')
],(req , res ) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({ error : errors.array() });
    }
    const checkUserQuery = 'select * from username = ?';
    connection.query(checkUserQuery, [username], (err,result) =>{
        if (err) {
            return res.status(500).json({ error: 'server error'});
        }
        if (result.length > 0){
            return res.status(409).json({ error: 'pengguna sudah terdaftar'});
        }
        const insertUserQuery = 'insert into users (username, password) values (?,?)';
        connection.query(insertUserQuery, [username, password], (err, result)=>{
        if (err) {
            return res.status(500).json({ error: 'server error'});
        }
        const payload = {userId : result.insertId, username};
        const token = jwt.sign(payload,secretKey);
        const updateTokenQuery = 'update users set token = ? where id = ?';
        connection.query(updateTokenQuery, [token, result.insertId],(err, result) => {
            if (err) {
                return res.status(500).json({ error: 'server error'});
            }
                res.json({ token});
             });
        });
    });
});


router.post('/login', (req, res) => {
    const {username, password} = req.body;

    connection.query('select * from where username =?', [username], (error, result) => {
        if (error){
            return res.status(500).json({ error: 'server error'});
        }
        if (result.length == 0){
            return res.status(401).json({ error: 'gagal masuk'});
        }
        const user = result[0];
        if(user.password !== password){
            return res.status(401).json({ error: 'kata sandi salah'});
        }
        if (user.token){
            const token = user.token;
            res.json ({token});
        } else {
            const payload = { userId : user.id, username };
            const token = jwt.sign(payload, secretKey);
            const updateTokenQuery = 'update users set token =? where id =?';
            connection.query(updateTokenQuery, [token, user.id], (err, updateResult) => {
                if (err) {
                    return res.status(500).json({ error: 'server error'});
                }
                res.json({token});
            });
        }
    });
});


module.exports = router;