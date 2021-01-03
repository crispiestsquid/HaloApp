const express = require('express');
const axios = require('axios');
const spartanCompanyUtils = require('./utils/companyInfo');
const spartanCompanyRouter = express.Router();

spartanCompanyRouter.route('/')
.get((req, res, next) => {
    console.log("Calling API");
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.end('<body><h1>Hello World!</h1></body>');
});

spartanCompanyRouter.route('/:companyName')
.get((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.end(`<body><h1>Hello ${req.params.companyName}!</h1></body>`);
})
.post((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({companyName: req.params.companyName});
});

module.exports = spartanCompanyRouter;
