const express = require('express');
const cors = require('./cors');
const playerImageUtils = require('./utils/playerImage');

const playerEmblemRouter = express.Router();

playerEmblemRouter.route('/with-gamertag/:gamertag')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, async (req, res, next) => {
    try {
        let responses = await playerImageUtils.getMultipleEmblems(['crispiestsquid', 'crankiestseeker', 'shadowfoxace'], 512);
        console.log(responses);
        let playerImage = await playerImageUtils.getEmblem(req.params.gamertag);
        res.status = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, emblemUrl: playerImage.data.responseUrl});
    } catch (err) {
        next(err);
    }
});

module.exports = playerEmblemRouter;