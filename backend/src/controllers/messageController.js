import * as messageService from "../services/messageService.js";

export const sendMessage = async (req, res) => {
    try {
        const message = await messageService.sendMessage(req.body);
        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getMessagesByMeeting = async (req, res) => {
    try {
        const messages = await messageService.getMessagesByMeeting(req.params.meetingId);
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
