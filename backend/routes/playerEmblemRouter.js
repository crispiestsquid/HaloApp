const express = require('express');
const cors = require('./cors');
const playerImageUtils = require('./utils/playerImage');

const playerEmblemRouter = express.Router();

playerEmblemRouter.route('/with-gamertag/:gamertag/:size?')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, async (req, res, next) => {
    try {
        let size = req.params.size || '256';
        let playerImage = await playerImageUtils.getEmblem(req.params.gamertag, size);
        res.status = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, emblemUrl: playerImage.data.responseUrl});
    } catch (err) {
        next(err);
    }
});

playerEmblemRouter.route('/with-gamertags/:size?')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.post(cors.cors, async (req, res, next) => {
    try {
        let size = req.params.size || '256';
        let emblemUrls = await playerImageUtils.getMultipleEmblems(req.body.gamertags, size);
        res.status = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, emblemUrls: emblemUrls});
    } catch (err) {
        next(err);
    }
});

module.exports = playerEmblemRouter;