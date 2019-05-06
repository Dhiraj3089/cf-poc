const express = require("express");
const router = express.Router();
const Meeting = require('../controllers/meeting');

router.get('/', (req, res) => {
    res.redirect("/index.html");
});

router.get('/rooms', async (req, res) => {
    let room_id = req.query["id"];
    let meeting = new Meeting();
    let rooms = await meeting.getMeetingRooms(room_id);
    res.send(rooms);
});

router.post('/set-meeting', async (req, res) => {
    try {
        let meeting = new Meeting();
        let bookings = await meeting.setMeeting(req.body.room_id, req.body.bookedFrom, req.body.bookedTo);
        res.send(bookings);
    } catch (error) {
        res.status(404).send({ error: error.message });
    }
});

router.post('/update-meeting', async (req, res) => {
    try {
        let meeting = new Meeting();
        let bookings = await meeting.updateMeeting(req.body.room_id, req.body.booking_id, req.body.bookedFrom, req.body.bookedTo);
        res.send(bookings);
    } catch (error) {
        res.status(404).send({ error: error.message });
    }
});

router.post('/cancel-meeting', async (req, res) => {
    try {
        let meeting = new Meeting();
        let result = await meeting.cancelMeeting(req.body.room_id, req.body.booking_id);
        res.send(result);
    } catch (error) {
        res.status(404).send({ error: error.message });
    }
})

module.exports = router;