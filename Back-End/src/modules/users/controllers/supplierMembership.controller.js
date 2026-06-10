import { createOrUpdateMembershipService, getMembershipBySupplierService, } from "../services/supplierMembership.service.js";

export const createOrUpdateMembership = async (req, res) => {
    try {
        // console.log(req)
        const membership = await createOrUpdateMembershipService(req.params.id, req.body, req.user._id);

        return res.status(200).json({
            success: true,
            data: membership,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getMembershipBySupplier = async (req, res) => {
    try {
        const membership = await getMembershipBySupplierService(req.params.id);

        return res.status(200).json({
            success: true,
            data: membership,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};