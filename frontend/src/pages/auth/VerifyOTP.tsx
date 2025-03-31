import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import XSvg from "../../components/X";
import { useMutation } from "@tanstack/react-query";
import axios, { isAxiosError } from "axios";
import toast from "react-hot-toast";

interface VerifyOTPState {
  email: string;
  otp: string;
}

const VerifyOTP = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<VerifyOTPState>({
    email: "",
    otp: "",
  });

  // Check for saved email on component mount
  useEffect(() => {
    const savedEmail = sessionStorage.getItem("resetEmail");
    if (savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail }));
    } else {
      navigate("/forgot-password");
      toast.error("Please enter your email first");
    }
  }, [navigate]);

  const { mutate: verifyOtpMutation, isPending } = useMutation({
    mutationFn: async ({ email, otp }: VerifyOTPState) => {
      try {
        const res = await axios.post(
          "/api/auth/verify-otp",
          { email, otp },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        return res.data;
      } catch (error) {
        if (isAxiosError(error)) {
          const errorMsg =
            error.response?.data?.message || "Failed to verify OTP";
          toast.error(errorMsg);
        } else {
          console.error(error);
          toast.error("An unexpected error occurred");
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      toast.success("OTP verified successfully");
      // Store the reset token for the reset password page
      sessionStorage.setItem("resetToken", data.resetToken);
      navigate("/reset-password");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }
    verifyOtpMutation(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Only allow digits for OTP field and limit to 6 characters
    if (name === "otp" && !/^\d*$/.test(value)) {
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: name === "otp" ? value.slice(0, 6) : value,
    }));
  };

  const handleResendOTP = async () => {
    try {
      await axios.post(
        "/api/auth/forgot-password",
        { email: formData.email },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("OTP resent to your email");
    } catch (error) {
      if (isAxiosError(error)) {
        const errorMsg =
          error.response?.data?.message || "Failed to resend OTP";
        toast.error(errorMsg);
      } else {
        console.error(error);
        toast.error("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="w-full h-screen flex bg-black text-white">
      {/* Left Panel with Logo - Hidden on mobile, 50% on desktop */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-900 items-center justify-center relative overflow-hidden">
        <div className="absolute w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent_50%)]"></div>
        <XSvg className="w-2/3 fill-zinc-800" />
      </div>

      {/* Right Panel - Full width on mobile, 50% on desktop */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center lg:items-start">
            <XSvg className="w-12 h-12 lg:hidden fill-white mb-6" />
            <h1 className="text-3xl font-bold tracking-tight">
              Verify your identity
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Enter the 6-digit OTP sent to {formData.email}
            </p>
          </div>

          <div className="mt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-zinc-400"
                >
                  One-Time Password (OTP)
                </label>
                <div className="mt-1">
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    value={formData.otp}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-0 bg-zinc-900 py-2 px-3 text-white shadow-sm ring-1 ring-inset ring-zinc-700 focus:ring-2 focus:ring-zinc-500 focus:outline-none sm:text-sm sm:leading-6 tracking-widest text-center text-xl"
                    placeholder="------"
                    maxLength={6}
                    autoComplete="one-time-code"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-200"
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="loading loading-spinner loading-sm"></span>
                      Verifying...
                    </span>
                  ) : (
                    "Verify OTP"
                  )}
                </button>
              </div>
            </form>

            <div className="mt-4 flex flex-col items-center gap-4">
              <p className="text-sm text-zinc-500">
                Didn't receive the code?{" "}
                <button
                  className="text-blue-500 hover:text-blue-400"
                  onClick={handleResendOTP}
                >
                  Resend OTP
                </button>
              </p>

              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-zinc-400 hover:text-white"
              >
                Change email address
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
