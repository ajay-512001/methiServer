class EmployeeModel {
    static defaultUserValues = {
        email: "",
        full_name: "",
        number: "",
        password: "",
        role_id: 0,
        is_active: true,
        admin_id: 0,
        mngr_id: 0,
        tl_id: 0,
        snr_id: 0,
        isnumberverified: false,
        isemailverified: false,
    }; 

    static defaultEmployeeValues = {
        employee_id: null,
        user_id: null,
        joining_date: "",
        designation: "",
        picture: "",
        is_email: false,
        is_whatsapp: false
    };

    /**
     * Normalize an employee object to match the model
     * @param {Object} data - The raw database response or input object
     * @returns {Object} - Normalized employee object
     */
    static normalizeUser(data) {
        if (!data || typeof data !== "object") {
            return { ...this.defaultUserValues };
        }

        const normalizedData = { ...this.defaultUserValues };
        for (const key in normalizedData) {
            if (data.hasOwnProperty(key)) {
                normalizedData[key] = data[key];
            }
        }
        return normalizedData;
    }

    /**
     * Normalize an employee object to match the model
     * @param {Object} data - The raw database response or input object
     * @returns {Object} - Normalized employee object
     */
        static normalizeEmployee(data) {
            if (!data || typeof data !== "object") {
                return { ...this.defaultEmployeeValues };
            }
        
            const normalizedData = { ...this.defaultEmployeeValues };
            for (const key in normalizedData) {
                if (data.hasOwnProperty(key)) {
                    normalizedData[key] = data[key];
                }
            }
            return normalizedData;
        }
    

    /**
     * Create a new employee object from request payload
     * @param {Object} payload - The input data for employee creation
     * @returns {Object} - Normalized employee object
     */
    static fromPayloadUserMaster(payload) {
        return this.normalizeUser(payload);
    }

    /**
     * Create a new employee object from request payload
     * @param {Object} payload - The input data for employee creation
     * @returns {Object} - Normalized employee object
     */
        static fromPayloadEmployeeMaster(payload) {
            return this.normalizeEmployee(payload);
        }
}

module.exports = EmployeeModel;
