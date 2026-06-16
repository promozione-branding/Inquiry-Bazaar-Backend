import mongoose from "mongoose";
import Help from "../models/help.model.js";

export const getAllHelpRequestsService = async (role) => {
    let query = {};

    if (role && role !== "all") {
        query = { role, };
    }

    const helpRequests = await Help.find()
        .populate({
            path: "userId",
            select: "name email phone role profileImage",
            match: query,
        }).sort({ createdAt: -1 }).lean();

    // console.log(helpRequests)
    return helpRequests.filter((item) => item.userId);
};

export const getHelpRequestByIdService = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) { throw new Error("Invalid help id"); }

    const help = await Help.findById(id)
        .populate("userId", "name email phone role profileImage").lean();

    return help;
};

export const replyHelpRequestService = async (id, reply, status, adminId) => {

    const updated = await Help.findByIdAndUpdate(id, {
        adminReply: reply,
        status,
        repliedBy: adminId,
        repliedAt: new Date(),
    },
        { new: true, }
    );

    return updated;
};