const express = require("express");
const router = express.Router();

const connection = require("../config/bd");
const { body, validationResult } = require("express-validator");

router.get("/", function (req, res) {
  connection.query(" SELECT * FROM jurusan ", function (err, rows) {
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
  });
});

router.post("/store", [body("nama_jurusan").notEmpty()], (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(422).json({
      error: error.array(),
    });
  }
  let Data = {
    nama_jurusan: req.body.nama_jurusan,
  };
  connection.query("insert into jurusan set ? ", Data, function (err, rows) {
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
  });
});

router.get("/(:id)", function (req, res) {
  let id = req.params.id;
  connection.query(
    `select * from jurusan where id_j = ${id}`,
    function (err, rows) {
      if (err) {
        return res.status(500).json({
          status: false,
          message: "server error",
          error: err,
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
  "/update/:id",
  [
    body("nama_jurusan").notEmpty()
    
  ],
  (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(422).json({
        error: error.array(),
      });
    }
    let id = req.params.id;
    let data = {
      nama_jurusan: req.body.nama_jurusan
    };
    connection.query(
      `update jurusan set ? where id_j = ${id}`,
      data,
      function (err, rows) {
        if (err) {
          return res.status(500).json({
            status: false,
            message: "server error",
          });
        } else {
          return res.status(200).json({
            status: true,
            message: "update",
          });
        }
      }
    );
  }
);

router.delete("/delete/(:id)", function (req, res) {
  let id = req.params.id;
  connection.query(
    `delete from jurusan where id_j = ${id}`,
    function (err, rows) {
      if (err) {
        return res.status(500).json({
          status: false,
          message: "server error",
        });
      } else {
        return res.status(200).json({
          status: true,
          message: "Data di hapus",
        });
      }
    }
  );
});

module.exports = router;
