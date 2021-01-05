const express = require('express');
const spartanCompanyUtils = require('./utils/companyInfo');

const spartanCompanyRouter = express.Router();

spartanCompanyRouter.route('/with-gamertag/:gamertag')
.get(async (req, res, next) => {
    try {
        const spartanCompany = await spartanCompanyUtils.getCompanyInfo(req.params.gamertag);
        const spartanCompanyCommendations = await spartanCompanyUtils.getCompanyComm(req.params.gamertag);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({'company': spartanCompany, 'commendations': spartanCompanyCommendations});
        // spartanCompanyUtils.getAchillesProg(spartanCompanyCommendations);
        // spartanCompanyUtils.getAchillesProg(spartanCompanyCommendations,"armor");
    } catch (err) {
        next(err);
    }
});

spartanCompanyRouter.route('/with-company-id/:companyId')
.get(async (req, res, next) => {
    try {
        const spartanCompany = await spartanCompanyUtils.getCompanyInfo(null, req.params.companyId);
        const spartanCompanyCommendations = await spartanCompanyUtils.getCompanyComm(null, req.params.companyId);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({'company': spartanCompany, 'commendations': spartanCompanyCommendations});
    } catch (err) {
        next(err);
    }
});

module.exports = spartanCompanyRouter;