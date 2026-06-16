import { assignEmployeeService, getEmployeeService, } from "../services/employee.service.js";

export const assignEmployee = async (req, res) => {
    try {
        const employee = await assignEmployeeService(req.body);

        return res.status(200).json({
            success: true,
            message: "Employee assigned successfully",
            data: employee,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getEmployee = async (req, res) => {
    try {
        const { userId } = req.params;
        const employee = await getEmployeeService(userId);

        return res.status(200).json({
            success: true,
            data: employee,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};