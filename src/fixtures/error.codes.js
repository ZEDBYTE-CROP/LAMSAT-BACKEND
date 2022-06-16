// All strings must be different
module.exports = {
	// Errors on Table1
	T1_NOTHING_FOUND: "Table1: Nothing Found",
	T1_FIRST_CONSTRAINT: "Invalid First",
	T1_THIRD_CONSTRAINT: "Invalid Third",

	// Errors on Table2
	T2_NOTHING_FOUND: "Table2: Nothing Found",
	T1_SECOND_CONSTRAINT: "Invalid second",

	// Errors on Table1 & Table2
	T1_T2_NOTHING_FOUND: "Nothing found",

	// Errors on Users
	USERS_NOT_LOGGED_ERROR: "User not logged in",
	USERS_NOTHING_FOUND: "Invalid username or password",
	USERS_USERNAME_CONSTRAINT: "Email id or contact no. already exist",
	USERS_FORBIDDEN_REMOVE: "Remove forbidden",
	USERS_INVALID_ROLE: "Invalid Role",
	USERS_PASSWORD_MATCH: "Passwords does not match",
	USERS_VERIFICATION: "Verification is pending",
	USERS_ALREADY_EXIST: "UserName already exist",
	EMAIL_ALREADY_EXIST: "Email already exist",
	USERS_CHANGEPASSWORD_ERROR: "Old password and current password is same. So, please change.",
	USERS_CHANGEPASSWORD_CURRENT_ERROR: "Current Password Mismatch",
	// Errors on Auth
	AUTH_INVALID_CREDENTIALS: "Invalid crendentials",
	AUTH_ADMIN_RESTRICTION: "Restricted action",
	AUTH_ACCESS_DENIED: "Access denied",
	AUTH_INVALID_TOKEN: "Invalid token",
	AUTH_NO_TOKEN: "Token required",
	AUTH_UNAPPROVED: "Approval pending. Please contact the admin",
	AUTH_UNAPPROVED_TOKEN: "Vendor approval pending. Please contact the admin",
	AUTH_REJECT_TOKEN: "Vendor approval request has been rejected. Please contact the admin",
	AUTH_VERIFY_EMAILID: "Please verify your email id to login.",

	// Unknown Error
	UNKOWN_ERROR: "Unknown error",

	// Errors on Country
	COUNTRY_NOT_LOGGED_ERROR: "Country not logged",
	COUNTRY_NOTHING_FOUND: "Unknown country name",
	COUNTRY_USERNAME_CONSTRAINT: "Invalid country name",
	COUNTRY_FORBIDDEN_REMOVE: "Forbidden remove",
	COUNTRY_INVALID_ROLE: "Invalid role",
	ALREADY_EXIST: "Already exist!",

	//common
	NOTHING_FOUND: "Data does not exist",
	
	//otp
	INVALID_OTP: "Invalid Otp",
	INVALID_EMAIL: "Email does not match",

	// Errors on Voucher
	INVALID_COUPON: "Voucher coupon does not exist",
	USED_COUPON: "Voucher code already used",
	MINIMUM_CART_VALUE: "Insufficient amount to add this voucher coupon",

	//SHIFT ERROR
	MAX_SHIFT_EXCEED: "Maximum number of shift already exceeded per day",
	START_END_TIME_EXIST: "Start time or end time already exist",
	INVALID_VERIFICATION_CODE: "Invalid verification code. Please try again."
};
