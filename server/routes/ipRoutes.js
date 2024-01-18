const express = require("express");
const Ip=require('../models/ipModel')
const router = express.Router();
router.get("/", (req, res) => {
    Ip.find()
        .then((data) => {
            console.log(data)
            res.status(200).json(data);
        })
        .catch((err) => {
            res.status(500).json(err);
        });
});
module.exports = router;
