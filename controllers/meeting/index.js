db.meeting_rooms.findOne({
    "room_id": 2,
    "bookings": {
        "$elemMatch":
        {
            "$or": [{
                "$and":
                    [{ "room_booked_from": { "$lte": "2019-05-08T00:00:00.000Z" } }, { "room_booked_to": { "$gt": "2019-05-08T00:00:00.000Z" } }]
            }
                , { "$and": [{ "room_booked_from": { "$lt": "2019-05-08T04:00:00.000Z" } }, { "room_booked_to": { "$gte": "2019-05-08T04:00:00.000Z" } }] }
                , { "$and": [{ "room_booked_from": { "$gte": "2019-05-08T00:00:00.000Z" } }, { "room_booked_to": { "$lte": "2019-05-08T04:00:00.000Z" } }] }]
            , "booking_id": { "$ne": "5ccfeed8a67f61538c00da84" }
        }
    }
})