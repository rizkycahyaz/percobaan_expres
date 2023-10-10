const express = require('express');
const router = express.Router();

const {body , validationResult}  = require('express-validator');

const connection = require('../config/bd');
const multer = require('multer');
const path = require('path')
const fs = require('fs')
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null,'public/images')
    },
    filename: (req, file, cb) => {
      console.log(file)
      cb(null, Date.now() + path.extname(file.originalname))
    }
})
const upload = multer({storage: storage})




router.get("/", function (req, res) {
  connection.query(
    " SELECT mahasiswa.nama, jurusan.nama_jurusan " +
      " from mahasiswa join jurusan " +
      " ON mahasiswa.id_jurusan=jurusan.id_j order by mahasiswa.id_m desc",
    function (err, rows) {
      if (err) {
        return res.status(500).json({
          status: false,
          message: "server failed",
          error: err,
        });
      } else {
        return res.status(200).json({
          status: true,
          message: "Data mahasiswa",
          data: rows,
        });
      }
    }
  );
});

router.post( "/store",upload.single("gambar"),[
    body("nama").notEmpty(),
    body("nrp").notEmpty(),
    body("id_jurusan").notEmpty(),
  ],
  (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(422).json({
        error: error.array(),
      });
    }
    let Data = {
      nama: req.body.nama,
      nrp: req.body.nrp,
      id_jurusan: req.body.id_jurusan,
      gambar: req.file.filename
    };
    connection.query(
      "insert into mahasiswa set ? ",
      Data,
      function (err, rows) {
        if (err) {
          return res.status(500).json({
            status: false,
            message: "server failed",
          });
        } else {
          return res.status(201).json({
            status: true,
            message: "Success",
            data: rows[0],
          });
        }
      }
    );
  }
);

router.get("/(:id)", function (req, res) {
  let id = req.params.id;
  connection.query(
    `select * from mahasiswa where id_m = ${id}`,
    function (err, rows) {
      if (err) {
        return res.status(500).json({
          status: false,
          message: "server error",
        });
      }
      if (rows.length <= 0) {
        return res.status(404).json({
          status: false,
          message: "Not Found",
        });
      } else {
        return res.status(200).json({
          status: true,
          message: "data mahasiswa",
          data: rows[0],
        });
      }
    }
  );
});

router.patch(
  "/update/:id",upload.single("gambar"),
  [
    body("nama").notEmpty(),
    body("nrp").notEmpty(),
    body("id_jurusan").notEmpty(),
  ],
  (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(422).json({
        error: error.array(),
      });
    }
    let id = req.params.id;
    let gambar = req.file ? req.file.filename : null;

    connection.query(`select * from mahasiswa where id_m = ${id}`,function(err, rows){
      if(err){
        return res.status(500).json({
          status : false,
          message :'Not Found',
        })
      }
      if(rows.length ===0){
        return res.status(404).json({
          status : false,
          message : 'Not Found',
        })
      }
      const nameFilelama = rows[0].gambar;

      if (nameFilelama && gambar){
        const pathFilelama = path.join(__dirname,'../public/images', nameFilelama);
        fs.unlinkSync(pathFilelama);
      }

      let Data = {
        nama: req.body.nama,
        nrp: req.body.nrp,
        id_jurusan: req.body.id_jurusan,
        gambar: gambar
      }

      connection.query( `update mahasiswa set ? where id_m = ${id}`,Data,function (err, rows) {
        if (err) {
          return res.status(500).json({
            status: false,
            message: "server error",
          })
        }else{
          return res.status(200).json({
            status: true,
            message: "update",
        })
      }
    })
  })


})

    
router.delete('/delete/(:id)', function(req, res){
  let id = req.params.id;

  connection.query(`select * from mahasiswa where id_m = ${id}`, function (err, rows) {
      if(err){
          return res.status(500).json({
              status: false,
              message: 'Server Error',
          })
      }
      if(rows.length ===0){
          return res.status(404).json({
              status: false,
              message: 'Not Found',
          })
      }
      const namaFileLama = rows[0].gambar;

      // Hapus file lama jika ada
      if (namaFileLama) {
          const pathFileLama = path.join(__dirname, '../public/images', namaFileLama);
          fs.unlinkSync(pathFileLama);
      }

      
      connection.query(`delete from mahasiswa where id_m = ${id}`, function (err, rows) {
          if(err){
              return res.status(500).json({
                  status: false,
                  message: 'Server Error',
              })
          }else{
              return res.status(200).json({
                  status: true,
                  message: 'Data  telah dihapus !',
              })
          }
      })

  })

});

module.exports = router;
