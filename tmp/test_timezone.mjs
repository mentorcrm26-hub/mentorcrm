import { formatInTimeZone, toDate } from 'date-fns-tz';

function getFloridaDate(dateString) {
    if (!dateString) return new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
    
    // dateString is "2026-03-20T01:18:00+00:00"
    // When we do new Date(), node parses it correctly from UTC to local
    return new Date(new Date(dateString).toLocaleString("en-US", { timeZone: "America/New_York" }));
}

const dbString = "2026-03-20T01:18:00+00:00";
const meetingAt = getFloridaDate(dbString);

// Simulate "now" as 20:20 PM Orlando time today (which is Mar 19)
const simulateNow = new Date("2026-03-19T20:23:00-04:00"); 
// wait, if getFloridaDate uses toLocaleString, we should use exactly what route.ts uses:
const now = getFloridaDate("2026-03-19T20:23:00-04:00"); 

const diffMinutes = Math.round((meetingAt.getTime() - now.getTime()) / (60 * 1000));

console.log("meetingAt:", meetingAt);
console.log("now:", now);
console.log("diffMinutes:", diffMinutes);
