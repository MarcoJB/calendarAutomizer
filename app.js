const request = require('request');
require("dotenv").config();

var { MailListener } = require("mail-listener6");   // NOTE: A FUTURE VERSION (release date TBA) will not require ES6 destructuring or referring to the class after the require statement (i.e. require('mail-listener6').MailListener). At this stage, this is necessary because index.js exports the MailListener class as a property of module.exports.

var mailListener = new MailListener({
  username: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASSWORD,
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT, // imap port
  tls: true,
  connTimeout: 10000, // Default by node-imap
  authTimeout: 5000, // Default by node-imap,
  debug: console.log, // Or your custom function with only one incoming argument. Default: null
  tlsOptions: { rejectUnauthorized: false },
  mailbox: "INBOX", // mailbox to monitor
  searchFilter: ["UNSEEN"], // the search filter being used after an IDLE notification has been retrieved
  markSeen: true, // all fetched email willbe marked as seen and not fetched next time
  fetchUnreadOnStart: true, // use it only if you want to get all unread email on lib start. Default is `false`,
  attachments: false, // download attachments as they are encountered to the project directory
  //attachmentOptions: { directory: "attachments/" } // specify a download directory for attachments
});

mailListener.start(); // start listening

mailListener.on("attachment", function(attachment, path, seqno) {
  if (attachment.contentType == "text/calendar") {
    let content = attachment.content.toString('ascii')
    const uid = encodeURIComponent(content.replaceAll("\r", "").split("UID:")[1].split("\n")[0])

    if (content.indexOf("METHOD:CANCEL") < 0) {
      content = content.replace("METHOD:REQUEST", "METHOD:PUBLISH")
      content = content.replaceAll("PARTSTAT=NEEDS-ACTION", "PARTSTAT=ACCEPTED")
      console.log(content)
      request(
        {
          method: "PUT",
          url : process.env.CALDAV_ADDRESS + uid + ".ics",
          auth: {
            user: process.env.CALDAV_USER,
            password: process.env.CALDAV_PASSWORD
          },
          headers : {
              "Content-Type": "text/calendar; charset=utf-8"
          },
          body: content
        },
        function (error, response, body) {
          console.log(body)
        }
      )
    } else {
      console.log(content)
      request(
        {
          method: "DELETE",
          url : process.env.CALDAV_ADDRESS + uid + ".ics",
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
  }
})