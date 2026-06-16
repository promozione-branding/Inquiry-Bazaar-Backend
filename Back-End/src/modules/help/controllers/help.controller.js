import { getAllHelpRequestsService, getHelpRequestByIdService, replyHelpRequestService } from "../services/help.service.js";

export const getAllHelpRequests = async (req, res) => {
    try {
        const { role } = req.params;
        // console.log(role)
        const helpRequests = await getAllHelpRequestsService(role);

        return res.status(200).json({
            success: true,
            count: helpRequests.length,
            data: helpRequests,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getHelpRequestById = async (req, res) => {
    try {
        const { id } = req.params;
        const help = await getHelpRequestByIdService(id);

        if (!help) {
            return res.status(404).json({
                success: false,
                message: "Help request not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: help,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const replyHelpRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { reply, status, } = req.body;

        const help = await replyHelpRequestService(id, reply, status, req.user._id);

        return res.status(200).json({
            success: true,
            message: "Reply sent",
            data: help,
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};