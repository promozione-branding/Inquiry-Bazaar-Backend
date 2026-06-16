import UserEmployee from "../models/userEmployee.model.js";

export const assignEmployeeService = async (data) => {
    const employee = await UserEmployee.findOneAndUpdate(
        { userId: data.userId, },
        data,
        { new: true, upsert: true, }
    );

    return employee;
};

export const getEmployeeService = async (userId) => {
    const employee = await UserEmployee.findOne({ userId, })
        .populate("userId", "name email role").lean();

    return employee;
};