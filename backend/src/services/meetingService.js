import redis from "../config/redis.js";
import Meeting from "../models/Meeting.js";
import MeetingUser from "../models/MeetingUser.js";

export const createMeeting = async (meetingData) => {

    const { host, ...meetingInfo } = meetingData;

    const meeting = await Meeting.create(meetingInfo);
    await MeetingUser.create(
        {
            userId: host,
            meetingId: meeting.id,
            role: "host"
        })

    await redis.del("meetings");

    return meeting;
};

export const getMeetings = async () => {
    const cachedMeetings = await redis.get("meetings");
    if (cachedMeetings) {
        console.log("Get meetings from cache Redis");
        return JSON.parse(cachedMeetings);
    }

    const meetings = await Meeting.findAll();
    await redis.set("meetings", JSON.stringify(meetings), "EX", 600);
    return meetings;
};

export const getMeetingById = async (id) => {
    const cachedMeeting = await redis.get(`meeting:id:${id}`);
    if (cachedMeeting) {
        console.log("Get meeting from cache Redis");
        return JSON.parse(cachedMeeting);
    }
    const meeting = await Meeting.findByPk(id);
    if (!meeting) return null;

    await redis.set(`meeting:id:${id}`, JSON.stringify(meeting), "EX", 300);
    return meeting;
};

export const getMeetingByCodeMeeting = async (meetingCode) => {
    const cachedMeeting = await redis.get(`meeting:code:${meetingCode}`);
    if (cachedMeeting) {
        console.log("Get meeting from cache Redis");
        return JSON.parse(cachedMeeting);
    }
    const meeting = await Meeting.findOne({ where: { meetingCode } });
    if (!meeting) return null;
    await redis.set(`meeting:code:${meetingCode}`, JSON.stringify(meeting), "EX", 300);
    return meeting;
}

export const getMeetingByUser = async (userId) => {
    const cachedMeeting = await redis.get(`meeting:user:${userId}`);
    if (cachedMeeting) {
        console.log("Get meeting from cache Redis");
        return JSON.parse(cachedMeeting);
    }

    try {
        const meetings = await Meeting.findAll({
            include: [
                {
                    model: MeetingUser,
                    where: { userId },
                    attributes: [],
                },
            ],
        });
        if (!meetings.length) return null;
        await redis.set(`meeting:user:${userId}`, JSON.stringify(meetings), "EX", 300);
        return meetings;

    } catch (err) {
        console.log(err)
    }
};

export const updateMeeting = async (id, meetingData) => {
    const meeting = await Meeting.findByPk(id);
    if (!meeting) return null;

    await meeting.update(meetingData);

    // Invalidate related caches
    await redis.del(`meeting:id:${id}`);
    await redis.del(`meeting:code:${meeting.meetingCode}`);
    await redis.del("meetings");

    return meeting;
};

export const deleteMeeting = async (id) => {
    const meeting = await Meeting.findByPk(id);
    if (!meeting) return null;

    // Delete associated MeetingUser records
    await MeetingUser.destroy({ where: { meetingId: id } });
    await meeting.destroy();

    // Invalidate related caches
    await redis.del(`meeting:id:${id}`);
    await redis.del(`meeting:code:${meeting.meetingCode}`);
    await redis.del("meetings");

    return { message: "Meeting deleted successfully" };
};