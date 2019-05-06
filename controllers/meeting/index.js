const mongoClient = require('../db/mongo_connection');
const ObjectId = require('mongodb').ObjectId;

class Meeting {
    constructor() {
        this.db = mongoClient.getDb().db();
        this.collection = this.db.collection('meeting_rooms');

    }

    async getMeetingRooms(room_id) {
        let queryObj = room_id ? { room_id: parseInt(room_id) } : {};
        return this.collection.find(queryObj).project({ _id: 0 }).sort({ room_id: 1 }).toArray();
    }

    async setMeeting(room_id, booked_from, booked_to) {
        try {
            this.verifyDates(booked_from, booked_to);
            booked_from = new Date(`${booked_from} UTC`);
            booked_to = new Date(`${booked_to} UTC`);
            let result;
            if (!(await this.checkIfSlotExists(room_id, booked_from, booked_to))) {
                result = await this.collection.findOneAndUpdate({
                    room_id: room_id
                },
                    {
                        $push: {
                            bookings: {
                                booking_id: new ObjectId(),
                                room_booked_from: booked_from,
                                room_booked_to: booked_to,
                            }
                        }
                    },
                    { mutli: false, returnOriginal: false }
                )
            } else {
                throw new Error("Room is not available for selected time slot");
            }

            return result.value;
        } catch (error) {
            throw error;
        }
    }

    async updateMeeting(room_id, booking_id, booked_from, booked_to) {
        try {
            let id = new ObjectId(booking_id);
            this.verifyDates(booked_from, booked_to);
            booked_from = new Date(`${booked_from} UTC`);
            booked_to = new Date(`${booked_to} UTC`);
            let result;
            if (!(await this.checkIfSlotExists(room_id, booked_from, booked_to, id))) {
                result = await this.collection.findOneAndUpdate({
                    room_id: room_id,
                    'bookings.booking_id': id
                },
                    {
                        $set: {
                            'bookings.$.room_booked_from': booked_from,
                            'bookings.$.room_booked_to': booked_to
                        }
                    },
                    { mutli: false, returnOriginal: false }
                )
            } else {
                throw new Error("Room is not available for selected time slot");
            }
            return result.value;
        } catch (error) {
            throw error;
        }
    }

    async cancelMeeting(room_id, booking_id) {
        const id = new ObjectId(booking_id);
        let result = await this.collection.findOneAndUpdate(
            { room_id, 'bookings.booking_id': id },
            { $pull: { bookings: { booking_id: id } } },
            { mutli: false, returnOriginal: false }
        );
        if (result.lastErrorObject.n === 0) {
            throw new Error("Selected booking not found for cancellation");
        }
        return result.value;
    }

    async checkIfSlotExists(room_id, booked_from, booked_to, booking_id) {
        let queryObj = {
            room_id: room_id,
            bookings: {
                $elemMatch: {
                    $or: [{
                        $and: [{
                            room_booked_from: {
                                $lte: booked_from
                            }
                        }, {
                            room_booked_to: {
                                $gt: booked_from
                            }
                        }],

                    }, {
                        $and: [{
                            room_booked_from: {
                                $lt: booked_to
                            }
                        }, {
                            room_booked_to: {
                                $gte: booked_to
                            }
                        }],

                    }, {
                        $and: [{
                            room_booked_from: {
                                $gte: booked_from
                            }
                        }, {
                            room_booked_to: {
                                $lte: booked_to
                            }
                        }],

                    }]
                }
            }
        }
        if (booking_id) {
            queryObj.bookings.$elemMatch["booking_id"] = { $ne: booking_id };
        }
        let result = await this.collection.find(queryObj).toArray();

        return result.length ? true : false;
    }

    verifyDates(booked_from, booked_to) {
        let currentDate = new Date();
        if (currentDate > new Date(booked_from) || currentDate > new Date(booked_to)) {
            throw new Error("Only future time slots are allowed");
        }
    }
}

module.exports = Meeting;
