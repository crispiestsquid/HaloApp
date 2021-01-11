const express = require('express');
const cors = require('./cors');
const spartanCompanyUtils = require('./utils/companyInfo');

const spartanCompanyRouter = express.Router();

spartanCompanyRouter.route('/with-gamertag/:gamertag')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, async (req, res, next) => {
    try {
        const spartanCompany = await spartanCompanyUtils.getCompanyInfo(req.params.gamertag);
        const spartanCompanyCommendations = await spartanCompanyUtils.getCompanyComm(req.params.gamertag);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({'company': spartanCompany, 'commendations': spartanCompanyCommendations});
    } catch (err) {
        next(err);
    }
});

spartanCompanyRouter.route('/with-company-id/:companyId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, async (req, res, next) => {
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

spartanCompanyRouter.route('/player-contributions')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.post(cors.corsWithOptions, async (req, res, next) => {
    try {
        const playerContributions = await spartanCompanyUtils.getPlayerContribs(req.body.members);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({'contributions': playerContributions});
    } catch (err) {
        next(err);
    }
});

module.exports = spartanCompanyRouter;
