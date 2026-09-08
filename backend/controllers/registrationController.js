import { registerUser } from "../services/registrationService.js";

export const register = async (req, res, next) => {
  try {
    const result = await registerUser(req.body);

    let message;
    if (result.emailStatus === "Sent") {
      message = "Registration successful. Confirmation email sent.";
    } else {
      message = "Registration successful, but we couldn't send your confirmation email. Please contact us with your ACE ID if you don't receive it.";
    }

    res.status(201).json({
      success: true,
      message,
      aceId: result.aceId,
      registration: result.registration,
      emailStatus: result.emailStatus,
    });
  } catch (error) {
    next(error);
  }
};
