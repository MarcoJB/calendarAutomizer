const request = require('request');
require("dotenv").config();


createEvent("test", "Testtermin", "20211106T120000Z", "20211106T123000Z")
setTimeout(() => {
  deleteEvent("test")
}, 5000)


function createEvent(id, title, start, end, location, description) {
  if (!id || !title || !start || !end) return false
git
  location = location || ""
  description = description || ""

  const timestamp = new Date().toISOString().replaceAll("-", "").replaceAll(":", "").substr(0, 15) + "Z"
  request(
    {
      method: "PUT",
      url : process.env.CALDAV_ADDRESS + id + ".ics",
      auth: {
        user: process.env.CALDAV_USER,
        password: process.env.CALDAV_PASSWORD
      },
      headers : {
          "Content-Type": "text/calendar; charset=utf-8"
      },
      body: "BEGIN:VCALENDAR\n" +
            "VERSION:2.0\n" +
            "PRODID:GreenpeaceCalendarAutomizer\n" +
            "BEGIN:VEVENT\n" +
            "UID:" + id + "\n" +
            "LOCATION:" + location + "\n" +
            "SUMMARY:" + title + "\n" +
            "DESCRIPTION:" + description + "\n" +
            "DTSTAMP:" + timestamp + "\n" +
            "DTSTART:" + start + "\n" +
            "DTEND:" + end + "\n" +
            "END:VEVENT\n" +
            "END:VCALENDAR"
    },
    function (error, response, body) {
      console.log(body)
    }
  )
}

function deleteEvent(id) {
  request(
    {
      method: "DELETE",
      url : process.env.CALDAV_ADDRESS + id + ".ics",
      auth: {
        user: process.env.CALDAV_USER,
        password: process.env.CALDAV_PASSWORD
      }
    },
    function (error, response, body) {
      console.log(body)
    }
  )
}