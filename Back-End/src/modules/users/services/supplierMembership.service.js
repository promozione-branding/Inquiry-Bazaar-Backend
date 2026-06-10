import Membership from "../models/userMembership.model.js";

export const createOrUpdateMembershipService = async (supplierId, data, adminId) => {
    // console.log(adminId)
    const membership = await Membership.findOneAndUpdate(
        { supplierId },
        { ...data, approvedBy: adminId, },
        { new: true, upsert: true, }
    );

    return membership;
};

export const getMembershipBySupplierService = async (supplierId) => {
    return await Membership.findOne({ supplierId, }).populate("approvedBy", "name email");
};